import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { holdings } = await req.json();

    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return new Response(JSON.stringify({ error: "No holdings provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const holdingsList = holdings.map((h: { ticker: string; company_name_kr: string }) => 
      `${h.company_name_kr}(${h.ticker})`
    ).join(", ");

    const systemPrompt = `당신은 투자 위기 시뮬레이션 전문가입니다. 사용자의 보유 종목을 기반으로 현실적인 위기 시나리오를 만들어주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.`;

    const userPrompt = `사용자 보유 종목: ${holdingsList}

이 종목들에 관련된 현실적인 투자 위기 시나리오를 1개 만들어주세요.
실제 일어날 수 있는 뉴스 기반 상황이어야 합니다.
각 단계마다 4개의 선택지를 주고, 점수(0-3)와 피드백을 포함하세요.

JSON 형식:
{
  "id": "ai-custom-[timestamp]",
  "title": "시나리오 제목 (10자 이내)",
  "description": "2줄 이내 상황 설명",
  "historicalContext": "비슷한 역사적 사례 설명",
  "steps": [
    {
      "situation": "구체적 상황 설명 (보유 종목 언급)",
      "emotion": "이때 느낄 감정들",
      "options": [
        { "text": "선택지 텍스트", "score": 3, "feedback": "왜 이것이 좋은/나쁜 선택인지" },
        { "text": "선택지 텍스트", "score": 1, "feedback": "피드백" },
        { "text": "선택지 텍스트", "score": 0, "feedback": "피드백" },
        { "text": "선택지 텍스트", "score": 2, "feedback": "피드백" }
      ]
    }
  ]
}

steps는 2-3개, 각 step의 options는 반드시 4개, score는 0/1/2/3 중 하나, 최고점 3은 반드시 1개만.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "잠시 후 다시 시도해주세요" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");

    const scenario = JSON.parse(jsonMatch[0]);
    scenario.id = `ai-custom-${Date.now()}`;

    return new Response(JSON.stringify({ scenario }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-crisis-scenario error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
