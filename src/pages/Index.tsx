import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeroSection from "@/components/HeroSection";
import EnhancedAudioUpload from "@/components/EnhancedAudioUpload";
import EnhancedWaveform from "@/components/EnhancedWaveform";
import AnalysisTab from "@/components/AnalysisTab";
import TimelineTab from "@/components/TimelineTab";
import CoachingTab from "@/components/CoachingTab";
import PracticeMode from "@/components/PracticeMode";
import type { AnalysisResult } from "@/utils/comprehensiveAnalyzer";

const Index = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-6">
            <EnhancedAudioUpload onFileSelect={setAudioFile} onAnalysisComplete={setAnalysisData} />
            {audioFile && <EnhancedWaveform audioFile={audioFile} />}
          </div>
          
          {analysisData && (
            <Tabs defaultValue="analysis" className="w-full animate-fade-in">
              <TabsList className="grid w-full grid-cols-4 h-14 glassmorphic p-1 rounded-xl">
                <TabsTrigger 
                  value="analysis" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-lg transition-all font-semibold"
                >
                  Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-lg transition-all font-semibold"
                >
                  Timeline
                </TabsTrigger>
                <TabsTrigger 
                  value="coaching" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-lg transition-all font-semibold"
                >
                  AI Coaching
                </TabsTrigger>
                <TabsTrigger 
                  value="practice" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-lg transition-all font-semibold"
                >
                  Practice
                </TabsTrigger>
              </TabsList>
              <TabsContent value="analysis" className="mt-8">
                <AnalysisTab data={analysisData} />
              </TabsContent>
              <TabsContent value="timeline" className="mt-8">
                <TimelineTab data={analysisData} />
              </TabsContent>
              <TabsContent value="coaching" className="mt-8">
                <CoachingTab data={analysisData} />
              </TabsContent>
              <TabsContent value="practice" className="mt-8">
                <PracticeMode />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
