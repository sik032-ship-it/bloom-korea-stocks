import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyCalendarProps {
  userId: string;
}

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function getLast28Days(): string[] {
  const days: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export function WeeklyCalendar({ userId }: WeeklyCalendarProps) {
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      const since = new Date();
      since.setDate(since.getDate() - 28);
      const { data } = await supabase
        .from("sentences")
        .select("created_at")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .gte("created_at", since.toISOString());

      if (data) {
        const days = new Set(data.map((s) => s.created_at.split("T")[0]));
        setActiveDays(days);
      }
      setLoading(false);
    };
    fetchActivity();
  }, [userId]);

  const days = getLast28Days();
  const today = new Date().toISOString().split("T")[0];

  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  if (loading) {
    return (
      <div className="space-y-1.5">
        {[0, 1, 2, 3].map((wi) => (
          <div key={wi} className="flex justify-between">
            {[0, 1, 2, 3, 4, 5, 6].map((di) => (
              <div key={di} className="w-8 h-8 rounded-lg skeleton-shimmer" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-2 px-1">
        {DAY_LABELS.map((l) => (
          <span key={l} className="text-[10px] text-muted-foreground font-medium w-8 text-center">
            {l}
          </span>
        ))}
      </div>
      <div className="space-y-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex justify-between">
            {week.map((day) => {
              const isActive = activeDays.has(day);
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all duration-200 hover:scale-110 cursor-default ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isToday
                      ? "bg-accent border-2 border-primary/30 text-foreground"
                      : "bg-muted text-muted-foreground/40 hover:bg-muted-foreground/10"
                  }`}
                  title={day}
                >
                  {new Date(day + "T00:00:00").getDate()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-2">
        <span className="text-[10px] text-muted-foreground">안 함</span>
        <div className="w-3 h-3 rounded bg-muted" />
        <div className="w-3 h-3 rounded bg-primary" />
        <span className="text-[10px] text-muted-foreground">완료</span>
      </div>
    </div>
  );
}
