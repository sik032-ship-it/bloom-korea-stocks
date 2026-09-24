// "오늘의 마인드셋" — 투자 귀재가 눈앞에서 직접 말하는 듯한 카드
// 날짜 기반 회전. 버핏/린치/멍거 초상 + 말풍선 스타일.

import React from "react";
import { Quote } from "lucide-react";
import { toneClasses, type CategoryTone } from "@/data/quizQuestions";
import mentorBuffett from "@/assets/mentor-buffett.png";
import mentorLynch from "@/assets/mentor-lynch.png";

type Mentor = "buffett" | "lynch" | "munger" | null;

interface MindsetCard {
  id: string;
  topicLabel: string;
  tone: CategoryTone;
  mentor: Mentor;
  // 귀재가 사용자에게 직접 던지는 한마디
  quote: string;
  // 짧은 해설 (뿌리의 목소리)
  note: string;
}

const MENTOR_META: Record<
  Exclude<Mentor, null>,
  { name: string; title: string; img?: string }
> = {
  buffett: { name: "워렌 버핏", title: "오마하의 현인", img: mentorBuffett },
  lynch: { name: "피터 린치", title: "마젤란 펀드의 전설", img: mentorLynch },
  munger: { name: "찰리 멍거", title: "버핏의 평생 파트너" },
};

const CARDS: MindsetCard[] = [
  {
    id: "buffett-no-bottom",
    topicLabel: "바닥 예측 금지",
    tone: "caution",
    mentor: "buffett",
    quote: "나도 바닥이 어딘지 모른다. 그런데 당신은 안다고 생각하나?",
    note: "세계 최고의 투자자조차 모르는 걸 우리가 알 리 없습니다. 바닥을 노리지 말고, 구간을 정하세요.",
  },
  {
    id: "lynch-crayon",
    topicLabel: "겸손 테스트",
    tone: "wisdom",
    mentor: "lynch",
    quote: "이 회사가 무슨 일을 하는지 크레용으로 그릴 수 없다면, 사지 마라.",
    note: "한 문장으로 설명 못 하는 회사는 아직 모르는 회사입니다. 단순함이 곧 안전이에요.",
  },
  {
    id: "buffett-circle",
    topicLabel: "능력의 원",
    tone: "wisdom",
    mentor: "buffett",
    quote: "내가 모르는 회사에는 투자하지 않는다. 그게 전부다.",
    note: "코카콜라, 애플, 코스트코 — 초등학생도 아는 기업만으로 그는 세계 최고가 됐습니다.",
  },
  {
    id: "lynch-know-why",
    topicLabel: "버티기",
    tone: "growth",
    mentor: "lynch",
    quote: "당신이 그 주식을 산 이유를 한 문장으로 말해보라. 못 하면 팔아라.",
    note: "산 이유가 분명한 사람만이 -30%에서도 흔들리지 않습니다. 오늘 문장 하나를 심어보세요.",
  },
  {
    id: "munger-humility",
    topicLabel: "겸손",
    tone: "wisdom",
    mentor: "munger",
    quote: "나는 평생 멍청한 짓을 피하려 했다. 천재가 되려는 것보다 효과적이었지.",
    note: "내가 틀릴 수 있다는 걸 인정하는 순간, 진짜 투자가 시작됩니다.",
  },
  {
    id: "buffett-time",
    topicLabel: "시간의 마법",
    tone: "growth",
    mentor: "buffett",
    quote: "주식시장은 참을성 없는 사람의 돈을 참을성 있는 사람에게 옮겨주는 장치다.",
    note: "1988년에 비싸게 샀다던 코카콜라는 오늘 약 36배입니다. 시간은 좋은 기업의 가장 강력한 친구예요.",
  },
  {
    id: "lynch-drop",
    topicLabel: "구간 대응",
    tone: "caution",
    mentor: "lynch",
    quote: "주식이 떨어졌다고 울지 마라. 좋은 회사가 세일 중인지부터 확인해라.",
    note: "일반인은 -15%에 도망치고, 부자는 미리 정한 구간에서 감정 없이 분할매수를 시작합니다.",
  },
  {
    id: "buffett-panic",
    topicLabel: "버티기",
    tone: "growth",
    mentor: "buffett",
    quote: "10년을 보유할 생각이 없다면, 10분도 보유하지 마라.",
    note: "2년 공부해서 산 주식을 한 번의 패닉이 날립니다. 멘탈도 훈련입니다. 매일 조금씩.",
  },
  {
    id: "lynch-noise",
    topicLabel: "소음 차단",
    tone: "wisdom",
    mentor: "lynch",
    quote: "목표가 하향? 그건 그들의 의견일 뿐이다. 회사가 무너졌는지가 질문이다.",
    note: "애널리스트 목표가는 소음, 사업의 본질은 신호. 내가 이 회사를 산 이유가 무너졌는지만 보세요.",
  },
  {
    id: "munger-compound",
    topicLabel: "복리",
    tone: "growth",
    mentor: "munger",
    quote: "복리의 첫 번째 규칙은, 절대 멈추지 않는 것이다.",
    note: "오늘 0.5%, 내일 0.5% — 매일 누적되면 1년 뒤 완전히 다른 사람이 됩니다.",
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
  const meta = card.mentor ? MENTOR_META[card.mentor] : null;

  return (
    <section
      aria-label="오늘의 마인드셋"
      className="rounded-2xl border border-border bg-card p-4 animate-fade-in overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${t.bg} ${t.fg}`}
        >
          <Quote className="w-4 h-4" strokeWidth={2} />
        </span>
        <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          오늘의 마인드셋
        </span>
        <span className={`text-[11px] font-bold ${t.fg}`}>· {card.topicLabel}</span>
      </div>

      <div className="flex items-start gap-3">
        {/* 귀재 초상 */}
        {meta && (
          <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
            {meta.img ? (
              <img
                src={meta.img}
                alt={meta.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-border shadow-sm animate-float"
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-2xl ${t.bg} ${t.fg} flex items-center justify-center text-lg font-black border-2 border-border shadow-sm`}
              >
                {meta.name[0]}
              </div>
            )}
            <div className="text-center">
              <p className="text-[11px] font-bold text-foreground leading-tight">{meta.name}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{meta.title}</p>
            </div>
          </div>
        )}

        {/* 말풍선 */}
        <div className="relative flex-1 min-w-0">
          <div
            className={`relative rounded-2xl rounded-tl-md ${t.bg} px-4 py-3 animate-scale-in`}
          >
            {/* 말풍선 꼬리 */}
            <span
              className={`absolute -left-1.5 top-3 w-3 h-3 rotate-45 ${t.bg} rounded-[3px]`}
              aria-hidden
            />
            <p className="relative text-[15px] font-bold text-foreground leading-snug">
              “{card.quote}”
            </p>
          </div>
        </div>
      </div>

      <p className="text-small text-muted-foreground leading-relaxed mt-3 pl-1 border-l-2 border-border ml-1">
        {card.note}
      </p>
    </section>
  );
}
