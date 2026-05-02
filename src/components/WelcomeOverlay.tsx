import { useEffect, useState } from "react";
import { Mascot } from "@/components/Mascot";

interface WelcomeOverlayProps {
  displayName: string;
  onStart: () => void;
  onSkip: () => void;
}

/**
 * PX: 신규 유저의 첫 30초 — "환영 → 가치 약속 → 첫 행동"
 * 마찰 최소화: 0탭으로 핵심 CTA 도달, 닫기/시작 동시 제공.
 * 감정 곡선: 안심(반가움) → 기대(약속) → 행동(시작).
 */
export const WelcomeOverlay = ({ displayName, onStart, onSkip }: WelcomeOverlayProps) => {
  const [step, setStep] = useState(0);

  // 가벼운 자동 진행으로 "읽는 부담"을 줄임 (탭 0번에 가치 전달)
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1100);
    const t2 = setTimeout(() => setStep(2), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const lines = [
    { emoji: "👋", text: `${displayName}님, 만나서 반가워요!` },
    { emoji: "🌰", text: "하루 3분, 도토리처럼 작은 습관이\n투자 멘탈을 단단하게 만들어요." },
    { emoji: "✨", text: "오늘의 첫 도토리,\n지금 함께 심어볼까요?" },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md px-6 animate-fade-in"
      role="dialog"
      aria-label="환영"
    >
      {/* 우상단 가벼운 건너뛰기 — 마찰 ↓, 통제감 ↑ */}
      <button
        onClick={onSkip}
        className="absolute top-5 right-5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full"
        aria-label="환영 닫기"
      >
        건너뛰기
      </button>

      <Mascot mood="wave" size="xl" className="animate-float mb-6" />

      <div className="min-h-[112px] max-w-xs text-center mb-8">
        {lines.slice(0, step + 1).map((l, i) => (
          <p
            key={i}
            className={`whitespace-pre-line leading-relaxed mb-2 animate-fade-in ${
              i === step
                ? "text-body text-foreground font-semibold"
                : "text-small text-muted-foreground"
            }`}
          >
            <span className="mr-1">{l.emoji}</span>
            {l.text}
          </p>
        ))}
      </div>

      {/* 단계 인디케이터 */}
      <div className="flex gap-1.5 mb-8" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= step ? "w-6 bg-primary" : "w-1.5 bg-muted"
            }`}
          />
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-body shadow-button press-effect animate-cta-breathe"
      >
        🌰 첫 도토리 심기
      </button>
      <p className="text-[11px] text-muted-foreground mt-3">3분이면 충분해요</p>
    </div>
  );
};
