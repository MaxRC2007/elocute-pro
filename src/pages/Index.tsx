import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Mic, BarChart3, MessageSquare, Target } from "lucide-react";
import AudioUpload from "@/components/AudioUpload";
import AnalysisTab from "@/components/AnalysisTab";
import TimelineTab from "@/components/TimelineTab";
import CoachingTab from "@/components/CoachingTab";
import PracticeMode from "@/components/PracticeMode";

const Index = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Elocute Pro
          </h1>
          <p className="text-muted-foreground">
            AI-Powered Presentation Coaching
          </p>
        </header>

        <Card className="mb-8 p-6 border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
          <AudioUpload onFileSelect={setAudioFile} onAnalysisComplete={setAnalysisData} />
        </Card>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="coaching" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Coaching</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <AnalysisTab data={analysisData} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab data={analysisData} />
          </TabsContent>

          <TabsContent value="coaching">
            <CoachingTab data={analysisData} />
          </TabsContent>

          <TabsContent value="practice">
            <PracticeMode />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
