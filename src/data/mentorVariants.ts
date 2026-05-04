// 멘토 카드 A/B 테스트 variants
// 전환율 측정의 핵심: quote × cta 조합을 사용자에게 결정론적으로 분배
// (같은 사용자는 같은 variant를 보도록 — userId 해시 기반)

import type { MentorId } from "@/components/MentorCard";

export type MentorPlacement = "crisis_trigger" | "sell_block" | "onboarding_pact";

export interface MentorVariant {
  id: string;
  mentor: MentorId;
  quote: string;
  commandment?: number;
  commandmentLabel?: string;
  ctaLabel: string;
  secondaryLabel?: string;
}

// === 위기 자동 트리거 (-10% 이상 하락 감지 시) ===
// 가설: "감정 정상화 → 행동 약속" 흐름이 가장 효과적
export const CRISIS_TRIGGER_VARIANTS: MentorVariant[] = [
  {
    id: "crisis_buffett_unexpected",
    mentor: "buffett",
    quote: "진짜 큰 피해는 항상 우리가 예상치 못한 곳에서 발생합니다. 걱정한다고 상황이 달라지지 않아요.",
    commandment: 10,
    commandmentLabel: "어디에 머무를지",
    ctaLabel: "알겠어요, 머무를게요 🌳",
    secondaryLabel: "분할매수 계획 다시 보기",
  },
  {
    id: "crisis_buffett_time",
    mentor: "buffett",
    quote: "시간은 위대한 기업의 편입니다. 조금 비싸게 샀더라도 시간이 흐를수록 그 비용은 헐값이 됩니다.",
    commandment: 8,
    commandmentLabel: "시간은 위대한 기업의 편",
    ctaLabel: "10년 관점으로 다시 보기",
    secondaryLabel: "분할매수 계획 다시 보기",
  },
  {
    id: "crisis_buffett_doNothing",
    mentor: "buffett",
    quote: "좋은 기업을 사라. 너무 비싸게 사지 마라. 산 다음 아무것도 하지 마라.",
    commandment: 1,
    commandmentLabel: "산 다음 아무것도 하지 마라",
    ctaLabel: "오늘은 아무것도 안 할게요",
    secondaryLabel: "분할매수 계획 다시 보기",
  },
];

// === 매도 차단 (보유 종목 삭제 시도 시) ===
export const SELL_BLOCK_VARIANTS: MentorVariant[] = [
  {
    id: "sell_lynch_panic",
    mentor: "lynch",
    quote: "대부분의 투자자가 손해를 보는 이유는 시장이 폭락해서가 아니라, 폭락할 때 팔아버리기 때문입니다.",
    commandment: 1,
    commandmentLabel: "산 다음 아무것도 하지 마라",
    ctaLabel: "알겠어요, 머무를게요",
    secondaryLabel: "그래도 휴지통으로 보내기 (30일 내 복구 가능)",
  },
];

// === 온보딩 마지막 — 10년 함께 서약 ===
export const ONBOARDING_PACT_VARIANTS: MentorVariant[] = [
  {
    id: "pact_buffett_decade",
    mentor: "buffett",
    quote: "10년 동안 보유할 자신이 없다면 10분도 보유하지 마세요.",
    commandment: 2,
    commandmentLabel: "이미 검증된 승자와 함께",
    ctaLabel: "🤝 10년 함께 갑시다",
  },
  {
    id: "pact_lynch_partner",
    mentor: "lynch",
    quote: "주식을 사는 게 아니라, 회사의 동업자가 되는 겁니다. 좋은 동업자라면 오래 함께해야죠.",
    commandment: 2,
    commandmentLabel: "이미 검증된 승자와 함께",
    ctaLabel: "🤝 10년 함께 갑시다",
  },
];

export const VARIANTS_BY_PLACEMENT: Record<MentorPlacement, MentorVariant[]> = {
  crisis_trigger: CRISIS_TRIGGER_VARIANTS,
  sell_block: SELL_BLOCK_VARIANTS,
  onboarding_pact: ONBOARDING_PACT_VARIANTS,
};

/**
 * 결정론적 variant 선택 — 같은 사용자는 같은 variant를 본다.
 * (단순 해시 + 모듈로. 실험 무결성을 위해 의도적으로 서버 호출 없이 처리)
 */
export function pickVariant(placement: MentorPlacement, userId: string): MentorVariant {
  const variants = VARIANTS_BY_PLACEMENT[placement];
  let hash = 0;
  const seed = `${placement}:${userId}`;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return variants[Math.abs(hash) % variants.length];
}
