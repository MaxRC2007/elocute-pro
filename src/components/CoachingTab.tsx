import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Sparkles, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/utils/audioAnalyzer";

interface CoachingTabProps {
  data: AnalysisResult | null;
}

const CoachingTab = ({ data }: CoachingTabProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [coaching, setCoaching] = useState<string>("");
  const { toast } = useToast();

  const generateCoaching = async () => {
    if (!data) return;

    setIsGenerating(true);
    try {
      const { data: response, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          transcript: data.transcript.substring(0, 500),
          fullTranscript: data.transcript,
          fillerCount: data.fillerWords.length,
          pace: data.pace.average,
          clarity: data.clarity.score || Math.round(data.clarity.vocabularyRichness * 100),
        },
      });

      if (error) throw error;

      setCoaching(response.coaching);
      toast({
        title: "Coaching generated!",
        description: "Your personalized coaching insights are ready.",
      });
    } catch (error) {
      console.error("Coaching error:", error);
      toast({
        title: "Error",
        description: "Failed to generate coaching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!data) {
    return (
      <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Upload an audio file to get AI coaching insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 animate-fade-in">
      <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl shadow-[0_0_30px_hsl(var(--primary)/0.15)] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Presentation Coach
          </CardTitle>
          <CardDescription>
            Get personalized insights and actionable improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!coaching ? (
            <Button
              onClick={generateCoaching}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing your presentation...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Generate AI Coaching
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-card to-secondary/30 p-6 rounded-lg border border-primary/20">
                <div className="prose prose-sm max-w-none prose-invert">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {coaching}
                  </div>
                </div>
              </div>
              <Button
                onClick={generateCoaching}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                Regenerate Coaching
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachingTab;
