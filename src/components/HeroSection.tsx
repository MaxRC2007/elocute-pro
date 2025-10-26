import prismLogo from "@/assets/prism-logo.png";
import ParticleCanvas from "./ParticleCanvas";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] border-b border-primary/30">
      <ParticleCanvas />
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent animate-pulse" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img 
              src={prismLogo} 
              alt="PRISM Logo" 
              className="w-24 h-24 drop-shadow-[0_0_25px_rgba(139,92,246,0.8)] animate-pulse"
              style={{ animation: "pulse 3s ease-in-out infinite" }}
            />
            <h1 className="text-7xl font-extrabold bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_40px_rgba(139,92,246,0.5)]">
              PRISM
            </h1>
          </div>
          
          <p className="text-2xl text-foreground/90 font-light tracking-wide drop-shadow-lg">
            ✨ Transform Your Presentations with AI-Powered Speech Analysis ✨
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glassmorphic">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Real-time Analysis
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glassmorphic">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
              AI Coaching
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glassmorphic">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
              Advanced Metrics
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default HeroSection;
