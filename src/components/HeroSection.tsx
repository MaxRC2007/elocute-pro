import { useEffect, useRef } from "react";
import prismLogo from "@/assets/prism-logo.png";

const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = 400;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      hue: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        hue: Math.random() * 60 + 260, // Purple to cyan range
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, 0.6)`;
        ctx.fill();

        // Draw connections
        particles.forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(${p.hue}, 100%, 60%, ${0.2 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 400;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative h-[450px] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <img 
          src={prismLogo} 
          alt="PRISM Logo" 
          className="h-32 mb-6 animate-float drop-shadow-[0_0_40px_rgba(139,92,246,0.8)]" 
        />
        <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
          AI Presentation Coach
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
          Transform your speaking skills with real-time AI analysis, filler word detection, and personalized coaching
        </p>
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Real-time Analysis</span>
          </div>
          <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>AI Coaching</span>
          </div>
          <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: "600ms" }}>
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>Instant Feedback</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default HeroSection;
