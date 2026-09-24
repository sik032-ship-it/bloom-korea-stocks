import { useMemo } from "react";
import { TrendingUp, Target, AlertTriangle } from "lucide-react";
import { PpuriCard } from "@/components/PpuriCard";
import { ProgressBar } from "@/components/ProgressBar";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryLabels, toneClasses, type QuizCategory, type CategoryTone } from "@/data/quizTypes";

export interface StatsAttempt {
  day: string;
  is_correct: boolean;
  category: string | null;
}

const TONE_TITLES: Record<CategoryTone, string> = {
  growth: "좋은 기업 · 머무르기",
  wisdom: "철학 · 판단",
  caution: "위기 · 심리",
  truth: "현금 · 실전",
};

const POINTS = 10;

export function QuizStatsDashboard({ attempts }: { attempts: StatsAttempt[] }) {
  // 카테고리별 정답률
  const byCategory = useMemo(() => {
    const m = new Map<string, { ok: number; all: number }>();
    attempts.forEach((a) => {
      const c = a.category || "기타";
      const cur = m.get(c) || { ok: 0, all: 0 };
      cur.all += 1;
      if (a.is_correct) cur.ok += 1;
      m.set(c, cur);
    });
    return m;
  }, [attempts]);

  // 톤별 정답률
  const byTone = useMemo(() => {
    const m = new Map<CategoryTone, { ok: number; all: number }>();
    byCategory.forEach((v, c) => {
      const tone = (categoryLabels[c as QuizCategory]?.tone ?? "truth") as CategoryTone;
      const cur = m.get(tone) || { ok: 0, all: 0 };
      cur.ok += v.ok;
      cur.all += v.all;
      m.set(tone, cur);
    });
    return m;
  }, [byCategory]);

  // 일별 누적 점수 (최근 30일)
  const dailyPoints = useMemo(() => {
    const days: { day: string; pts: number }[] = [];
    const map = new Map<string, number>();
    attempts.forEach((a) => {
      if (a.is_correct) map.set(a.day, (map.get(a.day) || 0) + POINTS);
    });
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      days.push({ day: d, pts: map.get(d) || 0 });
    }
    return days;
  }, [attempts]);

  const cumulative = useMemo(() => {
    let sum = 0;
    return dailyPoints.map((d) => (sum += d.pts));
  }, [dailyPoints]);

  const maxCum = Math.max(...cumulative, 1);

  // 가장 약한 카테고리 (3문제 이상 푼 것 중)
  const weakest = useMemo(() => {
    let worst: { c: string; ratio: number } | null = null;
    byCategory.forEach((v, c) => {
      if (v.all < 3) return;
      const ratio = v.ok / v.all;
      if (!worst || ratio < worst.ratio) worst = { c, ratio };
    });
    return worst;
  }, [byCategory]);

  if (attempts.length === 0) return null;

  const sortedCats = [...byCategory.entries()].sort((a, b) => b[1].all - a[1].all);

  return (
    <>
      {/* 누적 점수 흐름 */}
      <PpuriCard>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <p className="text-small font-bold text-foreground">누적 점수 흐름 (30일)</p>
        </div>
        <div className="flex items-end gap-[3px] h-24" aria-label="누적 점수 그래프">
          {cumulative.map((v, i) => (
            <div
              key={i}
              title={`${dailyPoints[i].day}: ${v}점`}
              className="flex-1 rounded-t-sm bg-primary/80 transition-all"
              style={{ height: `${Math.max(3, (v / maxCum) * 100)}%` }}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          지금까지 <span className="font-bold text-foreground">{cumulative[cumulative.length - 1] || 0}점</span>을 쌓았어요. 꾸준함이 곧 실력이에요.
        </p>
      </PpuriCard>

      {/* 톤별 정답률 */}
      <PpuriCard>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <p className="text-small font-bold text-foreground">영역별 정답률</p>
        </div>
        <div className="space-y-3">
          {(Object.keys(TONE_TITLES) as CategoryTone[]).map((tone) => {
            const v = byTone.get(tone);
            if (!v) return null;
            const pct = Math.round((v.ok / v.all) * 100);
            const t = toneClasses[tone];
            return (
              <div key={tone}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${t.fg}`}>{TONE_TITLES[tone]}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{v.ok}/{v.all} · {pct}%</span>
                </div>
                <ProgressBar value={pct} size="sm" />
              </div>
            );
          })}
        </div>
      </PpuriCard>

      {/* 카테고리별 상세 */}
      <PpuriCard>
        <p className="text-small font-bold text-foreground mb-3">주제별 성적</p>
        <div className="space-y-2.5">
          {sortedCats.map(([c, v]) => {
            const meta = categoryLabels[c as QuizCategory];
            const pct = Math.round((v.ok / v.all) * 100);
            return (
              <div key={c} className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta ? toneClasses[meta.tone].bg : "bg-muted"} ${meta ? toneClasses[meta.tone].fg : "text-muted-foreground"}`}>
                  {meta ? <CategoryIcon category={c as QuizCategory} size={14} /> : <span className="text-[10px]">?</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-foreground truncate">{meta?.name ?? c}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0 ml-2">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </PpuriCard>

      {/* 보완 포인트 */}
      {weakest && (
        <PpuriCard className="border-tone-caution-fg/30">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-tone-caution-fg shrink-0 mt-0.5" />
            <div>
              <p className="text-small font-bold text-foreground">
                "{categoryLabels[weakest.c as QuizCategory]?.name ?? weakest.c}"을 더 연습해보세요
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                정답률 {Math.round(weakest.ratio * 100)}%로 가장 아쉬운 영역이에요. 레슨 시작 전 주제를 골라 집중 훈련할 수 있어요.
              </p>
            </div>
          </div>
        </PpuriCard>
      )}
    </>
  );
}
