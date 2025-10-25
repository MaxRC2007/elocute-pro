import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import type { AnalysisResult } from "@/utils/audioAnalyzer";

interface AnalysisTabProps {
  data: AnalysisResult | null;
}

const AnalysisTab = ({ data }: AnalysisTabProps) => {
  if (!data) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Upload an audio file to see your presentation analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  const fillerPercentage = (data.fillerWords.length / data.transcript.split(/\s+/).length) * 100;
  const paceScore = data.pace.average >= 140 && data.pace.average <= 160 ? 100 : 70;
  const clarityScore = data.clarity.vocabularyRichness * 100;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Speaking Pace
          </CardTitle>
          <CardDescription>Average words per minute</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-primary">
            {Math.round(data.pace.average)} WPM
          </div>
          <Progress value={paceScore} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {data.pace.average >= 140 && data.pace.average <= 160
              ? "Perfect pace!"
              : data.pace.average > 160
              ? "Slow down a bit"
              : "Try speaking faster"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" />
            Filler Words
          </CardTitle>
          <CardDescription>Um, uh, like, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-accent">
            {data.fillerWords.length}
          </div>
          <Progress value={Math.max(0, 100 - fillerPercentage * 2)} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {fillerPercentage < 2 ? "Excellent!" : fillerPercentage < 5 ? "Good" : "Needs improvement"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Clarity Score
          </CardTitle>
          <CardDescription>Vocabulary diversity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-primary">
            {Math.round(clarityScore)}%
          </div>
          <Progress value={clarityScore} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {clarityScore > 70 ? "Excellent variety" : "Try using more diverse words"}
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3 border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
          <CardDescription>Your presentation transcript</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <p className="text-sm leading-relaxed">{data.transcript}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisTab;
