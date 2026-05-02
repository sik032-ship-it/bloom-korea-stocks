import { useEffect, useState } from "react";
import { Mascot } from "@/components/Mascot";

interface RewardPeakSequenceProps {
  message?: string;
  subMessage?: string;
  onDone: () => void;
}

/**
 * PX: 레슨 완료 직후의 감정 피크 — 1.6초 풀스크린 보상 모먼트.
 * 감정 곡선: 성취감 정점 → 자연스러운 결과 화면 전환.
 * 리텐션: 마스코트 점프 + 도토리 낙하 애니메이션으로 "내일도 보고 싶은 순간" 형성.
 */
export const RewardPeakSequence = ({
  message = "오늘의 한 걸음을 심었어요",
  subMessage = "내일도 함께 도토리를 모아봐요 🌰",
  onDone,
}: RewardPeakSequenceProps) => {
  const [phase, setPhase] = useState<"burst" | "settle" | "out">("burst");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("settle"), 600);
    const t2 = setTimeout(() => setPhase("out"), 1500);
    const t3 = setTimeout(onDone, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  // 떨어지는 도토리들 — 시각적 보상
  const acorns = [
    { left: "12%", delay: "0ms", size: "text-3xl" },
    { left: "28%", delay: "120ms", size: "text-2xl" },
    { left: "48%", delay: "60ms", size: "text-4xl" },
    { left: "68%", delay: "180ms", size: "text-2xl" },
    { left: "84%", delay: "240ms", size: "text-3xl" },
  ];

  return (
    <div
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center bg-primary/10 backdrop-blur-sm overflow-hidden transition-opacity duration-300 ${
        phase === "out" ? "opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
    >
      {/* 도토리 낙하 */}
      <div className="absolute inset-0 pointer-events-none">
        {acorns.map((a, i) => (
          <span
            key={i}
            className={`absolute top-[-10%] ${a.size} animate-acorn-fall`}
            style={{ left: a.left, animationDelay: a.delay }}
            aria-hidden
          >
            🌰
          </span>
        ))}
      </div>

      {/* 글로우 링 */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/15 animate-reward-pulse" aria-hidden />

      <Mascot
        mood="celebrate"
        size="xl"
        className={phase === "burst" ? "animate-reward-jump" : "animate-float"}
      />

      <div className="mt-6 text-center px-8 animate-scale-pop">
        <p className="text-display text-foreground font-bold mb-2">{message}</p>
        <p className="text-small text-muted-foreground whitespace-pre-line">{subMessage}</p>
      </div>
    </div>
  );
};
