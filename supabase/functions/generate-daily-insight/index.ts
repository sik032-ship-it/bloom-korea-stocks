import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sentences } = await req.json();
    
    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
      return new Response(JSON.stringify({ insight: "오늘도 투자 공부를 시작해보세요! 🌱" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ insight: "꾸준한 기록이 투자 실력을 만듭니다 📝" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sentenceSummary = sentences.map((s: any) => 
      `질문: ${s.question_text}\n답변: ${s.answer_text}`
    ).join("\n---\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `당신은 개인 투자 코치입니다. 사용자가 오늘 작성한 투자 문장들을 분석해서, 오늘 배운 핵심 인사이트를 한 문장(30자 이내)으로 요약해주세요.
- 구체적이고 실용적인 내용으로
- 이모지 1개 포함
- 칭찬이 아닌 배움 포인트 중심
- 예: "📊 분산투자가 리스크를 줄인다는 걸 체감했어요"
- 예: "🧠 공포에 매도하지 않는 연습이 핵심이에요"`
          },
          {
            role: "user",
            content: `오늘 작성한 투자 문장들:\n\n${sentenceSummary}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Insufficient credits" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ insight: "오늘의 기록이 내일의 투자력이 됩니다 💪" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content?.trim() || "오늘도 한 걸음 성장했어요 🌱";

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ insight: "투자는 매일의 작은 습관에서 시작됩니다 🌿" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
