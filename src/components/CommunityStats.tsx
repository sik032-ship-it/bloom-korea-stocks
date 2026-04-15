import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Flame, Trophy, TrendingUp } from "lucide-react";

interface CommunityStatsData {
  totalUsers: number;
  activeToday: number;
  totalCrisis: number;
  weeklyTop: number;
}

export function CommunityStats() {
  const [stats, setStats] = useState<CommunityStatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Get approximate community stats from public data
      const today = new Date().toISOString().split("T")[0];
      
      const [profilesRes, todayRes, crisisRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("last_sentence_date", today),
        supabase.from("crisis_results").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: Math.max(profilesRes.count || 0, 1),
        activeToday: Math.max(todayRes.count || 0, 1),
        totalCrisis: crisisRes.count || 0,
        weeklyTop: 0,
      });
    };

    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} className="text-primary" />
        <p className="text-small font-bold text-foreground">뿌리 커뮤니티</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-primary/5 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users size={11} className="text-primary" />
          </div>
          <p className="text-sm font-black text-foreground">{stats.totalUsers}</p>
          <p className="text-[9px] text-muted-foreground">총 투자자</p>
        </div>
        <div className="bg-primary/5 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame size={11} className="text-primary" />
          </div>
          <p className="text-sm font-black text-foreground">{stats.activeToday}</p>
          <p className="text-[9px] text-muted-foreground">오늘 학습</p>
        </div>
        <div className="bg-primary/5 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy size={11} className="text-primary" />
          </div>
          <p className="text-sm font-black text-foreground">{stats.totalCrisis}</p>
          <p className="text-[9px] text-muted-foreground">위기 도전</p>
        </div>
      </div>

      <div className="mt-3 bg-accent/30 rounded-xl px-3 py-2 flex items-center gap-2">
        <TrendingUp size={12} className="text-primary shrink-0" />
        <p className="text-[10px] text-muted-foreground">
          {stats.activeToday > 1 
            ? `오늘 ${stats.activeToday}명이 함께 학습하고 있어요! 🔥`
            : "오늘의 첫 번째 학습자가 되어보세요! 🌟"
          }
        </p>
      </div>
    </div>
  );
}
