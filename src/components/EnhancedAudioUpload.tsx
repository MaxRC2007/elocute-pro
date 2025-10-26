import { useState, useRef } from "react";
import { Upload, Loader2, File, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeAudio } from "@/utils/comprehensiveAnalyzer";

interface EnhancedAudioUploadProps {
  onFileSelect: (file: File | null) => void;
  onAnalysisComplete: (data: any) => void;
}

const EnhancedAudioUpload = ({ onFileSelect, onAnalysisComplete }: EnhancedAudioUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFile = async (file: File) => {
    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/webm", "audio/x-m4a"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|webm)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, M4A, or WebM)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    onFileSelect(file);
    setIsProcessing(true);
    setProgress(10);

    try {
      setProgress(30);
      const analysisResult = await analyzeAudio(file);
      setProgress(100);

      setTimeout(() => {
        onAnalysisComplete(analysisResult);
        toast({
          title: "Analysis complete!",
          description: `Found ${analysisResult.fillerWords.length} filler words. Confidence: ${Math.round(analysisResult.confidence * 100)}%`,
        });
      }, 500);
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "There was an error analyzing your audio. Please try again.";
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
      setProgress(0);
    } finally {
      setTimeout(() => setIsProcessing(false), 600);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto animate-slide-up">
      <div
        className={`relative w-full transition-all duration-300 ${
          isDragging ? "scale-105" : "scale-100"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label
          htmlFor="audio-upload"
          className={`group relative flex flex-col items-center justify-center w-full min-h-[280px] rounded-2xl cursor-pointer transition-all duration-500 glassmorphic overflow-hidden ${
            isProcessing ? "animate-pulse-glow" : ""
          } ${
            isDragging ? "border-primary border-2 glow-cyan" : "border-primary/30 hover:border-primary/60"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center p-8 w-full">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="relative">
                  <Loader2 className="w-20 h-20 text-primary animate-spin" />
                  <div className="absolute inset-0 blur-2xl bg-primary/40 animate-pulse" />
                </div>

                <div className="flex flex-col items-center gap-3 w-full max-w-md">
                  <p className="text-xl font-semibold text-foreground">Analyzing your presentation...</p>

                  <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden backdrop-blur">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">{progress}% complete</p>

                  <div className="flex gap-2 mt-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 className="w-16 h-16 text-green-400" />
                <div className="flex items-center gap-3 bg-secondary/50 px-6 py-3 rounded-xl backdrop-blur">
                  <File className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{fileName}</p>
                    <p className="text-xs text-muted-foreground">{fileSize}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Upload another file to analyze</p>
              </div>
            ) : (
              <>
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <Upload className="relative w-20 h-20 text-primary transition-transform group-hover:scale-110 duration-300" />
                </div>

                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {isDragging ? "Drop your file here" : "Upload Audio File"}
                </h3>

                <p className="text-base text-muted-foreground mb-6">
                  {isDragging ? "Release to upload" : "Drag and drop or click to browse"}
                </p>

                <div className="flex gap-3 flex-wrap justify-center mb-4">
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-primary/20 text-primary border border-primary/40 backdrop-blur">MP3</span>
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-primary/20 text-primary border border-primary/40 backdrop-blur">WAV</span>
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-primary/20 text-primary border border-primary/40 backdrop-blur">M4A</span>
                  <span className="px-4 py-2 text-sm font-medium rounded-full bg-primary/20 text-primary border border-primary/40 backdrop-blur">WebM</span>
                </div>

                <p className="text-xs text-muted-foreground">Maximum file size: 50MB</p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            id="audio-upload"
            type="file"
            className="hidden"
            accept="audio/*,.mp3,.wav,.m4a,.webm"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </label>
      </div>
    </div>
  );
};

export default EnhancedAudioUpload;
