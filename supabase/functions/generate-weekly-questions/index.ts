// 매주 월요일 자동 실행: 10계명 기반 새 OX 철학 문제 3개를 AI로 생성해 저장 → 온보딩 체험 문제로 사용
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText, Output } from "npm:ai";
import { z } from "npm:zod";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "../_shared/run-id.ts";

// 주제 순회: 매주 3개 주제를 연속 블록으로 돌려 5주 구간 안에 전체 13개 주제를 커버
const ALL_CATEGORIES = ["brand_moat", "cash_flow", "humility", "judgment", "legend_wisdom", "no_bottom_fishing", "risk", "where_not_when", "strategy", "psychology", "crisis", "us_market", "big4_basics"] as const;

type Category = typeof ALL_CATEGORIES[number];
type GeneratedQuestion = { category: Category; statement: string; answer: boolean; explanation: string; insight: string };

const SAFE_FALLBACKS: Record<Category, GeneratedQuestion> = {
  brand_moat: { category: "brand_moat", statement: "유행하는 이름을 붙이면 강한 기업 해자가 생긴다", answer: false, explanation: "해자는 이름이 아니라 고객 신뢰와 반복 사용에서 생깁니다. 경쟁자가 돈만으로 복제하기 어려워야 합니다.", insight: "해자는 유행이 아니라 신뢰다" },
  cash_flow: { category: "cash_flow", statement: "장부상 이익이 늘면 현금도 반드시 늘어난다", answer: false, explanation: "이익과 실제 현금 유입은 다를 수 있습니다. 사업을 유지하고 남은 잉여현금흐름을 확인해야 합니다.", insight: "현금흐름이 진실이다" },
  humility: { category: "humility", statement: "한 문장으로 설명 못 하는 기업도 유명하면 사도 된다", answer: false, explanation: "유명함은 이해를 대신하지 못합니다. 모르는 기업을 건너뛰는 것이 능력의 원을 지키는 행동입니다.", insight: "모르면 지나가는 것도 실력" },
  judgment: { category: "judgment", statement: "좋은 기업이라면 가격은 전혀 확인하지 않아도 된다", answer: false, explanation: "좋은 기업이 먼저지만 지나치게 비싼 가격은 긴 기다림을 부릅니다. 기업의 질과 가격을 함께 봐야 합니다.", insight: "좋은 기업도 가격은 본다" },
  legend_wisdom: { category: "legend_wisdom", statement: "좋은 기업을 샀다면 잦은 매매가 수익에 도움이 된다", answer: false, explanation: "위대한 투자자들은 좋은 기업과 오래 함께하는 인내를 강조했습니다. 불필요한 행동은 복리를 끊기 쉽습니다.", insight: "큰돈은 기다림에서 온다" },
  no_bottom_fishing: { category: "no_bottom_fishing", statement: "큰 폭으로 하락한 가격은 곧 바닥이라는 뜻이다", answer: false, explanation: "바닥은 지나고 나서야 알 수 있습니다. 예측 대신 정한 구간에서 나눠 대응해야 합니다.", insight: "바닥 예측보다 구간 대응" },
  risk: { category: "risk", statement: "빚 없이 투자하면 기업의 부채는 보지 않아도 된다", answer: false, explanation: "기업의 과도한 부채도 위기 때 생존을 위협합니다. 적은 부채로 현금을 만드는 회사를 살펴야 합니다.", insight: "부채는 위기 때 드러난다" },
  where_not_when: { category: "where_not_when", statement: "장기투자의 핵심은 가장 싼 매수 날짜를 맞히는 것이다", answer: false, explanation: "정확한 날짜는 누구도 꾸준히 맞힐 수 없습니다. 오래 머물 좋은 기업을 고르는 일이 먼저입니다.", insight: "언제보다 어디에 머물지" },
  strategy: { category: "strategy", statement: "하락장에서 세운 계획은 공포가 오면 바꿔야 한다", answer: false, explanation: "계획은 바로 공포가 왔을 때 감정 대신 실행하려고 세웁니다. 기업이 변했는지 확인한 뒤 원칙대로 대응해야 합니다.", insight: "계획은 무서울 때 지킨다" },
  psychology: { category: "psychology", statement: "매일 주가를 확인할수록 장기 보유가 쉬워진다", answer: false, explanation: "잦은 확인은 불안과 행동 충동을 키웁니다. 좋은 기업의 사업 변화에 집중하는 편이 낫습니다.", insight: "덜 볼수록 오래 머문다" },
  crisis: { category: "crisis", statement: "폭락 뉴스가 나오면 좋은 기업도 먼저 팔아야 한다", answer: false, explanation: "가격 하락과 사업 훼손은 다른 일입니다. 공포에 반응하기 전에 기업의 본질이 변했는지 확인해야 합니다.", insight: "가격보다 사업을 먼저 본다" },
  us_market: { category: "us_market", statement: "미국 시장의 하루 움직임만 보고 장기 전망을 판단해도 된다", answer: false, explanation: "하루 가격에는 수많은 단기 감정이 섞입니다. 장기 투자자는 기업의 현금흐름과 경쟁력을 봅니다.", insight: "하루보다 10년을 본다" },
  big4_basics: { category: "big4_basics", statement: "앵커 4개 기업은 유명하므로 사업을 몰라도 사도 된다", answer: false, explanation: "MSFT·GOOGL·AMZN·AAPL도 사업과 가격을 이해해야 합니다. 유명함은 분석을 대신하지 못합니다.", insight: "유명함보다 이해가 먼저" },
};

