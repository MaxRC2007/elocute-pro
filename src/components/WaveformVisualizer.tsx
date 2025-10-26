import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  audioFile: File | null;
  isProcessing?: boolean;
}

const WaveformVisualizer = ({ audioFile, isProcessing }: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioFile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audioContext = new AudioContext();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / canvas.width);
        const amp = canvas.height / 2;

        ctx.fillStyle = "rgba(15, 23, 42, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, "hsl(271, 91%, 65%)");
        gradient.addColorStop(0.5, "hsl(280, 91%, 65%)");
        gradient.addColorStop(1, "hsl(195, 100%, 60%)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < canvas.width; i++) {
          const min = Math.min(...data.slice(i * step, (i + 1) * step));
          const max = Math.max(...data.slice(i * step, (i + 1) * step));
          
          ctx.moveTo(i, (1 + min) * amp);
          ctx.lineTo(i, (1 + max) * amp);
        }

        ctx.stroke();
      } catch (error) {
        console.error("Error visualizing waveform:", error);
      }
    };

    reader.readAsArrayBuffer(audioFile);

    return () => {
      audioContext.close();
    };
  }, [audioFile]);

  if (!audioFile && !isProcessing) {
    return null;
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full h-auto"
      />
    </div>
  );
};

export default WaveformVisualizer;
