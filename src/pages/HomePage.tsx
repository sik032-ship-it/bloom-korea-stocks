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
import { SkillMastery } from "@/components/SkillMastery";
import { CommunityStats } from "@/components/CommunityStats";
import { getProgressToNextLevel } from "@/utils/levelSystem";
import { getHomeGreeting, getStreakBrokenMessage } from "@/utils/mascotDialogue";
import type { Database } from "@/integrations/supabase/types";
import type { QuizCategory } from "@/data/quizQuestions";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Holding = Database["public"]["Tables"]["holdings"]["Row"];

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayDone, setTodayDone] = useState(false);
  const [showStreakBroken, setShowStreakBroken] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(0);
  const [categoryScores, setCategoryScores] = useState<Record<QuizCategory, number>>({ risk: 0, psychology: 0, crisis: 0, judgment: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [{ data: profileData }, { data: holdingsData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("holdings").select("*").eq("user_id", user.id).eq("is_active", true),
      ]);

      if (profileData) {
        setProfile(profileData);
        const today = new Date().toISOString().split("T")[0];
        setTodayDone(profileData.last_sentence_date === today);

        if (profileData.last_sentence_date && profileData.last_sentence_date !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          if (profileData.last_sentence_date < yesterday && profileData.longest_streak > 0 && profileData.current_streak === 0) {
            setPreviousStreak(profileData.longest_streak);
            setShowStreakBroken(true);
          }
        }
      }
      if (holdingsData) setHoldings(holdingsData);
      setLoading(false);
    };
    fetchData();

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
    return <Layout><HomeSkeleton /></Layout>;
  }

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "투자자";
  const streak = profile?.current_streak || 0;
  const userLevel = Math.min(6, Math.max(1, profile?.current_level || 1));

  const greeting = getHomeGreeting({
    displayName,
    streak,
    longestStreak: profile?.longest_streak || 0,
    totalSentences: profile?.total_sentences || 0,
    currentLevel: userLevel,
    todayDone,
    lastSentenceDate: profile?.last_sentence_date || null,
    holdingNames: holdings.map(h => h.company_name_kr),
  });

  const streakBrokenMsg = showStreakBroken ? getStreakBrokenMessage(previousStreak) : null;
  const progress = getProgressToNextLevel(profile?.total_sentences || 0);

  return (
    <Layout currentStreak={streak} longestStreak={profile?.longest_streak || 0}>
      <div className="stagger-children">
        {/* 스트릭 깨짐 위로 배너 */}
        {streakBrokenMsg && (
          <div className="bg-accent border border-border rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
            <Mascot mood={streakBrokenMsg.mood} size="sm" />
            <div className="flex-1">
              <p className="text-small text-foreground whitespace-pre-line">{streakBrokenMsg.text}</p>
              <button
                onClick={() => setShowStreakBroken(false)}
                className="text-xs text-primary font-medium mt-2 hover:underline"
              >
                알겠어요, 다시 시작! 💪
              </button>
            </div>
          </div>
        )}

        {/* Mascot Greeting */}
        <div className="flex items-start gap-3 pt-2">
          <Mascot level={userLevel} size="lg" showLevelTag mood={greeting.mood} />
          <div className="flex-1">
            <p className="text-title text-foreground font-bold mb-1">{displayName}님</p>
            <SpeechBubble>
              <p className="text-small text-foreground whitespace-pre-line">
                {greeting.text}
              </p>
            </SpeechBubble>
          </div>
        </div>

        {/* Today's Lesson CTA */}
        <PpuriCard className={todayDone ? "border-primary/20 bg-primary/5" : ""}>
          {todayDone ? (
            <div className="text-center py-2">
              <p className="text-title text-foreground font-semibold mb-1">✅ 오늘 완료!</p>
              <p className="text-xs text-muted-foreground mb-3">내일도 도토리를 모아봐요 🌰</p>
              <button
                onClick={() => navigate("/lesson")}
                className="w-full py-3 rounded-xl border-2 border-primary/30 bg-primary/5 text-primary font-bold text-small hover:bg-primary/10 transition-all press-effect"
              >
                📚 복습하기
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-small text-muted-foreground mb-3">오늘의 레슨이 기다리고 있어요</p>
              <button
                onClick={() => navigate("/lesson")}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-body shadow-button hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all press-effect"
              >
                🌰 오늘의 레슨 시작하기
              </button>
            </div>
          )}
        </PpuriCard>

        {/* Compact Stats + Level */}
        <PpuriCard>
          <div className="flex items-center gap-3 mb-3">
            <Mascot level={userLevel} size="sm" />
            <div className="flex-1">
              <LevelBadge totalSentences={profile?.total_sentences || 0} />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span className="text-xs text-primary font-bold">{Math.round(progress.percent)}%</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">📝 <strong className="text-foreground">{profile?.total_sentences || 0}</strong> 문장</span>
              <span className={`text-xs text-muted-foreground ${streak > 0 ? "" : ""}`}>🔥 <strong className="text-foreground">{streak}</strong> 연속</span>
              <span className="text-xs text-muted-foreground">🏆 <strong className="text-foreground">{profile?.longest_streak || 0}</strong> 최장</span>
            </div>
          </div>
        </PpuriCard>

        {/* Weekly Activity Calendar */}
        <PpuriCard>
          <p className="text-small font-semibold text-foreground mb-3">📅 학습 캘린더</p>
          {user && <WeeklyCalendar userId={user.id} />}
        </PpuriCard>

        {/* Quick Actions — 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/practice")}
            className="py-4 rounded-xl border-2 border-primary/30 bg-primary/5 text-foreground font-medium text-small hover:bg-primary/10 transition-all press-effect hover:-translate-y-0.5 flex flex-col items-center gap-1"
          >
            <span className="text-lg">📚</span>
            연습장
          </button>
          <button
            onClick={() => navigate("/crisis")}
            className="py-4 rounded-xl border-2 border-border text-foreground font-medium text-small hover:bg-accent transition-all press-effect hover:-translate-y-0.5 flex flex-col items-center gap-1"
          >
            <span className="text-lg">🛡️</span>
            위기 훈련
          </button>
          <button
            onClick={() => navigate("/archive")}
            className="py-4 rounded-xl border-2 border-border text-foreground font-medium text-small hover:bg-accent transition-all press-effect hover:-translate-y-0.5 flex flex-col items-center gap-1"
          >
            <span className="text-lg">📖</span>
            기록 보관소
          </button>
          <button
            onClick={() => navigate("/holdings")}
            className="py-4 rounded-xl border-2 border-border text-foreground font-medium text-small hover:bg-accent transition-all press-effect hover:-translate-y-0.5 flex flex-col items-center gap-1"
          >
            <span className="text-lg">📊</span>
            보유 종목
          </button>
        </div>
      </div>
    </Layout>
  );
}
