// Big 4 앵커 종목 학습 카드 — MSFT/GOOGL/AMZN/AAPL
// "왜 이 회사인가"를 10계명 관점(브랜드/해자/일상소비/FCF/머무름)으로 매일 상기.
// 홈 가로 스크롤. 카드 탭 시 상세 모달.

import React, { useState } from "react";
import { X } from "lucide-react";

type Big4 = {
  ticker: "MSFT" | "GOOGL" | "AMZN" | "AAPL";
  emoji: string;
  nameKr: string;
  oneLiner: string;        // 한 줄 정체성
  why: string[];           // "왜 이 회사인가" 3-5개 근거 (10계명 매핑)
  daily: string;           // 일상에서 매일 마주치는 접점
  moat: string;            // 해자
  fcf: string;             // 잉여현금흐름 관점
  mantra: string;          // 핵심 한 줄 만트라
};

const BIG4: Big4[] = [
  {
    ticker: "MSFT",
    emoji: "🪟",
    nameKr: "마이크로소프트",
    oneLiner: "전 세계 사무실의 운영체제 + 클라우드의 한 축",
    why: [
      "Windows · Office · Teams — 직장인의 하루를 깔고 있는 인프라",
      "Azure: 클라우드 빅3의 한 축, B2B 락인이 강력함",
      "구독 매출(Office 365, Azure)로 예측 가능한 현금흐름",
      "기업 고객 → 가격 결정력 + 낮은 이탈률",
    ],
    daily: "당신이 회사에서 켜는 PC, 메일, 엑셀, 팀즈 — 거의 다 MS",
    moat: "수십억 사용자의 학습 비용(Office 단축키 한 번 익히면 못 떠남) + 기업 IT 락인",
    fcf: "연 700억 달러+의 잉여현금흐름. 매년 자사주 매입 + 배당으로 주주 환원",
    mantra: "사무실이 사라지지 않는 한, MS는 사라지지 않는다.",
  },
  {
    ticker: "GOOGL",
    emoji: "🔎",
    nameKr: "구글(알파벳)",
    oneLiner: "인류가 무언가를 궁금해할 때 가장 먼저 켜는 창",
    why: [
      "검색 = 지구상 가장 강력한 광고 비즈니스 (점유율 90%+)",
      "YouTube: 영상 시대의 기본 인프라",
      "Android: 세계 모바일의 70%+",
      "광고 + 클라우드 + AI(제미나이) 다층 수익원",
    ],
    daily: "검색 한 번, 유튜브 한 클립, 안드로이드 알림 — 매일 수십 번",
    moat: "전 세계 검색 데이터의 압도적 축적 → AI 시대에도 첫 줄에 서는 회사",
    fcf: "연 700억 달러+ FCF. 광고 사이클이 바닥이어도 흑자",
    mantra: "사람들이 궁금해하는 한, 구글은 돈을 번다.",
  },
  {
    ticker: "AMZN",
    emoji: "📦",
    nameKr: "아마존",
    oneLiner: "지구상 가장 큰 매장 + 가장 큰 클라우드",
    why: [
      "전자상거래: 미국 온라인 쇼핑의 38%+ — 일상 인프라",
      "AWS: 클라우드 시장 1위, 인터넷의 절반이 여기 위에 돔",
      "프라임 멤버십: 강력한 락인 + 반복 구매",
      "광고 사업까지 확장 중 — 매년 새 수익 기둥 추가",
    ],
    daily: "오늘 시킨 그 물건, 그 영상 스트리밍, 그 회사가 쓰는 서버",
    moat: "물류 네트워크(풀필먼트 센터 수백 개) + AWS 전환 비용 + 프라임 습관",
    fcf: "재투자가 많아 FCF는 낮아 보이지만, 영업현금흐름은 1,000억 달러+",
    mantra: "사람들이 물건을 사고 인터넷을 쓰는 한, 아마존은 자란다.",
  },
  {
    ticker: "AAPL",
    emoji: "🍎",
    nameKr: "애플",
    oneLiner: "전 세계에서 가장 강력한 브랜드 + 충성 고객 생태계",
    why: [
      "iPhone — 한 번 사면 잘 안 떠나는 생태계 (App Store, iCloud, AirPods…)",
      "서비스 매출 비중 증가 → 더 안정적인 현금흐름",
      "고객 충성도 95%+ — 가격 결정력의 화신",
      "버핏의 최대 보유 종목 (이유는 \"브랜드 해자\")",
    ],
    daily: "당신이 매일 손에 쥐는 그 직사각형, 그 무선 이어폰",
    moat: "브랜드 + 생태계 락인 = 공장으로는 절대 못 사는 자산",
    fcf: "연 1,000억 달러+ FCF. 자사주 매입의 끝판왕 — 주식 수가 매년 줄어듦",
    mantra: "공장은 누구나 짓지만, 애플의 충성도는 누구도 못 산다.",
  },
];

export function Big4Cards() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const open = openIdx !== null ? BIG4[openIdx] : null;

  return (
    <section aria-label="Big 4 앵커 종목" className="animate-fade-in">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-small font-bold text-foreground">
          🌳 우리의 4그루 나무
        </h2>
        <span className="text-[11px] text-muted-foreground">탭해서 보기</span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 px-1 leading-relaxed">
        10년 뒤에도 사람들이 쓸 회사. 우리는 이 4개에 머문다.
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {BIG4.map((c, i) => (
          <button
            key={c.ticker}
            onClick={() => setOpenIdx(i)}
            className="snap-start shrink-0 w-[140px] h-[150px] rounded-2xl border border-border bg-card p-3 text-left hover:border-primary/40 hover:shadow-sm transition-all press-effect flex flex-col"
          >
            <div className="text-2xl mb-1">{c.emoji}</div>
            <div className="text-xs font-bold text-primary tabular-nums mb-0.5">
              {c.ticker}
            </div>
            <div className="text-small font-bold text-foreground mb-1">{c.nameKr}</div>
            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-3 mt-auto">
              {c.oneLiner}
            </p>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm"
          onClick={() => setOpenIdx(null)}
        >
          <div
            className="bg-card rounded-t-2xl sm:rounded-2xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{open.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-primary tabular-nums">{open.ticker}</p>
                  <h3 className="text-title font-bold text-foreground">{open.nameKr}</h3>
                </div>
              </div>
              <button
                onClick={() => setOpenIdx(null)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-small text-foreground leading-relaxed mb-4 italic">
              "{open.oneLiner}"
            </p>

            <Section label="왜 이 회사인가" emoji="🎯">
              <ul className="space-y-1.5">
                {open.why.map((w, i) => (
                  <li key={i} className="text-small text-foreground leading-relaxed flex gap-2">
                    <span className="text-primary shrink-0">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section label="일상 접점" emoji="☕">
              <p className="text-small text-foreground leading-relaxed">{open.daily}</p>
            </Section>

            <Section label="해자(Moat)" emoji="🏰">
              <p className="text-small text-foreground leading-relaxed">{open.moat}</p>
            </Section>

            <Section label="잉여현금흐름(FCF)" emoji="💧">
              <p className="text-small text-foreground leading-relaxed">{open.fcf}</p>
            </Section>

            <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-3">
              <p className="text-[11px] font-bold text-primary tracking-wide mb-1">오늘의 만트라</p>
              <p className="text-small font-bold text-foreground leading-snug">{open.mantra}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Section({ label, emoji, children }: { label: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-bold text-muted-foreground tracking-wide mb-1">
        {emoji} {label}
      </p>
      {children}
    </div>
  );
}
