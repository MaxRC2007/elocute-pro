import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, fillerCount, pace, clarity, fullTranscript } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert presentation coach with years of experience helping people improve their public speaking skills. Provide specific, actionable feedback with concrete examples.`;

    const userPrompt = `Analyze this presentation and provide exactly 5 coaching tips:

PRESENTATION METRICS:
- Filler Words: ${fillerCount} occurrences
- Average Speaking Pace: ${Math.round(pace)} words per minute
- Clarity Score: ${clarity}/100

TRANSCRIPT:
${(fullTranscript || transcript).substring(0, 1000)}

Please provide exactly 5 coaching tips in the following format:

1. [Tip Title]
[Detailed explanation of the issue and why it matters]
Action: [Specific action to take]

2. [Next tip...]

Focus on:
- Reducing filler words
- Optimizing speaking pace
- Improving clarity and confidence
- Engaging the audience
- Professional delivery techniques`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      throw new Error(`AI coaching failed: ${response.status}`);
    }

    const result = await response.json();
    const coaching = result.choices[0].message.content;

    return new Response(JSON.stringify({ coaching }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Coaching error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
