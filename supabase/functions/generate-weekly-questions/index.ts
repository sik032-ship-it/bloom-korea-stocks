// 매주 월요일 자동 실행: 10계명 기반 새 OX 철학 문제 3개를 AI로 생성해 저장 → 온보딩 체험 문제로 사용
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText, Output } from "npm:ai";
import { z } from "npm:zod";

// 주제 순회: 매주 3개 주제씩 돌아가며 전체 13개 주제를 커버 (4주 + 나머지 1주 = 5주 주기)
const ALL_CATEGORIES = ["brand_moat", "cash_flow", "humility", "judgment", "legend_wisdom", "no_bottom_fishing", "risk", "where_not_when", "strategy", "psychology", "crisis", "us_market", "big4_basics"] as const;

function weeklyCategories(week: string): string[] {
  const start = week.split("-").reduce((acc, p) => acc * 100 + Number(p), 0);
  const out: string[] = [];
  for (let i = 0; i < 3; i++) out.push(ALL_CATEGORIES[(start + i * 4) % ALL_CATEGORIES.length]);
  return out;
}

const Schema = z.object({
  questions: z.array(z.object({
    category: z.enum(ALL_CATEGORIES),
    statement: z.string(),
    answer: z.boolean(),
    explanation: z.string(),
    insight: z.string(),
  })),
});

function mondayKST(): string {
  const now = new Date(Date.now() + 9 * 3600_000);
  const day = (now.getUTCDay() + 6) % 7;
  now.setUTCDate(now.getUTCDate() - day);
  return now.toISOString().slice(0, 10);
}

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET_PPURI")) return json({ error: "forbidden" }, 403);

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "LOVABLE_API_KEY missing" }, 500);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const week = mondayKST();
  const focus = weeklyCategories(week);

  const { count } = await admin.from("weekly_questions").select("id", { count: "exact", head: true }).eq("week_start", week);
  if ((count ?? 0) >= 3) return json({ ok: true, skipped: "already generated", week });

  const { data: recent } = await admin.from("weekly_questions").select("statement").order("created_at", { ascending: false }).limit(40);
  const avoid = (recent ?? []).map((r) => `- ${r.statement}`).join("\n");

  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  try {
    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      output: Output.object({ schema: Schema }),
      prompt: `당신은 한국 초보 미국주식 투자자를 위한 행동투자 교육 앱 PPURI의 문제 출제자입니다.
우리 철학: 좋은 기업(MSFT·GOOGL·AMZN·AAPL 같은 10년 뒤에도 쓸 제품을 파는 회사)을 너무 비싸게 사지 않고, 산 뒤 아무것도 하지 않는다. 복잡한 금융상품·유행 신기술 투기 금지. 현금흐름이 진실. 바닥 예측 금지. 시장 타이밍이 아니라 '어디에' 머무를지.
이번 주 출제 주제는 아래 3개이며, 각 주제에서 정확히 1문제씩 총 3개를 만드세요. 문제의 category 필드에 해당 주제를 그대로 적으세요.
${focus.map((c, i) => `${i + 1}. ${c}`).join("\n")}
처음 앱을 켠 사람이 "아하!" 하고 생각이 뒤집히는 OX 문제를 만드세요.
- statement: 한 문장, 40자 내외, 흔한 오해를 담아 답이 X인 문제를 최소 2개
- explanation: 2문장, 쉬운 한국어, 구체적 사례/숫자 1개
- insight: 기억할 한 줄(25자 내외)
- 특정 종목 매수·매도 권유 금지
이미 낸 문제와 겹치지 마세요:
${avoid || "(없음)"}`,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false, include: ["reasoning.encrypted_content"] } },
    });
    const out = await result.output;
    const rows = out.questions.slice(0, 3).map((q) => ({ ...q, week_start: week }));
    const { error } = await admin.from("weekly_questions").upsert(rows, { onConflict: "week_start,statement", ignoreDuplicates: true });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, week, inserted: rows.length });
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode ?? 500;
    console.error("[weekly-questions] AI failed", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, status);
  }
});
