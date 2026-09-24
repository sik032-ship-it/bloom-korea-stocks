// 매주 월요일 자동 실행: 10계명 기반 새 OX 철학 문제 3개를 AI로 생성해 저장 → 온보딩 체험 문제로 사용
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText, Output } from "npm:ai";
import { z } from "npm:zod";

// 주제 순회: 매주 3개 주제를 연속 블록으로 돌려 5주마다 전체 13개 주제를 커버
const ALL_CATEGORIES = ["brand_moat", "cash_flow", "humility", "judgment", "legend_wisdom", "no_bottom_fishing", "risk", "where_not_when", "strategy", "psychology", "crisis", "us_market", "big4_basics"] as const;

function weeklyCategories(week: string): string[] {
  const weekIndex = Math.floor(new Date(week + "T00:00:00Z").getTime() / 86400000 / 7);
  return [0, 1, 2].map((i) => ALL_CATEGORIES[(weekIndex * 3 + i) % ALL_CATEGORIES.length]);
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

const ReviewSchema = z.object({
  reviews: z.array(z.object({
    index: z.number(),
    pass: z.boolean(),
    reason: z.string(),
  })),
});

const PHILOSOPHY = `PPURI 투자 10계명과 철학:
1. 10년 뒤에도 쓸 제품을 파는 좋은 기업(MSFT·GOOGL·AMZN·AAPL 같은)만 산다.
2. 너무 비싸게 사지 않는다. 산 뒤에는 아무것도 하지 않고 오래 머문다.
3. 현금흐름(FCF)이 진실이다. 이야기·유행이 아니라 숫자.
4. 바닥을 예측하지 않는다. 시장 타이밍이 아니라 '어디에' 머무를지가 중요하다.
5. 레버리지·옵션·코인·테마 ETF·유행 신기술 투기 등 복잡하거나 화려한 상품은 멀리한다.
6. 위기는 좋은 기업을 싸게 살 기회. 공포에 팔지 않는다.
7. 모르는 것은 인정하는 겸손. 한 문장으로 설명 못 하면 사지 않는다.
8. 잦은 매매·단타·뉴스 추종을 경계한다.
9. 특정 종목의 매수·매도를 권유하지 않는다.
10. 사실과 숫자는 정확해야 한다. 틀린 통계·지어낸 인용은 금지.`;

async function reviewQuestions(lovable: ReturnType<typeof createOpenAI>, qs: { statement: string; answer: boolean; explanation: string; insight?: string | null }[]) {
  const result = streamText({
    model: lovable.responses("openai/gpt-6-astra"),
    output: Output.object({ schema: ReviewSchema }),
    prompt: `당신은 PPURI 앱의 엄격한 콘텐츠 검수자입니다.
${PHILOSOPHY}

아래 OX 문제 각각을 검수하세요. 다음 중 하나라도 해당하면 pass=false:
- 정답(O/X)이 우리 철학과 반대 방향을 가르친다 (예: 단타·타이밍·레버리지를 긍정)
- 사실·숫자가 틀렸거나 확인 불가능하다, 지어낸 인용
- 특정 종목 매수/매도 권유
- 정답이 모호해 O와 X 모두 가능하다
- 해설이 정답과 모순된다
reason은 한국어 한 문장. 모든 문제에 대해 index(0부터)를 포함해 답하세요.

${qs.map((q, i) => `[${i}] ${q.statement} / 정답: ${q.answer ? "O" : "X"} / 해설: ${q.explanation}`).join("\n")}`,
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: "medium", store: false, include: ["reasoning.encrypted_content"] } },
  });
  return (await result.output).reviews;
}

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
  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  // 이미 저장된 문제 재검수 모드: 철학과 맞지 않는 문제는 삭제
  const mode = new URL(req.url).searchParams.get("mode") ?? req.headers.get("x-mode");
  if (mode === "review") {
    const { data: existing } = await admin.from("weekly_questions").select("id, statement, answer, explanation, insight");
    if (!existing?.length) return json({ ok: true, reviewed: 0 });
    try {
      const reviews = await reviewQuestions(lovable, existing);
      const removed: { statement: string; reason: string }[] = [];
      for (const r of reviews) {
        const row = existing[r.index];
        if (!row) continue;
        if (r.pass) await admin.from("weekly_questions").update({ review_note: `통과: ${r.reason}` }).eq("id", row.id);
        else { await admin.from("weekly_questions").delete().eq("id", row.id); removed.push({ statement: row.statement, reason: r.reason }); }
      }
      return json({ ok: true, reviewed: existing.length, removed });
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : String(e) }, (e as { statusCode?: number }).statusCode ?? 500);
    }
  }

  const { count } = await admin.from("weekly_questions").select("id", { count: "exact", head: true }).eq("week_start", week);
  if ((count ?? 0) >= 3) return json({ ok: true, skipped: "already generated", week });

  const { data: recent } = await admin.from("weekly_questions").select("statement").order("created_at", { ascending: false }).limit(40);
  const avoid = (recent ?? []).map((r) => `- ${r.statement}`).join("\n");

  try {
    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      output: Output.object({ schema: Schema }),
      prompt: `당신은 한국 초보 미국주식 투자자를 위한 행동투자 교육 앱 PPURI의 문제 출제자입니다.
우리 철학: 좋은 기업(MSFT·GOOGL·AMZN·AAPL 같은 10년 뒤에도 쓸 제품을 파는 회사)을 너무 비싸게 사지 않고, 산 뒤 아무것도 하지 않는다. 복잡한 금융상품·유행 신기술 투기 금지. 현금흐름이 진실. 바닥 예측 금지. 시장 타이밍이 아니라 '어디에' 머무를지.
이번 주 출제 주제는 아래 3개이며, 각 주제에서 2문제씩 총 6개 후보를 만드세요(검수 후 3개만 채택). 문제의 category 필드에 해당 주제를 그대로 적으세요.
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
    // 2차: 10계명 기준 철학 검수 → 통과한 문제만, 주제별 1개씩 우선 채택
    const reviews = await reviewQuestions(lovable, out.questions);
    const passed = out.questions
      .map((q, i) => ({ q, r: reviews.find((x) => x.index === i) }))
      .filter((x) => x.r?.pass);
    const picked: typeof passed = [];
    for (const c of focus) { const hit = passed.find((x) => x.q.category === c && !picked.includes(x)); if (hit) picked.push(hit); }
    for (const x of passed) { if (picked.length >= 3) break; if (!picked.includes(x)) picked.push(x); }
    const rejected = out.questions.length - passed.length;
    if (!picked.length) return json({ ok: false, week, inserted: 0, rejected, note: "all candidates failed philosophy review" });
    const rows = picked.slice(0, 3).map(({ q, r }) => ({ ...q, week_start: week, review_note: `통과: ${r!.reason}` }));
    const { error } = await admin.from("weekly_questions").upsert(rows, { onConflict: "week_start,statement", ignoreDuplicates: true });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, week, inserted: rows.length, rejected });
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode ?? 500;
    console.error("[weekly-questions] AI failed", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, status);
  }
});
