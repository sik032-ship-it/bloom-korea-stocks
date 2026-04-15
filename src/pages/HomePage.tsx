import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { Mascot } from "@/components/Mascot";
import { LevelBadge } from "@/components/LevelBadge";
import { SpeechBubble } from "@/components/SpeechBubble";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { HomeSkeleton } from "@/components/HomeSkeleton";
import { getProgressToNextLevel } from "@/utils/levelSystem";
import type { Database } from "@/integrations/supabase/types";
import { getProgressToNextLevel } from "@/utils/levelSystem";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "좋은 아침이에요! ☀️";
  if (h >= 12 && h < 18) return "좋은 오후네요! 🌤️";
  return "좋은 저녁이에요! 🌙";
}

function getMascotMessage(todayDone: boolean, streak: number): string {
  if (todayDone) {
    if (streak >= 7) return "대단해요! 일주일 넘게 연속이에요! 🔥";
    if (streak >= 3) return "오늘도 완료! 연속 기록이 멋져요! ✨";
    return "오늘 레슨 완료! 내일도 기대할게요 😊";
  }
  if (streak >= 3) return `${streak}일 연속 중이에요! 오늘도 이어가볼까요?`;
  return "오늘의 도토리를 모으러 가볼까요? 🌰";
}

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayDone, setTodayDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data);
        const today = new Date().toISOString().split("T")[0];
        setTodayDone(data.last_sentence_date === today);
      }
      setLoading(false);
    };
    fetchProfile();

    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          setProfile(payload.new as Profile);
          const today = new Date().toISOString().split("T")[0];
          setTodayDone((payload.new as Profile).last_sentence_date === today);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <HomeSkeleton />
      </Layout>
    );
  }

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "투자자";
  const streak = profile?.current_streak || 0;
  const userLevel = Math.min(6, Math.max(1, profile?.current_level || 1));

  return (
    <Layout
      currentStreak={streak}
      longestStreak={profile?.longest_streak || 0}
    >
      <div className="stagger-children">
      {/* Mascot Greeting */}
      <div className="flex items-start gap-3 pt-2">
        <Mascot level={userLevel} size="lg" showLevelTag />
        <div className="flex-1">
          <p className="text-small text-muted-foreground">{getGreeting()}</p>
          <p className="text-title text-foreground font-bold mb-1">{displayName}님</p>
          <SpeechBubble>
            <p className="text-small text-foreground">
              {getMascotMessage(todayDone, streak)}
            </p>
          </SpeechBubble>
        </div>
      </div>

      {/* Today's Lesson CTA */}
      <PpuriCard className={todayDone ? "border-primary/20 bg-primary/5" : ""}>
        {todayDone ? (
          <div className="text-center py-3">
            <span className="text-4xl mb-2 block">✅</span>
            <p className="text-title text-foreground font-semibold">오늘 완료!</p>
            <p className="text-small text-muted-foreground">내일도 도토리를 모아봐요 🌰</p>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-body text-muted-foreground mb-3">오늘의 레슨이 기다리고 있어요</p>
            <button
              onClick={() => navigate("/lesson")}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-body shadow-sm hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              🌰 오늘의 레슨 시작하기
            </button>
          </div>
        )}
      </PpuriCard>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <PpuriCard className="text-center !p-3">
          <p className="text-2xl mb-1">📝</p>
          <p className="text-title text-primary font-bold">{profile?.total_sentences || 0}</p>
          <p className="text-xs text-muted-foreground">총 문장</p>
        </PpuriCard>
        <PpuriCard className="text-center !p-3">
          <p className={`text-2xl mb-1 ${streak > 0 ? "animate-streak-pulse" : ""}`}>🔥</p>
          <p className="text-title text-foreground font-bold">{streak}</p>
          <p className="text-xs text-muted-foreground">연속일</p>
        </PpuriCard>
        <PpuriCard className="text-center !p-3">
          <p className="text-2xl mb-1">🏆</p>
          <p className="text-title text-foreground font-bold">{profile?.longest_streak || 0}</p>
          <p className="text-xs text-muted-foreground">최장 기록</p>
        </PpuriCard>
      </div>

      {/* XP Progress to Next Level */}
      {(() => {
        const progress = getProgressToNextLevel(profile?.total_sentences || 0);
        return (
          <PpuriCard>
            <div className="flex items-center justify-between mb-2">
              <p className="text-small font-semibold text-foreground">다음 레벨까지</p>
              <span className="text-xs text-primary font-bold">{progress.current}/{progress.next}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Mascot level={userLevel} size="sm" />
              <span className="text-xs text-muted-foreground">
                {progress.percent >= 100 ? "최고 레벨 달성! 🏆" : `${Math.round(progress.percent)}% 달성`}
              </span>
            </div>
          </PpuriCard>
        );
      })()}

      {/* Weekly Activity Calendar */}
      <PpuriCard>
        <p className="text-small font-semibold text-foreground mb-3">📅 학습 캘린더</p>
        {user && <WeeklyCalendar userId={user.id} />}
      </PpuriCard>

      {/* Level Badge */}
      <PpuriCard>
        <div className="flex items-center gap-4">
          <Mascot level={userLevel} size="md" />
          <div className="flex-1">
            <LevelBadge totalSentences={profile?.total_sentences || 0} />
          </div>
        </div>
      </PpuriCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate("/practice")}
          className="py-3 rounded-xl border-2 border-primary/30 bg-primary/5 text-foreground font-medium text-small hover:bg-primary/10 transition-colors"
        >
          📚 연습장
        </button>
        <button
          onClick={() => navigate("/crisis")}
          className="py-3 rounded-xl border-2 border-border text-foreground font-medium text-small hover:bg-accent transition-colors"
        >
          🛡️ 위기
        </button>
        <button
          onClick={() => navigate("/archive")}
          className="py-3 rounded-xl border-2 border-border text-foreground font-medium text-small hover:bg-accent transition-colors"
        >
          📖 기록
        </button>
      </div>

      {/* Sign Out */}
      <div className="text-center">
        <button
          onClick={signOut}
          className="text-small text-muted-foreground hover:text-destructive"
        >
          로그아웃
        </button>
      </div>
    </Layout>
  );
}
