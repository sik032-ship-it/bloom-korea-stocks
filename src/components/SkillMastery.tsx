import React from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryLabels, type QuizCategory } from "@/data/quizQuestions";

interface SkillMasteryProps {
  /** Map of category → number of correct answers */
  categoryScores: Record<QuizCategory, number>;
  totalLessons: number;
}

const MASTERY_THRESHOLDS = [
  { min: 0, label: "입문", color: "#9CA3AF" },
  { min: 5, label: "초급", color: "#F59E0B" },
  { min: 15, label: "중급", color: "#3B82F6" },
  { min: 30, label: "고급", color: "#8B5CF6" },
  { min: 50, label: "마스터", color: "#58CC02" },
];

function getMastery(score: number) {
  return [...MASTERY_THRESHOLDS].reverse().find(t => score >= t.min) || MASTERY_THRESHOLDS[0];
}

function getNextThreshold(score: number) {
  const next = MASTERY_THRESHOLDS.find(t => t.min > score);
  return next || null;
}

export function SkillMastery({ categoryScores, totalLessons }: SkillMasteryProps) {
  const categories: QuizCategory[] = ["risk", "psychology", "crisis", "judgment"];
  
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-small font-bold text-foreground">🧠 투자 스킬 트리</p>
        <span className="text-[10px] text-muted-foreground">{totalLessons}회 학습</span>
      </div>
      
      <div className="space-y-3">
        {categories.map(cat => {
          const meta = categoryLabels[cat];
          const score = categoryScores[cat] || 0;
          const mastery = getMastery(score);
          const next = getNextThreshold(score);
          const progress = next 
            ? ((score - mastery.min) / (next.min - mastery.min)) * 100
            : 100;

          return (
            <div key={cat} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: meta.color + "15" }}>
                <CategoryIcon category={cat} size={14} color={meta.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-foreground">{meta.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: mastery.color + "15", color: mastery.color }}>
                    {mastery.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: meta.color }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground w-8 text-right">{score}점</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlock hint */}
      {totalLessons < 5 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            매일 레슨을 완료하면 스킬이 올라가요! 🌱
          </p>
        </div>
      )}
    </div>
  );
}
