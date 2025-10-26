import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeroSection from "@/components/HeroSection";
import AudioUpload from "@/components/AudioUpload";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import AnalysisTab from "@/components/AnalysisTab";
import TimelineTab from "@/components/TimelineTab";
import CoachingTab from "@/components/CoachingTab";
import PracticeMode from "@/components/PracticeMode";
import ParticleBackground from "@/components/ParticleBackground";
import type { AnalysisResult } from "@/utils/audioAnalyzer";

const Index = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" style={{ zIndex: 1 }} />
      
      <div className="relative z-10">
        <HeroSection />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
            <div className="space-y-6">
              <AudioUpload onFileSelect={setAudioFile} onAnalysisComplete={setAnalysisData} />
              {audioFile && <WaveformVisualizer audioFile={audioFile} />}
            </div>
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-14 bg-card/50 backdrop-blur-xl border border-primary/20 p-1 rounded-xl">
                <TabsTrigger 
                  value="analysis" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-primary/10"
                >
                  📊 Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-primary/10"
                >
                  📈 Timeline
                </TabsTrigger>
                <TabsTrigger 
                  value="coaching" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-primary/10"
                >
                  🎯 AI Coaching
                </TabsTrigger>
                <TabsTrigger 
                  value="practice" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-primary/10"
                >
                  💪 Practice
                </TabsTrigger>
              </TabsList>
              <TabsContent value="analysis" className="mt-8 animate-fade-in"><AnalysisTab data={analysisData} /></TabsContent>
              <TabsContent value="timeline" className="mt-8 animate-fade-in"><TimelineTab data={analysisData} /></TabsContent>
              <TabsContent value="coaching" className="mt-8 animate-fade-in"><CoachingTab data={analysisData} /></TabsContent>
              <TabsContent value="practice" className="mt-8 animate-fade-in"><PracticeMode /></TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
