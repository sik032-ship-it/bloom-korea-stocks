import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Holding = Database["public"]["Tables"]["holdings"]["Row"];
type QuestionType = Database["public"]["Enums"]["question_type"];

interface SelectedQuestion {
  holding: Holding;
  type: QuestionType;
  questionText: string;
  placeholderText: string;
}

function pickQuestionType(): QuestionType {
  const r = Math.random();
  if (r < 0.8) return "daily";
  const situational: QuestionType[] = ["earnings", "drop", "surge", "fomo"];
  return situational[Math.floor(Math.random() * situational.length)];
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

export async function selectQuestion(holdings: Holding[]): Promise<SelectedQuestion | null> {
  if (holdings.length === 0) return null;

  // Prioritize neglected holdings (least sentences first) to build balanced perspective
  const sorted = [...holdings].sort((a, b) => a.sentence_count - b.sentence_count);
  const leastPracticed = sorted.filter(h => h.sentence_count === sorted[0].sentence_count);
  const holding = leastPracticed[Math.floor(Math.random() * leastPracticed.length)];
  const type = pickQuestionType();

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

  const template = templates[Math.floor(Math.random() * templates.length)];

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
  excludeHoldingId?: string
): Promise<SelectedQuestion | null> {
  const filtered = excludeHoldingId
    ? holdings.filter((h) => h.id !== excludeHoldingId)
    : holdings;
  const pool = filtered.length > 0 ? filtered : holdings;
  return selectQuestion(pool);
}
