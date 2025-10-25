import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { AlertCircle } from "lucide-react";
import type { AnalysisResult } from "@/utils/audioAnalyzer";

interface TimelineTabProps {
  data: AnalysisResult | null;
}

const TimelineTab = ({ data }: TimelineTabProps) => {
  if (!data) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Upload an audio file to see your timeline visualization
          </p>
        </CardContent>
      </Card>
    );
  }

  const fillerTimelineData = data.fillerWords.map((fw) => ({
    timestamp: fw.timestamp,
    type: fw.word,
  }));

  return (
    <div className="grid gap-6">
      <Card className="border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
        <CardHeader>
          <CardTitle>Speaking Pace Over Time</CardTitle>
          <CardDescription>Words per minute throughout your presentation</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.pace.windows}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="timestamp" 
                stroke="hsl(var(--muted-foreground))"
                label={{ value: "Time (seconds)", position: "insideBottom", offset: -5 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                label={{ value: "WPM", angle: -90, position: "insideLeft" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <defs>
                <linearGradient id="paceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="wpm" 
                stroke="hsl(var(--primary))" 
                fill="url(#paceGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
        <CardHeader>
          <CardTitle>Filler Words Timeline</CardTitle>
          <CardDescription>When filler words occurred in your presentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.fillerWords.slice(0, 10).map((fw, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="text-sm font-mono text-muted-foreground w-16">
                  {Math.floor(fw.timestamp)}s
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-accent">{fw.word}</span>
                  <p className="text-sm text-muted-foreground mt-1">{fw.context}</p>
                </div>
              </div>
            ))}
            {data.fillerWords.length > 10 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                And {data.fillerWords.length - 10} more...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelineTab;
