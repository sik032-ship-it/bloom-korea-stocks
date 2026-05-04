// MentorCard — 위기/이탈/약속 모먼트에 등장하는 멘토 인용 카드
// 핵심: 디자인이 아닌 "타이밍"이 전환율을 만든다.
// 미니멀 라인 일러스트 + 한 줄 인용 + 10계명 태그 + 행동 CTA.

import { ReactNode } from "react";
import buffettImg from "@/assets/mentor-buffett.png";
import lynchImg from "@/assets/mentor-lynch.png";
import { cn } from "@/utils/cn";

export type MentorId = "buffett" | "lynch";

const MENTORS: Record<MentorId, { image: string; name: string; title: string }> = {
  buffett: {
    image: buffettImg,
    name: "워렌 버핏",
    title: "버크셔 해서웨이 회장",
  },
  lynch: {
    image: lynchImg,
    name: "피터 린치",
    title: "마젤란 펀드 전 운용역",
  },
};

interface Props {
  mentor: MentorId;
  quote: string;
  /** 10계명 번호 (1~10) — 우리 철학과 연결 */
  commandment?: number;
  commandmentLabel?: string;
  /** 행동 CTA — 사용자가 약속하게 만드는 동사 */
  ctaLabel?: string;
  onCta?: () => void;
  /** 보조 액션 (예: "그래도 매도하기") */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** 카드 밑단의 부연 한 줄 (선택) */
  footnote?: ReactNode;
  className?: string;
}

export function MentorCard({
  mentor,
  quote,
  commandment,
  commandmentLabel,
  ctaLabel,
  onCta,
  secondaryLabel,
  onSecondary,
  footnote,
  className,
}: Props) {
  const m = MENTORS[mentor];
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-card border border-border p-5 shadow-card overflow-hidden",
        className
      )}
    >
      {/* 인물 일러스트 (우측 상단, 카드 분위기 압도하지 않도록) */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-20 h-20 rounded-full bg-tone-growth-bg flex items-center justify-center overflow-hidden ring-1 ring-tone-growth-fg/15">
          <img
            src={m.image}
            alt={`${m.name} 일러스트`}
            width={160}
            height={160}
            loading="lazy"
            className="w-full h-full object-cover scale-110"
          />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs font-bold text-tone-growth-fg leading-none">{m.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{m.title}</p>
          {commandment && (
            <span className="inline-block mt-2 text-[10px] font-bold tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              10계명 #{commandment} {commandmentLabel ? `· ${commandmentLabel}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* 인용문 — 카드의 주인공 */}
      <blockquote className="mt-4 text-body text-foreground leading-relaxed font-medium">
        <span className="text-tone-growth-fg/40 text-2xl leading-none align-top mr-1">“</span>
        {quote}
        <span className="text-tone-growth-fg/40 text-2xl leading-none align-bottom ml-1">”</span>
      </blockquote>

      {footnote && (
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{footnote}</p>
      )}

      {/* CTA — 행동을 약속하게 만드는 동사 */}
      {(ctaLabel || secondaryLabel) && (
        <div className="mt-5 space-y-2">
          {ctaLabel && (
            <button
              onClick={onCta}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-small press-effect hover:opacity-95 transition-opacity"
            >
              {ctaLabel}
            </button>
          )}
          {secondaryLabel && (
            <button
              onClick={onSecondary}
              className="w-full py-2.5 rounded-xl bg-transparent text-muted-foreground text-xs hover:text-foreground transition-colors"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
