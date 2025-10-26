export interface TranscriptionWord {
  word: string;
  timestamp: number;
  confidence: number;
}

export interface TranscriptionResult {
  text: string;
  words: TranscriptionWord[];
  confidence: number;
}

export const transcribeAudio = async (file: File): Promise<TranscriptionResult> => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error("Speech recognition not supported in this browser"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const audio = new Audio();
    audio.src = URL.createObjectURL(file);

    let fullTranscript = '';
    const words: TranscriptionWord[] = [];
    let currentTime = 0;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          fullTranscript += transcript + ' ';

          const wordsArray = transcript.trim().split(/\s+/);
          wordsArray.forEach((word: string) => {
            words.push({
              word: word.toLowerCase(),
              timestamp: currentTime,
              confidence,
            });
            currentTime += 0.5;
          });
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      URL.revokeObjectURL(audio.src);
      reject(new Error(`Speech recognition failed: ${event.error}`));
    };

    recognition.onend = () => {
      URL.revokeObjectURL(audio.src);

      if (fullTranscript.trim().length === 0) {
        reject(new Error("No speech detected in audio"));
        return;
      }

      const avgConfidence = words.reduce((sum, w) => sum + w.confidence, 0) / words.length;

      resolve({
        text: fullTranscript.trim(),
        words,
        confidence: avgConfidence || 0.85,
      });
    };

    audio.onloadedmetadata = () => {
      recognition.start();
      audio.play();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      reject(new Error("Failed to load audio file"));
    };
  });
};

export const isSpeechRecognitionSupported = (): boolean => {
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
};
