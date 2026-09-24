import { Link } from "react-router-dom";
import { Target, RotateCcw, Trophy, TrendingUp } from "lucide-react";
import { PpuriCard } from "@/components/PpuriCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryLabels, toneClasses } from "@/data/quizQuestions";
import { coachLine, type WeaknessProfile } from "@/lib/weaknessCoach";

export function WeaknessReport({ profile }: { profile: WeaknessProfile }) {
  return (
    <PpuriCard className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="text-body font-extrabold text-foreground">나만의 약점 지도</h2>
      </div>
      <p className="text-small text-muted-foreground leading-relaxed">{coachLine(profile)}</p>

      {profile.ready && (
        <>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="rounded-xl bg-tone-caution-bg p-3">
              <RotateCcw className="w-4 h-4 text-tone-caution" />
              <p className="text-[22px] font-extrabold text-foreground mt-1">{profile.reviewKeys.length}</p>
              <p className="text-xs text-muted-foreground">다시 볼 오답</p>
            </div>
            <div className="rounded-xl bg-tone-growth-bg p-3">
              <Trophy className="w-4 h-4 text-tone-growth" />
              <p className="text-[22px] font-extrabold text-foreground mt-1">{profile.masteredKeys}</p>
              <p className="text-xs text-muted-foreground">극복한 문제</p>
            </div>
          </div>

          {profile.weakest.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold text-muted-foreground">집중해야 할 주제</p>
              {profile.weakest.map((w) => {
                const c = categoryLabels[w.category];
                const t = toneClasses[c.tone];
                const pct = Math.round((w.correct / w.attempts) * 100);
                const improving = w.recentAccuracy !== null && w.prevAccuracy !== null && w.recentAccuracy > w.prevAccuracy;
                return (
                  <div key={w.category} className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.bg} ${t.fg}`}>
                      <CategoryIcon category={w.category} size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-small">
                        <span className="font-bold text-foreground truncate">{c.name}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          {improving && <TrendingUp className="w-3.5 h-3.5 text-tone-growth" />}
                          {pct}% · {w.attempts}문제
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted mt-1 overflow-hidden">
                        <div className="h-full bg-tone-caution rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {profile.strongest && (
            <p className="text-xs text-muted-foreground mt-3">
              나의 무기: <span className="font-bold text-tone-growth">{categoryLabels[profile.strongest.category].name}</span>
            </p>
          )}

          <Link
            to="/lesson"
            className="mt-4 block w-full text-center py-3 rounded-xl bg-primary text-primary-foreground font-bold text-small press-effect"
          >
            약점 집중 코칭 받기
          </Link>
        </>
      )}
    </PpuriCard>
  );
}
