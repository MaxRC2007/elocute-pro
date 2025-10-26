import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PracticeMode = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [fillerCount, setFillerCount] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setFillerCount(0);

      toast({
        title: "Recording started",
        description: "Speak clearly and we'll analyze your presentation in real-time",
      });
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Your practice session has been saved",
      });
    }
  };

  return (
    <div className="grid gap-6 animate-fade-in">
      <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl shadow-[0_0_30px_hsl(var(--primary)/0.15)] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            Live Practice Mode
          </CardTitle>
          <CardDescription>
            Record yourself and get real-time feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                className="w-full max-w-xs h-16 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Play className="mr-2 h-6 w-6" />
                Start Practice Session
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="w-full max-w-xs h-16 text-lg animate-pulse"
              >
                <Square className="mr-2 h-6 w-6" />
                Stop Recording
              </Button>
            )}

            {isRecording && (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse flex items-center justify-center mb-4 mx-auto">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                <p className="text-lg font-semibold">Recording in progress...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Filler words detected: <span className="text-accent font-bold">{fillerCount}</span>
                </p>
              </div>
            )}

            {recordedAudio && !isRecording && (
              <div className="w-full max-w-md">
                <audio controls className="w-full">
                  <source src={URL.createObjectURL(recordedAudio)} type="audio/webm" />
                </audio>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
        <CardHeader>
          <CardTitle>Practice Tips</CardTitle>
          <CardDescription>Get the most out of your practice sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Aim for 140-160 words per minute for optimal comprehension</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Pause naturally between sentences - silence is powerful</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Replace filler words with brief pauses instead</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Vary your tone and energy to maintain engagement</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeMode;
