import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { transcript, fillerCount, pace, clarity } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert presentation coach with 20 years of experience coaching executives, TED speakers, and keynote presenters. Analyze presentations and provide specific, actionable feedback.`;

    const userPrompt = `Analyze this presentation and provide 5 specific, prioritized coaching tips:

Transcript: "${transcript.substring(0, 1000)}..."
Filler words: ${fillerCount}
Speaking pace: ${Math.round(pace)} WPM
Vocabulary diversity: ${(clarity * 100).toFixed(1)}%

Format your response as a clear, encouraging analysis with:
1. Overall assessment (2-3 sentences)
2. Top 5 specific improvements with before/after examples
3. One standout strength to build on

Be personal, specific, and actionable. Reference actual content from the transcript.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
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
