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

    const { sentences, holdings } = await req.json();

    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
      return new Response(JSON.stringify({ biases: [], nudge: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const holdingsList = holdings?.map((h: any) => h.company_name_kr).join(", ") || "없음";

    const systemPrompt = `당신은 행동 투자 심리 분석 전문가입니다. 사용자의 투자 일기를 분석하여 무의식적 편향과 위험한 사고 패턴을 감지합니다.

핵심 원칙:
1. 경제적 불확실성은 변하지 않음 - 사람들의 위험 인식이 변할 뿐
2. 부를 쌓는 법: 자존심 < 수입 유지 (기대가 수입보다 빨리 커지면 만족 없음)
3. FOMO가 없다는 것 = 중요한 투자 능력
4. 과거 하락은 기회, 미래 하락은 위험으로 보는 비대칭 심리
5. 돈의 본질적 가치 = 시간 통제권
6. 자기도 모르게 놓치는 것들을 잡아주기
7. 감정에 휘둘리는 순간을 인식시키기

반드시 아래 JSON 형식으로만 응답하세요.`;

    const userPrompt = `보유 종목: ${holdingsList}

최근 작성한 투자 일기:
${sentences.map((s: any, i: number) => `${i + 1}. Q: ${s.question_text}\n   A: ${s.answer_text}`).join("\n\n")}

분석 후 JSON으로 응답:
{
  "biases": [
    {
      "type": "fomo|overconfidence|loss_aversion|anchoring|recency|herd|expectation_gap|time_value_blind",
      "severity": "low|medium|high",
      "evidence": "어떤 문장에서 감지됐는지 한 줄 설명",
      "nudge": "부드럽고 공감적인 한 줄 조언 (명령이 아닌 질문 형태가 좋음)"
    }
  ],
  "overall_pattern": "전반적 사고 패턴 한 줄 요약",
  "growth_area": "가장 성장이 필요한 영역 한 줄",
  "strength": "잘하고 있는 점 한 줄 (반드시 포함)",
  "nudge": "오늘 하루를 마무리하는 따뜻한 인사이트 한 줄 (핵심 원칙 중 하나를 자연스럽게 녹여서)"
}

biases는 0-3개, 없으면 빈 배열. 과도한 지적 금지. 따뜻하고 공감적으로.`;

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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");

    const analysis = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-bias error:", e);
    return new Response(JSON.stringify({ biases: [], nudge: null, error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
