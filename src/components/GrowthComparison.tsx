import React, { useMemo } from "react";
import { TrendingUp, ArrowRight, Sparkles } from "lucide-react";

interface CrisisRecord {
  id: string;
  scenario_id: string;
  scenario_title: string;
  score: number;
  max_score: number;
  score_percentage: number;
  step_scores: number[];
  completed_at: string;
}

interface GrowthComparisonProps {
  records: CrisisRecord[];
}

export function GrowthComparison({ records }: GrowthComparisonProps) {
  const comparison = useMemo(() => {
    if (records.length < 3) return null;

    // Group by scenario
    const grouped: Record<string, CrisisRecord[]> = {};
    records.forEach(r => {
      if (!grouped[r.scenario_id]) grouped[r.scenario_id] = [];
      grouped[r.scenario_id].push(r);
    });

    // Find scenarios with multiple attempts
    const repeatedScenarios = Object.entries(grouped)
      .filter(([, recs]) => recs.length >= 2)
      .map(([id, recs]) => {
        const sorted = [...recs].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
        const first = sorted[0];
        const latest = sorted[sorted.length - 1];
        const change = latest.score_percentage - first.score_percentage;
        return { id, title: first.scenario_title, first, latest, change, attempts: sorted.length };
      })
      .sort((a, b) => b.change - a.change);

    // Overall behavioral shift
    const allSorted = [...records].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
    const earlyAvg = allSorted.slice(0, Math.ceil(allSorted.length / 3));
    const lateAvg = allSorted.slice(-Math.ceil(allSorted.length / 3));
    
    const earlyScore = Math.round(earlyAvg.reduce((s, r) => s + r.score_percentage, 0) / earlyAvg.length);
    const lateScore = Math.round(lateAvg.reduce((s, r) => s + r.score_percentage, 0) / lateAvg.length);

    // Behavioral label based on score ranges
    const getBehavior = (score: number) => {
      if (score >= 80) return "원칙 기반 분석";
      if (score >= 60) return "냉각기간 + 분석";
      if (score >= 40) return "혼합적 판단";
      return "감정적 반응";
    };

    return {
      repeatedScenarios,
      earlyScore,
      lateScore,
      earlyBehavior: getBehavior(earlyScore),
      lateBehavior: getBehavior(lateScore),
      totalChange: lateScore - earlyScore,
      earlyDate: new Date(allSorted[0].completed_at),
      lateDate: new Date(allSorted[allSorted.length - 1].completed_at,),
    };
  }, [records]);

  if (!comparison) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 text-center">
        <Sparkles size={20} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-small font-semibold text-foreground mb-1">성장 비교가 곧 열려요</p>
        <p className="text-xs text-muted-foreground">
          시뮬레이션을 3회 이상 완료하면<br />과거 vs 현재 판단 변화를 볼 수 있어요
        </p>
      </div>
    );
  }

  const daysDiff = Math.ceil((comparison.lateDate.getTime() - comparison.earlyDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeLabel = daysDiff >= 30 ? `${Math.floor(daysDiff / 30)}개월 전` : daysDiff >= 7 ? `${Math.floor(daysDiff / 7)}주 전` : `${daysDiff}일 전`;

  return (
    <div className="space-y-3">
      {/* Main behavioral shift card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-primary" />
          <p className="text-xs font-bold text-foreground">나의 판단 변화</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Before */}
          <div className="flex-1 bg-muted rounded-xl p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">{timeLabel}</p>
            <p className="text-lg font-black text-muted-foreground">{comparison.earlyScore}점</p>
            <div className="mt-1.5 bg-background rounded-lg px-2 py-1">
              <p className="text-[10px] font-semibold text-muted-foreground">{comparison.earlyBehavior}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1">
            <ArrowRight size={16} className={comparison.totalChange >= 0 ? "text-primary" : "text-destructive"} />
            <span className={`text-[10px] font-bold ${comparison.totalChange >= 0 ? "text-primary" : "text-destructive"}`}>
              {comparison.totalChange >= 0 ? "+" : ""}{comparison.totalChange}
            </span>
          </div>

          {/* After */}
          <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-primary mb-1">현재</p>
            <p className="text-lg font-black text-primary">{comparison.lateScore}점</p>
            <div className="mt-1.5 bg-primary/10 rounded-lg px-2 py-1">
              <p className="text-[10px] font-semibold text-primary">{comparison.lateBehavior}</p>
            </div>
          </div>
        </div>

        {comparison.totalChange > 0 && (
          <div className="mt-4 bg-primary/5 rounded-xl p-3 flex items-start gap-2">
            <Sparkles size={12} className="text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] text-foreground leading-relaxed">
              {comparison.totalChange >= 20
                ? `대단해요! 위기 상황에서 '${comparison.earlyBehavior}'에서 '${comparison.lateBehavior}'으로 성장했어요. 진짜 투자 체질이 바뀌고 있어요!`
                : `조금씩 성장하고 있어요. 꾸준히 연습하면 위기에서 흔들리지 않는 투자자가 될 수 있어요!`
              }
            </p>
          </div>
        )}
      </div>

      {/* Per-scenario comparison */}
      {comparison.repeatedScenarios.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-bold text-foreground mb-3">시나리오별 성장</p>
          <div className="space-y-3">
            {comparison.repeatedScenarios.slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">{s.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{s.first.score_percentage}점</span>
                    <ArrowRight size={10} className="text-muted-foreground" />
                    <span className="text-[10px] font-bold text-foreground">{s.latest.score_percentage}점</span>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  s.change > 0 ? "bg-primary/10 text-primary" : s.change === 0 ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"
                }`}>
                  {s.change > 0 ? "+" : ""}{s.change}점
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
