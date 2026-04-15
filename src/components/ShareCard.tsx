import React, { useRef, useCallback } from "react";
import { Shield, TrendingUp, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareCardProps {
  scenarioTitle: string;
  scorePercent: number;
  totalScore: number;
  maxScore: number;
  survivalLevel: string;
  survivalIcon: string;
  attemptCount: number;
  onClose: () => void;
}

export function ShareCard({
  scenarioTitle,
  scorePercent,
  totalScore,
  maxScore,
  survivalLevel,
  survivalIcon,
  attemptCount,
  onClose,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getGrade = () => {
    if (scorePercent >= 80) return { label: "위기 대응 마스터", color: "#58CC02", bg: "from-emerald-500 to-green-600" };
    if (scorePercent >= 60) return { label: "침착한 투자자", color: "#3B82F6", bg: "from-blue-500 to-indigo-600" };
    if (scorePercent >= 40) return { label: "성장 중인 투자자", color: "#F59E0B", bg: "from-amber-500 to-orange-600" };
    return { label: "도전하는 투자자", color: "#EF4444", bg: "from-red-500 to-pink-600" };
  };

  const grade = getGrade();

  const captureAndShare = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      // Use canvas to capture
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = 360 * scale;
      canvas.height = 480 * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 360, 480);
      if (scorePercent >= 80) {
        gradient.addColorStop(0, "#065f46");
        gradient.addColorStop(1, "#064e3b");
      } else if (scorePercent >= 60) {
        gradient.addColorStop(0, "#1e3a5f");
        gradient.addColorStop(1, "#1e293b");
      } else if (scorePercent >= 40) {
        gradient.addColorStop(0, "#78350f");
        gradient.addColorStop(1, "#451a03");
      } else {
        gradient.addColorStop(0, "#7f1d1d");
        gradient.addColorStop(1, "#450a0a");
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(0, 0, 360, 480, 24);
      ctx.fill();

      // Subtle pattern overlay
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 360, Math.random() * 480, Math.random() * 60 + 20, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Logo area
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.roundRect(24, 24, 80, 28, 14);
      ctx.fill();
      ctx.font = "bold 12px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("🌰 PPURI", 64, 43);

      // Title
      ctx.textAlign = "center";
      ctx.font = "bold 13px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("위기 시뮬레이션 결과", 180, 90);

      // Scenario name
      ctx.font = "bold 18px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(scenarioTitle, 180, 120);

      // Big score circle
      ctx.beginPath();
      ctx.arc(180, 210, 65, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(180, 210, 60, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();

      // Score arc
      ctx.beginPath();
      ctx.arc(180, 210, 55, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * scorePercent) / 100);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      // Score text
      ctx.font = "900 36px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${scorePercent}`, 180, 218);
      ctx.font = "bold 12px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("점", 180, 240);

      // Grade label
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      const gradeWidth = ctx.measureText(grade.label).width + 32;
      ctx.roundRect(180 - gradeWidth / 2, 290, gradeWidth, 30, 15);
      ctx.fill();
      ctx.font = "bold 13px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(grade.label, 180, 310);

      // Survival level
      ctx.font = "16px sans-serif";
      ctx.fillText(survivalIcon, 180, 350);
      ctx.font = "bold 12px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(survivalLevel, 180, 370);

      // Stats bar
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.roundRect(40, 390, 280, 40, 12);
      ctx.fill();

      ctx.font = "11px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(`${totalScore}/${maxScore}점`, 120, 414);
      ctx.fillText(`${attemptCount}회 도전`, 240, 414);

      // CTA
      ctx.font = "11px 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText("나도 도전하기 → ppuri.app", 180, 460);

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], "ppuri-crisis-result.png", { type: "image/png" });
            await navigator.share({
              title: `PPURI 위기 시뮬레이션 - ${scenarioTitle}`,
              text: `나의 위기 대응 점수: ${scorePercent}점! 🛡️ ${grade.label}`,
              files: [file],
            });
            return;
          } catch (e) {
            // fallthrough to download
          }
        }

        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ppuri-crisis-result.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("이미지가 저장되었어요!");
      }, "image/png");
    } catch (error) {
      toast.error("이미지 생성에 실패했어요");
    }
  }, [scenarioTitle, scorePercent, totalScore, maxScore, grade, survivalLevel, survivalIcon, attemptCount]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm">
        {/* Preview card */}
        <div
          ref={cardRef}
          className={`w-full aspect-[3/4] rounded-3xl bg-gradient-to-br ${grade.bg} p-6 flex flex-col items-center justify-center text-white relative overflow-hidden mb-4`}
        >
          {/* Decorative circles */}
          <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute bottom-12 left-4 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="bg-white/15 rounded-full px-3 py-1 mb-2">
              <span className="text-[10px] font-bold tracking-wider">🌰 PPURI</span>
            </div>
            <p className="text-[11px] text-white/60 mb-1">위기 시뮬레이션</p>
            <p className="text-sm font-bold mb-4">{scenarioTitle}</p>

            <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center mb-4 border-2 border-white/20">
              <div className="text-center">
                <p className="text-4xl font-black">{scorePercent}</p>
                <p className="text-[10px] text-white/60">점</p>
              </div>
            </div>

            <div className="bg-white/15 rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-bold">{grade.label}</span>
            </div>

            <div className="flex items-center gap-1 mb-2">
              <span className="text-base">{survivalIcon}</span>
              <span className="text-[11px] font-semibold text-white/80">{survivalLevel}</span>
            </div>

            <div className="bg-white/10 rounded-xl px-4 py-2 flex gap-6 mt-2">
              <div className="text-center">
                <p className="text-xs font-bold">{totalScore}/{maxScore}</p>
                <p className="text-[9px] text-white/50">점수</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold">{attemptCount}회</p>
                <p className="text-[9px] text-white/50">도전</p>
              </div>
            </div>
          </div>

          <p className="absolute bottom-3 text-[9px] text-white/30">나도 도전하기 → ppuri.app</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={captureAndShare}
            className="flex-1 py-3 rounded-xl bg-white text-gray-900 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <Share2 size={16} />
            공유하기
          </button>
          <button
            onClick={captureAndShare}
            className="py-3 px-4 rounded-xl bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
          >
            <Download size={16} />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 text-white/60 text-sm font-medium hover:text-white transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
