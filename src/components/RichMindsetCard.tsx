// "부자처럼 생각하기" — 매일 30초 마인드셋 카드
// 날짜 기반 회전. 이모지 → Lucide 아이콘 + 4톤 시맨틱으로 톤 통일.

import React from "react";
import {
  Target, Gem, Ruler, Compass, Search, Wind,
  Hourglass, Mountain, Brain, VolumeX,
  type LucideIcon,
} from "lucide-react";
import { toneClasses, type CategoryTone } from "@/data/quizQuestions";

interface MindsetCard {
  id: string;
  topic: "no_bottom" | "humility" | "long_term" | "circle";
  topicLabel: string;
  Icon: LucideIcon;
  tone: CategoryTone;
  headline: string;
  body: string;
  source?: string;
}

const CARDS: MindsetCard[] = [
  // === 바닥 예측 금지 (caution) ===
  {
    id: "buffett-no-bottom",
    topic: "no_bottom",
    topicLabel: "바닥 예측 금지",
    Icon: Target,
    tone: "caution",
    headline: "버핏도 바닥은 모른다고 했어요.",
    body: "세계 최고의 투자자조차 \"내가 산 다음 더 떨어질지 아닐지 모른다\"고 말합니다.\n바닥을 잡으려는 사람은 자기도 모르게 \"나는 버핏보다 잘 안다\"고 말하는 셈이에요.",
    source: "워렌 버핏",
  },
  {
    id: "rich-buy-on-drop",
    topic: "no_bottom",
    topicLabel: "부자의 행동",
    Icon: Gem,
    tone: "caution",
    headline: "부자는 -15% 빠지면 \"좋은 가격이다\"라고 말해요.",
    body: "일반인은 \"더 떨어질 것 같다\"며 못 사고, 회복하면 비싸게 따라 사요.\n부자는 미리 정한 구간에 도달하면 감정 없이 분할매수를 시작합니다.",
  },
  {
    id: "split-buy-plan",
    topic: "no_bottom",
    topicLabel: "구간 대응",
    Icon: Ruler,
    tone: "caution",
    headline: "예측이 아니라 \"계획\"으로 산다.",
    body: "-15%, -25%, -40% — 우량주가 이 구간에 오면 미리 정한 비중대로 분할매수.\n바닥은 신만 알아요. 우리는 구간만 정할 수 있어요.",
  },

  // === 겸손 (wisdom) ===
  {
    id: "circle-of-competence",
    topic: "circle",
    topicLabel: "능력의 원",
    Icon: Compass,
    tone: "wisdom",
    headline: "버핏은 어려운 투자를 거의 한 적이 없어요.",
    body: "코카콜라, 애플, 코스트코, 비자 — 초등학생도 아는 기업뿐이에요.\n\"내가 모르는 회사에는 투자하지 않는다\" — 이게 그의 비밀입니다.",
    source: "워렌 버핏",
  },
  {
    id: "humility-test",
    topic: "humility",
    topicLabel: "겸손 테스트",
    Icon: Search,
    tone: "wisdom",
    headline: "한 문장으로 설명할 수 없으면, 모르는 거예요.",
    body: "피터 린치: \"이 회사가 무슨 일을 하는지 크레용으로 그릴 수 없다면 사지 마라.\"\n복잡할수록 위험합니다. 단순함이 곧 안전입니다.",
    source: "피터 린치",
  },
  {
    id: "munger-humility",
    topic: "humility",
    topicLabel: "겸손",
    Icon: Wind,
    tone: "wisdom",
    headline: "내가 틀릴 수 있다는 것을 인정하는 순간, 진짜 투자가 시작돼요.",
    body: "찰리 멍거: \"나는 평생 멍청한 짓을 피하려 노력했고, 그게 천재가 되려는 것보다 더 효과적이었다.\"",
    source: "찰리 멍거",
  },

  // === 장기투자 (growth) ===
  {
    id: "time-is-friend",
    topic: "long_term",
    topicLabel: "시간의 마법",
    Icon: Hourglass,
    tone: "growth",
    headline: "오늘의 가격은 2040년의 당신에게 \"헐값\"이 됩니다.",
    body: "버핏이 1988년 코카콜라를 비싸게 샀다고 했던 그 가격은, 오늘 보면 28배 헐값이었어요.\n시간은 좋은 기업의 가장 강력한 친구예요.",
  },
  {
    id: "panic-sell",
    topic: "long_term",
    topicLabel: "버티기",
    Icon: Mountain,
    tone: "growth",
    headline: "2년 공부해서 산 주식을, 한 번의 패닉이 날립니다.",
    body: "수많은 사람이 \"공부\"는 했지만 \"멘탈\"은 훈련 안 해서 -40%에 손절했어요.\n그리고 그 주식이 3배 오르는 걸 뉴스로만 봅니다. 당신은 다르게 살자.",
  },
  {
    id: "compounding-mind",
    topic: "long_term",
    topicLabel: "복리",
    Icon: Brain,
    tone: "growth",
    headline: "투자 멘탈도 복리예요.",
    body: "오늘 0.5%, 내일 0.5% — 매일 누적되면 1년 뒤 완전히 다른 사람이 돼요.\n하루는 별것 아니지만, 매일은 모든 것을 바꿉니다.",
  },
  {
    id: "noise-vs-signal",
    topic: "circle",
    topicLabel: "소음 차단",
    Icon: VolumeX,
    tone: "wisdom",
    headline: "애널리스트 목표가는 소음, 사업의 본질은 신호.",
    body: "목표가 하향에 흔들리지 마세요. 그건 단기 의견이에요.\n질문은 단 하나: \"내가 이 회사를 산 이유가 무너졌는가?\"",
  },
];

function getTodayCard(): MindsetCard {
  const today = new Date();
  const dayKey = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
  return CARDS[dayKey % CARDS.length];
}

export function RichMindsetCard() {
  const card = getTodayCard();
  const t = toneClasses[card.tone];
  const Icon = card.Icon;

  return (
    <section
      aria-label="오늘의 마인드셋"
      className="rounded-2xl border border-border bg-card p-4 animate-fade-in"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${t.bg} ${t.fg}`}
        >
          <Icon className="w-4 h-4" strokeWidth={2} />
        </span>
        <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          오늘의 마인드셋
        </span>
        <span className={`text-[11px] font-bold ${t.fg}`}>· {card.topicLabel}</span>
      </div>
      <p className="text-body font-bold text-foreground leading-snug mb-2">
        {card.headline}
      </p>
      <p className="text-small text-muted-foreground leading-relaxed whitespace-pre-line">
        {card.body}
      </p>
      {card.source && (
        <p className="text-[11px] text-muted-foreground mt-3 italic">— {card.source}</p>
      )}
    </section>
  );
}
