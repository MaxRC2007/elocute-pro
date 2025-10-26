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
    score: number;
  };
  duration: number;
}

const FILLER_WORDS = ["um", "uh", "like", "you know", "so", "basically", "actually", "literally"];

export const analyzeAudio = async (file: File): Promise<AnalysisResult> => {
  try {
    // Convert audio to base64 in chunks to prevent memory issues
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const chunkSize = 32768;
    let base64Audio = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      const chunkString = Array.from(chunk).map(byte => String.fromCharCode(byte)).join('');
      base64Audio += btoa(chunkString);
    }

    // Get audio duration
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const duration = audioBuffer.duration;

    // Call transcription edge function
    const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke(
      "transcribe-audio",
      {
        body: { audio: base64Audio },
      }
    );

    if (transcriptError) throw transcriptError;

    const transcript = transcriptData.text || "";
    const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    // Enhanced filler word detection with regex patterns
    const fillerPatterns = [
      { pattern: /\bum\b/gi, word: 'um' },
      { pattern: /\buh\b/gi, word: 'uh' },
      { pattern: /\blike\b/gi, word: 'like' },
      { pattern: /\byou know\b/gi, word: 'you know' },
      { pattern: /\bso\b/gi, word: 'so' },
      { pattern: /\bbasically\b/gi, word: 'basically' },
      { pattern: /\bactually\b/gi, word: 'actually' },
      { pattern: /\bliterally\b/gi, word: 'literally' },
    ];

    const fillerWords: FillerWord[] = [];
    const sentencesWithTimestamps = transcript.split(/[.!?]+/).filter(s => s.trim());
    
    fillerPatterns.forEach(({ pattern, word }) => {
      let match;
      while ((match = pattern.exec(transcript)) !== null) {
        const beforeMatch = transcript.substring(0, match.index);
        const wordIndex = beforeMatch.split(/\s+/).length;
        const estimatedTimestamp = (wordIndex / words.length) * duration;
        
        // Get context (surrounding words)
        const contextStart = Math.max(0, match.index - 50);
        const contextEnd = Math.min(transcript.length, match.index + 50);
        const context = transcript.substring(contextStart, contextEnd).trim();
        
        fillerWords.push({
          word,
          timestamp: estimatedTimestamp,
          context: context.length < 100 ? context : '...' + context,
        });
      }
    });

    // Calculate speaking pace with improved accuracy
    const totalWords = words.length;
    const averagePace = duration > 0 ? (totalWords / duration) * 60 : 0;

    // Calculate pace windows (30-second intervals)
    const windowSize = 30;
    const paceWindows = [];
    
    for (let i = 0; i < Math.floor(duration / windowSize); i++) {
      const windowStart = i * windowSize;
      const windowEnd = (i + 1) * windowSize;
      const wordsInWindow = Math.floor(
        (totalWords * (windowEnd - windowStart)) / duration
      );
      const wpm = (wordsInWindow / windowSize) * 60;
      
      paceWindows.push({
        timestamp: windowStart,
        wpm: Math.round(wpm * 10) / 10,
      });
    }

    // Enhanced clarity score calculation
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength = sentences.length > 0 
      ? sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length 
      : 0;
    const uniqueWords = new Set(words);
    const vocabularyRichness = words.length > 0 ? uniqueWords.size / words.length : 0;
    
    // Clarity score based on multiple factors
    const fillerRatio = totalWords > 0 ? fillerWords.length / totalWords : 0;
    const clarityScore = Math.max(0, Math.min(100, 100 - (fillerRatio * 500)));

    return {
      transcript,
      fillerWords,
      pace: {
        average: Math.round(averagePace * 10) / 10,
        windows: paceWindows,
      },
      clarity: {
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        vocabularyRichness: Math.round(vocabularyRichness * 1000) / 1000,
        score: Math.round(clarityScore * 10) / 10,
      },
      duration: Math.round(duration * 10) / 10,
    };
  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error("Failed to analyze audio");
  }
};
