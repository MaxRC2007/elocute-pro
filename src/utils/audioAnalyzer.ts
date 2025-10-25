import { supabase } from "@/integrations/supabase/client";

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
}

const FILLER_WORDS = ["um", "uh", "like", "you know", "so", "basically", "actually", "literally"];

export const analyzeAudio = async (file: File): Promise<AnalysisResult> => {
  try {
    // Convert audio to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // Call transcription edge function
    const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke(
      "transcribe-audio",
      {
        body: { audio: base64Audio },
      }
    );

    if (transcriptError) throw transcriptError;

    const transcript = transcriptData.text || "";
    const words = transcript.toLowerCase().split(/\s+/);
    
    // Detect filler words
    const fillerWords: FillerWord[] = [];
    words.forEach((word, index) => {
      if (FILLER_WORDS.includes(word)) {
        const context = words.slice(Math.max(0, index - 3), index + 4).join(" ");
        fillerWords.push({
          word,
          timestamp: index * 0.5, // Approximate timestamp
          context,
        });
      }
    });

    // Calculate speaking pace (words per minute)
    const duration = 120; // Mock duration - in real app, get from audio file
    const totalWords = words.length;
    const averagePace = (totalWords / duration) * 60;

    // Calculate pace windows (30-second intervals)
    const windowSize = 30;
    const wordsPerWindow = Math.floor((windowSize / duration) * totalWords);
    const paceWindows = [];
    
    for (let i = 0; i < Math.floor(duration / windowSize); i++) {
      paceWindows.push({
        timestamp: i * windowSize,
        wpm: (wordsPerWindow / windowSize) * 60,
      });
    }

    // Calculate clarity metrics
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    const uniqueWords = new Set(words);
    const vocabularyRichness = uniqueWords.size / words.length;

    return {
      transcript,
      fillerWords,
      pace: {
        average: averagePace,
        windows: paceWindows,
      },
      clarity: {
        avgSentenceLength,
        vocabularyRichness,
      },
      duration,
    };
  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error("Failed to analyze audio");
  }
};
