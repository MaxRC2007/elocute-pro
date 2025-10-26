import { getSupabase } from "@/lib/supabaseClient";
import { processAudioFile } from "@/lib/audioProcessor";
import { transcribeAudio, isSpeechRecognitionSupported } from "@/lib/speechRecognition";

export interface FillerWord {
  word: string;
  timestamp: number;
  context: string;
}

export interface AnalysisResult {
  transcript: string;
  fillerWords: FillerWord[];
  pace: {
    average: number;
    windows: { timestamp: number; wpm: number }[];
  };
  clarity: {
    avgSentenceLength: number;
    vocabularyRichness: number;
  };
  duration: number;
  confidence: number;
  silentPauses: { start: number; duration: number }[];
  pitchVariance: number;
}

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "so", "basically", "actually",
  "literally", "kind of", "sort of", "i mean", "you see", "right"
];

const detectFillerWords = (transcript: string, words?: any[]): FillerWord[] => {
  const fillerWords: FillerWord[] = [];
  const transcriptWords = transcript.toLowerCase().split(/\s+/);

  transcriptWords.forEach((word, index) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '');

    if (FILLER_WORDS.includes(cleanWord)) {
      const context = transcriptWords
        .slice(Math.max(0, index - 4), Math.min(transcriptWords.length, index + 5))
        .join(" ");

      const timestamp = words?.[index]?.timestamp || index * 0.5;

      fillerWords.push({
        word: cleanWord,
        timestamp,
        context,
      });
    }
  });

  const twoWordFillers = ["you know", "i mean", "kind of", "sort of", "you see"];
  for (let i = 0; i < transcriptWords.length - 1; i++) {
    const twoWord = `${transcriptWords[i]} ${transcriptWords[i + 1]}`;
    if (twoWordFillers.includes(twoWord)) {
      const context = transcriptWords
        .slice(Math.max(0, i - 3), Math.min(transcriptWords.length, i + 6))
        .join(" ");

      fillerWords.push({
        word: twoWord,
        timestamp: words?.[i]?.timestamp || i * 0.5,
        context,
      });
    }
  }

  return fillerWords;
};

const calculatePace = (transcript: string, duration: number) => {
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  const averagePace = (totalWords / duration) * 60;

  const windowSize = 30;
  const wordsPerSecond = totalWords / duration;
  const windows = [];

  for (let t = 0; t < duration; t += windowSize) {
    const windowEnd = Math.min(t + windowSize, duration);
    const windowDuration = windowEnd - t;
    const windowWords = wordsPerSecond * windowDuration;
    const wpm = (windowWords / windowDuration) * 60;

    windows.push({
      timestamp: t,
      wpm: Math.round(wpm),
    });
  }

  return { average: Math.round(averagePace), windows };
};

const calculateClarity = (transcript: string) => {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);

  const avgSentenceLength = sentences.length > 0
    ? words.length / sentences.length
    : 0;

  const uniqueWords = new Set(words.filter(w => w.length > 3));
  const vocabularyRichness = words.length > 0 ? uniqueWords.size / words.length : 0;

  return {
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    vocabularyRichness: Math.round(vocabularyRichness * 100) / 100,
  };
};

export const analyzeAudio = async (file: File): Promise<AnalysisResult> => {
  try {
    const audioMetrics = await processAudioFile(file);

    let transcript = '';
    let words: any[] = [];
    let confidence = 0;

    try {
      const supabase = getSupabase();
      const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke(
        "transcribe-audio",
        {
          body: {
            audio: await file.arrayBuffer().then(buffer =>
              btoa(String.fromCharCode(...new Uint8Array(buffer)))
            ),
          },
        }
      );

      if (!transcriptError && transcriptData?.text) {
        transcript = transcriptData.text;
        confidence = 0.9;
      } else {
        throw new Error("API transcription failed");
      }
    } catch (apiError) {
      console.warn("API transcription failed, trying browser speech recognition:", apiError);

      if (isSpeechRecognitionSupported()) {
        try {
          const result = await transcribeAudio(file);
          transcript = result.text;
          words = result.words;
          confidence = result.confidence;
        } catch (speechError) {
          console.error("Speech recognition failed:", speechError);
          throw new Error("Unable to transcribe audio. Please try a different file or check your microphone permissions.");
        }
      } else {
        throw new Error("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
      }
    }

    if (!transcript || transcript.trim().length === 0) {
      throw new Error("No speech detected in the audio file");
    }

    const fillerWords = detectFillerWords(transcript, words);
    const pace = calculatePace(transcript, audioMetrics.duration);
    const clarity = calculateClarity(transcript);

    return {
      transcript,
      fillerWords,
      pace,
      clarity,
      duration: audioMetrics.duration,
      confidence,
      silentPauses: audioMetrics.silentPauses,
      pitchVariance: audioMetrics.pitchVariance,
    };
  } catch (error) {
    console.error("Analysis error:", error);
    throw error instanceof Error ? error : new Error("Failed to analyze audio");
  }
};
