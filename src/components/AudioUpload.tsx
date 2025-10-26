import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyzeAudio } from "@/utils/comprehensiveAnalyzer";

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
      const errorMessage = error instanceof Error ? error.message : "There was an error analyzing your audio. Please try again.";
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-2xl">
        <label
          htmlFor="audio-upload"
          className={`group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${
            isProcessing
              ? "border-primary/50 bg-gradient-card animate-pulse"
              : "border-primary/30 hover:border-primary/60 bg-gradient-card backdrop-blur-xl"
          }`}
          style={{
            boxShadow: isProcessing ? "0 0 40px hsl(var(--primary) / 0.3)" : "0 0 20px hsl(var(--primary) / 0.1)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col items-center justify-center pt-8 pb-8 px-6">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">Analyzing your presentation...</p>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mb-4">
                  <Upload className="w-16 h-16 text-primary transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 blur-2xl bg-primary/20 group-hover:bg-primary/30 transition-all" />
                </div>
                <p className="mb-2 text-lg font-semibold text-foreground">
                  {fileName || "Drop your audio file here"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">MP3</span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">WAV</span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">M4A</span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">WebM</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Maximum file size: 50MB</p>
              </>
            )}
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
    </div>
  );
};

export default AudioUpload;
