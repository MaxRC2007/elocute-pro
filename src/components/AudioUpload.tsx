import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyzeAudio } from "@/utils/audioAnalyzer";

interface AudioUploadProps {
  onFileSelect: (file: File | null) => void;
  onAnalysisComplete: (data: any) => void;
}

const AudioUpload = ({ onFileSelect, onAnalysisComplete }: AudioUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/webm"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, M4A, or WebM)",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    onFileSelect(file);
    setIsProcessing(true);

    try {
      const analysisResult = await analyzeAudio(file);
      onAnalysisComplete(analysisResult);
      toast({
        title: "Analysis complete!",
        description: "Your presentation has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-md">
        <label
          htmlFor="audio-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors border-primary/30 bg-gradient-to-br from-card to-background"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isProcessing ? (
              <Loader2 className="w-10 h-10 mb-2 text-primary animate-spin" />
            ) : (
              <Upload className="w-10 h-10 mb-2 text-primary" />
            )}
            <p className="mb-2 text-sm text-foreground">
              <span className="font-semibold">
                {fileName || "Click to upload"}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              MP3, WAV, M4A, or WebM (MAX. 50MB)
            </p>
          </div>
          <input
            id="audio-upload"
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </label>
      </div>
      {isProcessing && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Analyzing your presentation...
        </p>
      )}
    </div>
  );
};

export default AudioUpload;
