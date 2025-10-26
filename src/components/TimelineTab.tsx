import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AnalysisResult } from "@/utils/audioAnalyzer";

interface TimelineTabProps {
  data: AnalysisResult | null;
}

const TimelineTab = ({ data }: TimelineTabProps) => {
  if (!data) {
    return (
      <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">Upload an audio file to see timeline analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 animate-fade-in">
      <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Speaking Pace Over Time
          </CardTitle>
          <CardDescription>Words per minute throughout your presentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.pace.windows}>
                <defs>
                  <linearGradient id="paceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(271, 91%, 65%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(195, 100%, 60%)" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 28%)" />
                <XAxis dataKey="time" stroke="hsl(215, 20%, 65%)" tick={{ fill: 'hsl(215, 20%, 65%)' }} />
                <YAxis stroke="hsl(215, 20%, 65%)" tick={{ fill: 'hsl(215, 20%, 65%)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 12%)', border: '1px solid hsl(217, 33%, 28%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                <Area type="monotone" dataKey="wpm" stroke="hsl(271, 91%, 65%)" fill="url(#paceGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-card backdrop-blur-xl shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
        <CardHeader>
          <CardTitle>Filler Words Timeline</CardTitle>
          <CardDescription>Instances of filler words throughout your presentation</CardDescription>
        </CardHeader>
        <CardContent>
          {data.fillerWords.length > 0 ? (
            <div className="space-y-3">
              {data.fillerWords.slice(0, 10).map((filler, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/20 hover:border-primary/40 transition-colors backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{index + 1}</span>
                    <div>
                      <p className="font-medium text-foreground">{filler.word}</p>
                      <p className="text-sm text-muted-foreground">at {filler.timestamp.toFixed(1)}s</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive border border-destructive/20">Filler</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No filler words detected - excellent!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelineTab;
