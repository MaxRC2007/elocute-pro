import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, MessageSquare } from "lucide-react";
import type { AnalysisResult } from "@/utils/comprehensiveAnalyzer";

interface AnalysisTabProps {
  data: AnalysisResult | null;
}

const AnalysisTab = ({ data }: AnalysisTabProps) => {
  if (!data) {
    return (
      <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">Upload an audio file to see detailed analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl shadow-[0_0_30px_hsl(var(--primary)/0.15)] overflow-hidden group hover:shadow-[0_0_50px_hsl(var(--primary)/0.25)] transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filler Words Detected</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{data.fillerWords.length}</div>
            <Progress value={Math.min((data.fillerWords.length / 50) * 100, 100)} className="mt-4 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {data.fillerWords.length < 10 && "Excellent! Very few fillers"}
              {data.fillerWords.length >= 10 && data.fillerWords.length < 25 && "Good, room for improvement"}
              {data.fillerWords.length >= 25 && "Focus on reducing fillers"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl shadow-[0_0_30px_hsl(var(--primary)/0.15)] overflow-hidden group hover:shadow-[0_0_50px_hsl(var(--primary)/0.25)] transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Speaking Pace</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">{Math.round(data.pace.average)} WPM</div>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-500" style={{ width: `${Math.min((data.pace.average / 200) * 100, 100)}%` }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {data.pace.average < 120 && "📉 Too slow - pick up the pace"}
              {data.pace.average >= 120 && data.pace.average <= 160 && "✨ Perfect pace!"}
              {data.pace.average > 160 && "📈 Too fast - slow down"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl shadow-[0_0_30px_hsl(var(--primary)/0.15)] overflow-hidden group hover:shadow-[0_0_50px_hsl(var(--primary)/0.25)] transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clarity Score</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{Math.round(data.clarity.vocabularyRichness * 100)}%</div>
            <Progress value={data.clarity.vocabularyRichness * 100} className="mt-4 h-2" />
            <p className="text-xs text-muted-foreground mt-2">Vocabulary diversity rating</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Full Transcript
          </CardTitle>
          <CardDescription>Your presentation transcript with timing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background/50 p-6 rounded-xl border border-primary/20 max-h-96 overflow-y-auto backdrop-blur-sm">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{data.transcript}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisTab;
