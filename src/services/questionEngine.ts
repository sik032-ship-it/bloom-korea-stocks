import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { dailySeed, seededRandom, seededShuffle } from "@/utils/dailySeed";
import { getRecentQuestionKeys, recordServedQuestions } from "@/utils/quizHistory";

type Holding = Database["public"]["Tables"]["holdings"]["Row"];
type QuestionType = Database["public"]["Enums"]["question_type"];

interface SelectedQuestion {
  holding: Holding;
  type: QuestionType;
  questionText: string;
  placeholderText: string;
}

function pickQuestionType(rand: () => number): QuestionType {
  const r = rand();
  if (r < 0.8) return "daily";
  const situational: QuestionType[] = ["earnings", "drop", "surge", "fomo"];
  return situational[Math.floor(rand() * situational.length)];
}


function calculateDays(addedAt: string): string {
  const added = new Date(addedAt);
  const now = new Date();
  const days = Math.floor((now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "오늘";
  if (days < 7) return `${days}일`;
  if (days < 30) return `${Math.floor(days / 7)}주`;
  if (days < 365) return `${Math.floor(days / 30)}개월`;
  return `${Math.floor(days / 365)}년`;
}

function replaceTemplateVars(template: string, holding: Holding): string {
  return template
    .replace(/\{종목명\}/g, holding.company_name_kr)
    .replace(/\{ticker\}/g, holding.ticker)
    .replace(/\{보유기간\}/g, calculateDays(holding.added_at));
}

export async function selectQuestion(
  holdings: Holding[],
  opts?: { userId?: string | null; salt?: number },
): Promise<SelectedQuestion | null> {
  if (holdings.length === 0) return null;

  // 하루 단위 결정론: 같은 날 새로고침 → 같은 질문 / 다음 날 → 다른 질문
  const rand = seededRandom(dailySeed(opts?.userId) ^ (opts?.salt ?? 0));

  // Prioritize neglected holdings (least sentences first) to build balanced perspective
  const sorted = [...holdings].sort((a, b) => a.sentence_count - b.sentence_count);
  const leastPracticed = sorted.filter(h => h.sentence_count === sorted[0].sentence_count);
  const holding = leastPracticed[Math.floor(rand() * leastPracticed.length)];
  const type = pickQuestionType(rand);

  const { data: templates } = await supabase
    .from("question_templates")
    .select("*")
    .eq("type", type)
    .eq("is_active", true);

  if (!templates || templates.length === 0) {
    return {
      holding,
      type,
      questionText: `${holding.company_name_kr}에 대해 오늘 한 문장을 써보세요.`,
      placeholderText: "여기에 입력하세요...",
    };
  }

  // 최근 14일 내 사용한 템플릿 제외 (풀이 마르면 자동 완화)
  const recent = getRecentQuestionKeys();
  const fresh = templates.filter((t) => !recent.has(`tpl:${t.id}`));
  const pool = fresh.length > 0 ? fresh : templates;
  const template = seededShuffle(pool, rand)[0];
  recordServedQuestions([`tpl:${template.id}`]);

  return {
    holding,
    type,
    questionText: replaceTemplateVars(template.template_text, holding),
    placeholderText: template.placeholder_text
      ? replaceTemplateVars(template.placeholder_text, holding)
      : "여기에 입력하세요... 최소 10자 이상",
  };
}

export async function selectNewQuestion(
  holdings: Holding[],
  excludeHoldingId?: string,
  opts?: { userId?: string | null },
): Promise<SelectedQuestion | null> {
  const filtered = excludeHoldingId
    ? holdings.filter((h) => h.id !== excludeHoldingId)
    : holdings;
  const pool = filtered.length > 0 ? filtered : holdings;
  // "다른 질문 보기" — 같은 날에도 새 조합이 나오도록 salt 사용
  return selectQuestion(pool, { userId: opts?.userId, salt: Math.floor(Math.random() * 1e9) });
}