function normalized(text: string): string {
  return text.replace(/[^0-9A-Za-z가-힣]/g, "").toLowerCase();
}

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

const TRAINING_PILLARS = `모든 문제는 아래 행동 훈련 중 하나여야 한다:
- 좋은 기업 알아보기: 고객 습관·브랜드·전환 비용·반복 사용
- 기업의 돈 이해하기: 현금흐름·적은 부채·적은 자본으로 버는 힘
- 오래 머무르기: 가격과 사업 구분·복리·불필요한 매매 거절
- 폭락장에서 행동하기: 사업 훼손 확인·구간 계획·생활 안전 우선
- 유혹 거절하기: FOMO·테마·복잡한 상품·모르는 기업 패스
- 버핏·피터 린치처럼 생각하기: 이름이나 명언 암기가 아닌 실제 선택`;

async function reviewQuestions(
  lovable: ReturnType<typeof createOpenAI>,
  qs: { statement: string; answer: boolean; explanation: string; insight?: string | null }[],
  existingStatements: string[] = [],
) {
  const result = streamText({
    model: lovable.responses("openai/gpt-6-astra"),
    output: Output.object({ schema: ReviewSchema }),
    prompt: `당신은 PPURI 앱의 엄격한 콘텐츠 검수자입니다.
${PHILOSOPHY}
${TRAINING_PILLARS}

아래 OX 문제 각각을 검수하세요. 다음 중 하나라도 해당하면 pass=false:
- 정답(O/X)이 우리 철학과 반대 방향을 가르친다 (예: 단타·타이밍·레버리지를 긍정)
- 사실·숫자가 틀렸거나 확인 불가능하다, 지어낸 인용
- 특정 종목 매수/매도 권유
- Big 4(MSFT·GOOGL·AMZN·AAPL) 외 특정 종목을 학습·추천 대상으로 소개한다. 역사적 경고 사례도 특정 종목명 대신 일반 표현을 쓴다
- 복잡한 금융상품·수학 모형·단기 시장 지표를 알아야 풀 수 있다
- 금융 용어나 역사적 숫자를 외워야 풀 수 있다
- 실제 상황에서 취할 행동이 아니라 인물·용어·수치를 맞히는 지식 시험이다
- 버핏 또는 피터 린치의 철학, 10계명, Big 4의 사업 이해 중 어느 것과도 연결되지 않는다
- 아래 기존 문제와 표현이나 핵심 교훈이 중복된다
- 정답이 모호해 O와 X 모두 가능하다
- 해설이 정답과 모순된다
reason은 한국어 한 문장. 모든 문제에 대해 index(0부터)를 포함해 답하세요.

최근 출제 문제(핵심 교훈까지 겹치면 중복 처리):
${existingStatements.length ? existingStatements.map((statement) => `- ${statement}`).join("\n") : "(없음)"}

${qs.map((q, i) => `[${i}] ${q.statement} / 정답: ${q.answer ? "O" : "X"} / 해설: ${q.explanation}`).join("\n")}`,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
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
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  // 이미 저장된 문제 재검수 모드: 철학과 맞지 않는 문제는 삭제
  const mode = new URL(req.url).searchParams.get("mode") ?? req.headers.get("x-mode");
  if (mode && mode !== "review") return json({ error: "invalid mode" }, 400);
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
  const recentKeys = new Set((recent ?? []).map((r) => normalized(r.statement)));

  try {
    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      output: Output.object({ schema: Schema }),
      prompt: `당신은 한국 초보 미국주식 투자자를 위한 행동투자 교육 앱 PPURI의 문제 출제자입니다.
우리 철학: 좋은 기업(MSFT·GOOGL·AMZN·AAPL 같은 10년 뒤에도 쓸 제품을 파는 회사)을 너무 비싸게 사지 않고, 산 뒤 아무것도 하지 않는다. 복잡한 금융상품·유행 신기술 투기 금지. 현금흐름이 진실. 바닥 예측 금지. 시장 타이밍이 아니라 '어디에' 머무를지.
${TRAINING_PILLARS}
이번 주 출제 주제는 아래 3개이며, 각 주제에서 2문제씩 총 6개 후보를 만드세요(검수 후 3개만 채택). 문제의 category 필드에 해당 주제를 그대로 적으세요.
${focus.map((c, i) => `${i + 1}. ${c}`).join("\n")}
처음 앱을 켠 사람이 "아하!" 하고 생각이 뒤집히는 OX 문제를 만드세요. 심화는 어려운 용어가 아니라 흔들리는 실제 상황에서 원칙을 적용하는 깊이입니다.
- statement: 한 문장, 40자 내외, 흔한 오해를 담아 답이 X인 문제를 최소 2개
- explanation: 2문장, 초보도 이해하는 쉬운 한국어. 마지막 문장은 오늘 할 행동으로 마무리
- insight: 기억할 한 줄(25자 내외)
- 특정 종목 매수·매도 권유 금지
- Big 4 외 종목명, 복잡한 금융상품, 단기 지표를 문제 소재로 쓰지 마세요
- 인물·용어·연도·수치 암기 문제 금지. 실제 선택이나 판단을 물으세요
- 각 문제에 10계명 또는 버핏·피터 린치의 원칙이 눈에 보이게 등장해야 합니다
이미 낸 문제와 겹치지 마세요:
${avoid || "(없음)"}`,
      abortSignal: req.signal,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    const out = await result.output;
    // 2차: 10계명 기준 철학 검수 → 통과한 문제만, 주제별 1개씩 우선 채택
    const reviews = await reviewQuestions(lovable, out.questions, (recent ?? []).map((row) => row.statement));
    const passed = out.questions
      .map((q, i) => ({ q, r: reviews.find((x) => x.index === i) }))
      .filter((x) => x.r?.pass && !recentKeys.has(normalized(x.q.statement)));
    const picked: typeof passed = [];
    for (const c of focus) { const hit = passed.find((x) => x.q.category === c && !picked.includes(x)); if (hit) picked.push(hit); }
    for (const x of passed) { if (picked.length >= 3) break; if (!picked.includes(x)) picked.push(x); }
    const rejected = out.questions.length - passed.length;
    const selected: { q: GeneratedQuestion; note: string }[] = picked.slice(0, 3).map(({ q, r }) => ({ q, note: `통과: ${r?.reason ?? "철학 검수 완료"}` }));
    for (const category of focus) {
      if (selected.length >= 3) break;
      if (!selected.some(({ q }) => q.category === category)) selected.push({ q: SAFE_FALLBACKS[category as Category], note: "통과: 검증된 주제별 예비 문항" });
    }
    const rows = selected.map(({ q, note }) => ({ ...q, week_start: week, review_note: note }));
    const { error } = await admin.from("weekly_questions").upsert(rows, { onConflict: "week_start,statement", ignoreDuplicates: true });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, week, inserted: rows.length, rejected });
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode ?? 500;
    console.error("[weekly-questions] AI failed", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, status);
  }
});
