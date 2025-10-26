import { useEffect, useRef, useState } from "react";
import { extractWaveformData } from "@/lib/audioProcessor";

interface EnhancedWaveformProps {
  audioFile: File | null;
}

const EnhancedWaveform = ({ audioFile }: EnhancedWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!audioFile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsLoading(true);

    const visualize = async () => {
      try {
        const waveformData = await extractWaveformData(audioFile, canvas.width);

        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, "hsl(195, 100%, 50%)");
        gradient.addColorStop(0.5, "hsl(220, 91%, 55%)");
        gradient.addColorStop(1, "hsl(271, 91%, 60%)");

        const barWidth = canvas.width / waveformData.length;
        const centerY = canvas.height / 2;

        waveformData.forEach((value, index) => {
          const x = index * barWidth;
          const barHeight = Math.max(value * canvas.height * 0.9, 2);

          ctx.shadowColor = "hsl(195, 100%, 50%)";
          ctx.shadowBlur = 8;
          ctx.fillStyle = gradient;
          ctx.fillRect(x, centerY - barHeight / 2, Math.max(barWidth - 1, 1), barHeight);
        });

        ctx.shadowBlur = 0;
        setIsLoading(false);
      } catch (error) {
        console.error("Error visualizing waveform:", error);
        setIsLoading(false);
      }
    };

    visualize();
  }, [audioFile]);

  if (!audioFile) {
    return null;
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glassmorphic animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <canvas
        ref={canvasRef}
        width={1000}
        height={150}
        className="w-full h-auto"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur">
          <p className="text-sm text-muted-foreground animate-pulse">Generating waveform...</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedWaveform;
