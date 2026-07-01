import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { Mascot } from "@/components/Mascot";
import { LevelBadge } from "@/components/LevelBadge";
import { SpeechBubble } from "@/components/SpeechBubble";
import { HomeSkeleton } from "@/components/HomeSkeleton";
import { TimeMachinePreview } from "@/components/TimeMachinePreview";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { RichMindsetCard } from "@/components/RichMindsetCard";
import { Big4Cards } from "@/components/Big4Cards";
import { StayDashboard } from "@/components/StayDashboard";
import { CrisisTriggerModal } from "@/components/CrisisTriggerModal";
import { getProgressToNextLevel } from "@/utils/levelSystem";
import { getHomeGreeting, getStreakBrokenMessage } from "@/utils/mascotDialogue";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Holding = Database["public"]["Tables"]["holdings"]["Row"];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayDone, setTodayDone] = useState(false);
  const [showStreakBroken, setShowStreakBroken] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(0);
  const [showFreezeUsed, setShowFreezeUsed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [{ data: profileData }, { data: holdingsData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("holdings").select("*").eq("user_id", user.id).eq("is_active", true).is("deleted_at", null),
      ]);

      if (profileData) {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        const p = profileData as Profile & { streak_freezes?: number | null };

        // 🛡️ Streak Freeze: 어제 레슨을 빠뜨렸지만 freeze가 남아있으면 자동 보호
        const missedYesterday =
          !!p.last_sentence_date &&
          p.last_sentence_date < yesterday &&
          p.current_streak > 0;
        const freezesLeft = p.streak_freezes ?? 0;

        if (missedYesterday && freezesLeft > 0) {
          // freeze 1개 차감 + last_sentence_date를 어제로 끌어올려 연속 유지
          const { data: updated } = await supabase
            .from("profiles")
            .update({
              streak_freezes: freezesLeft - 1,
              last_sentence_date: yesterday,
            })
            .eq("id", user.id)
            .select()
            .single();
          if (updated) {
            setProfile(updated);
            setTodayDone(updated.last_sentence_date === today);
            setShowFreezeUsed(true);
            setLoading(false);
            return;
          }
        }

        setProfile(profileData);
        setTodayDone(profileData.last_sentence_date === today);

        // PX: 첫 방문 30초 환영 — 신규 유저(문장 0, 마지막 기록 없음)에게 1회만
        const isBrandNew =
          (profileData.total_sentences ?? 0) === 0 &&
          !profileData.last_sentence_date;
        const seenWelcomeKey = `ppuri:welcome-seen:${user.id}`;
        if (isBrandNew && !localStorage.getItem(seenWelcomeKey)) {
          setShowWelcome(true);
        }

        if (profileData.last_sentence_date && profileData.last_sentence_date !== today) {
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
    experienceLevel: (profile as Profile & { experience_level?: string | null })?.experience_level ?? null,
  });

  const streakBrokenMsg = showStreakBroken ? getStreakBrokenMessage(previousStreak) : null;
  const progress = getProgressToNextLevel(profile?.total_sentences || 0);

  const dismissWelcome = (start: boolean) => {
    if (user) localStorage.setItem(`ppuri:welcome-seen:${user.id}`, "1");
    setShowWelcome(false);
    if (start) navigate("/lesson");
  };

  return (
    <Layout currentStreak={streak} longestStreak={profile?.longest_streak || 0}>
      {showWelcome && (
        <WelcomeOverlay
          displayName={displayName}
          onStart={() => dismissWelcome(true)}
          onSkip={() => dismissWelcome(false)}
        />
      )}
      <div className="stagger-children">
        {/* 스트릭 깨짐 배너 — Freeze 알림이 뜬 경우엔 겹치지 않게 숨김 */}
        {streakBrokenMsg && !showFreezeUsed && (
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


        {/* 🛡️ Streak Freeze 사용 알림 */}
        {showFreezeUsed && (
          <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
            <span className="text-2xl">🛡️</span>
            <div className="flex-1">
              <p className="text-small text-foreground font-bold mb-1">
                스트릭 보호권을 사용했어요!
              </p>
              <p className="text-xs text-muted-foreground">
                어제 못 했지만 연속 기록은 그대로 지켜줬어요.
                남은 보호권: <strong className="text-primary">{(profile as Profile & { streak_freezes?: number | null })?.streak_freezes ?? 0}개</strong>
              </p>
              <button
                onClick={() => setShowFreezeUsed(false)}
                className="text-xs text-primary font-medium mt-2 hover:underline"
              >
                고마워요! 오늘은 꼭 할게요 💪
              </button>
            </div>
          </div>
        )}

        {/* PX 히어로: 마스코트 + 인사 + CTA를 하나의 시선 흐름으로 묶음 */}
        <section aria-labelledby="today-cta" className="pt-2">
          <div className="flex items-start gap-3 mb-5">
            <Mascot level={userLevel} size="lg" showLevelTag mood={greeting.mood} />
            <div className="flex-1 min-w-0">
              <p className="text-small text-muted-foreground mb-1">{displayName}님</p>
              <SpeechBubble>
                <p className="text-small text-foreground whitespace-pre-line leading-relaxed">
                  {greeting.text}
                </p>
              </SpeechBubble>
            </div>
          </div>

          {/* 단일 주인공 CTA — 호흡 애니메이션으로 기대감 형성 */}
          {todayDone ? (
            <PpuriCard className="border-primary/20 bg-primary/5 text-center">
              <p className="text-title text-foreground font-semibold mb-1">✅ 오늘 완료!</p>
              <p className="text-xs text-muted-foreground mb-4">내일도 도토리를 모아봐요 🌰</p>
              <button
                onClick={() => navigate("/lesson")}
                className="w-full py-3 rounded-xl border-2 border-primary/30 bg-primary/5 text-primary font-bold text-small hover:bg-primary/10 transition-all press-effect"
              >
                📚 복습하기
              </button>
            </PpuriCard>
          ) : (
            <div className="text-center">
              <p id="today-cta" className="text-xs text-muted-foreground mb-2 tracking-wide">오늘의 레슨이 기다리고 있어요</p>
              <button
                onClick={() => navigate("/lesson")}
                className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-body hover:opacity-95 active:translate-y-0 transition-opacity press-effect animate-cta-breathe"
              >
                🌰 오늘의 레슨 시작하기
              </button>
              <p className="text-[11px] text-muted-foreground mt-2">3분이면 충분해요</p>
            </div>
          )}
        </section>

        {/* 보조 정보: 진행도 — 위계를 낮춰 CTA 다음 시선으로 */}
        <PpuriCard>
          <div className="flex items-center justify-between mb-2">
            <LevelBadge totalSentences={profile?.total_sentences || 0} />
            <span className="text-xs text-primary font-bold tabular-nums">{Math.round(progress.percent)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>📝 <strong className="text-foreground tabular-nums">{profile?.total_sentences || 0}</strong> 문장</span>
            <span>🔥 <strong className="text-foreground tabular-nums">{streak}</strong> 연속</span>
            <span>🏆 <strong className="text-foreground tabular-nums">{profile?.longest_streak || 0}</strong> 최장</span>
          </div>
        </PpuriCard>

        {/* 부자처럼 생각하기 — 매일 30초 마인드셋 카드 (복리식 누적) */}
        <RichMindsetCard />

        {/* Big 4 앵커 종목 — 우리의 4그루 나무 (10계명 매일 상기) */}
        <Big4Cards />

        {/* 머무름 대시보드 — When이 아니라 Where (10계명 #10) */}
        <StayDashboard holdings={holdings} />

        {/* Time Machine — daily companion */}
        <TimeMachinePreview holdingsTickers={holdings.map((h) => h.ticker)} />
      </div>

      {/* 위기 자동 트리거 — 보유 종목 -10% 이상 하락 시 멘토 카드 자동 노출 */}
      <CrisisTriggerModal tickers={holdings.map((h) => h.ticker)} />
    </Layout>
  );
}