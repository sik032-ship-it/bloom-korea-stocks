// 퀴즈 타입 · 카테고리 메타 (단일 정의 지점)
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type QuizCategory =
  | "risk"
  | "psychology"
  | "crisis"
  | "judgment"
  | "us_market"
  | "legend_wisdom"
  | "humility"
  | "no_bottom_fishing"
  | "cash_flow"
  | "brand_moat"
  | "where_not_when"
  | "big4_basics"
  | "strategy";

export interface OXQuestion {
  format: "ox";
  difficulty: Difficulty;
  statement: string;
  answer: boolean;
  explanation: string;
  category: QuizCategory;
  insight?: string;
}

export interface MultipleChoiceQuestion {
  format: "multiple_choice";
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: QuizCategory;
  insight?: string;
}

export interface FillBlankQuestion {
  format: "fill_blank";
  difficulty: Difficulty;
  sentence: string;
  answer: string;
  hints?: string[];
  explanation: string;
  category: QuizCategory;
  insight?: string;
}

export type QuizQuestion = OXQuestion | MultipleChoiceQuestion | FillBlankQuestion;

// 4톤 시맨틱 시스템: growth(성장)·wisdom(철학)·caution(경계)·truth(실전)
export type CategoryTone = "growth" | "wisdom" | "caution" | "truth";

export const categoryLabels: Record<QuizCategory, { name: string; icon: string; tone: CategoryTone }> = {
  risk:              { name: "위험 이해",        icon: "crosshair",    tone: "caution" },
  psychology:        { name: "심리 조절",        icon: "brain",        tone: "caution" },
  crisis:            { name: "위기 대처",        icon: "shield",       tone: "caution" },
  judgment:          { name: "판단력",           icon: "scale",        tone: "wisdom"  },
  us_market:         { name: "미국주식·매크로",  icon: "trending-up",  tone: "truth"   },
  legend_wisdom:     { name: "레전드의 지혜",    icon: "sparkles",     tone: "wisdom"  },
  humility:          { name: "겸손·능력의 원",   icon: "scan-eye",     tone: "wisdom"  },
  no_bottom_fishing: { name: "바닥 예측 금지",   icon: "target",       tone: "caution" },
  cash_flow:         { name: "현금흐름이 진실",  icon: "droplets",     tone: "truth"   },
  brand_moat:        { name: "브랜드 해자",      icon: "castle",       tone: "growth"  },
  where_not_when:    { name: "어디에 머무를지",  icon: "map-pin",      tone: "growth"  },
  big4_basics:       { name: "앵커 4종목 기초",  icon: "landmark",     tone: "growth"  },
  strategy:          { name: "실행 전략",        icon: "route",        tone: "truth"   },
};

// 톤 → tailwind class (한 곳에서만 정의)
export const toneClasses: Record<CategoryTone, { fg: string; bg: string; border: string }> = {
  growth:  { fg: "text-tone-growth-fg",  bg: "bg-tone-growth-bg",  border: "border-tone-growth-fg/20"  },
  wisdom:  { fg: "text-tone-wisdom-fg",  bg: "bg-tone-wisdom-bg",  border: "border-tone-wisdom-fg/20"  },
  caution: { fg: "text-tone-caution-fg", bg: "bg-tone-caution-bg", border: "border-tone-caution-fg/20" },
  truth:   { fg: "text-tone-truth-fg",   bg: "bg-tone-truth-bg",   border: "border-tone-truth-fg/20"   },
};
