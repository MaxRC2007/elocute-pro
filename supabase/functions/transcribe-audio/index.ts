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
    const { audio } = await req.json();

    if (!audio) {
      throw new Error("No audio data provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Decode base64 to binary safely
    const base64Data = audio.includes(',') ? audio.split(',')[1] : audio;
    
    // Use Uint8Array for proper binary handling
    const binaryLen = base64Data.length;
    const bytes = new Uint8Array(binaryLen * 3 / 4);
    
    for (let i = 0, j = 0; i < binaryLen; i += 4) {
      const chunk = base64Data.substring(i, i + 4);
      const decoded = atob(chunk);
      for (let k = 0; k < decoded.length; k++) {
        bytes[j++] = decoded.charCodeAt(k);
      }
    }

    // Create form data with file
    const formData = new FormData();
    const audioBlob = new Blob([bytes], { type: "audio/mpeg" });
    formData.append("file", audioBlob, "recording.mp3");
    formData.append("model", "whisper-1");
    formData.append("language", "en");

    // Call Whisper API through Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Transcription API error:", response.status, errorText);
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({ text: result.text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
