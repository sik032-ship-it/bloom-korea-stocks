import { ReminderPrompt } from "@/components/ReminderPrompt";
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

// 자정까지 남은 시간을 사람이 읽는 형태로 — "다음 레슨까지"에 사용
const formatTimeUntilTomorrow = (now: Date = new Date()): string => {
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const diffMs = tomorrow.getTime() - now.getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
};


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
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState(() => formatTimeUntilTomorrow());

  // 완료 후 "다음 레슨까지 X시간 Y분" 카운트다운 — 1분마다 갱신
  useEffect(() => {
    if (!todayDone) return;
    const tick = () => setTimeUntilTomorrow(formatTimeUntilTomorrow());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [todayDone]);


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
      <ReminderPrompt />
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

        {/* 히어로: 인사 한 줄 + 오늘의 한 가지 행동 */}
        <section aria-labelledby="today-cta" className="pt-1">
          <div className="flex items-center gap-3 mb-4">
            <Mascot level={userLevel} size="md" mood={greeting.mood} />
            <div className="flex-1 min-w-0">
              <p className="text-[22px] font-extrabold text-foreground leading-tight tracking-tight">
                {todayDone ? "오늘도 해냈어요" : "오늘도 1분, 시작해볼까요?"}
              </p>
              <p className="text-small text-muted-foreground mt-1 line-clamp-2 whitespace-pre-line">{greeting.text}</p>
            </div>
          </div>

          {todayDone ? (
            <div className="rounded-3xl bg-gradient-done border border-primary/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary tracking-wider">TODAY · DONE</p>
                  <p className="text-[26px] font-extrabold text-foreground leading-tight mt-1">오늘의 씨앗 심기 완료</p>
                </div>
                <span className="text-5xl" aria-hidden>🌳</span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">다음 레슨까지</p>
                  <p className="text-[28px] font-extrabold text-foreground tabular-nums leading-none mt-1">{timeUntilTomorrow}</p>
                </div>
                <button
                  onClick={() => navigate("/quiz-history")}
                  className="px-4 py-2.5 rounded-xl bg-card border border-border text-small font-bold text-foreground press-effect"
                >
                  오늘 푼 문제 보기
                </button>
              </div>
            </div>
          ) : (
            <button
              id="today-cta"
              onClick={() => navigate("/lesson")}
              className="w-full text-left rounded-3xl bg-gradient-hero shadow-hero p-5 text-primary-foreground press-effect animate-cta-breathe"
            >
              <p className="text-xs font-bold tracking-wider opacity-90">TODAY'S LESSON · 3분</p>
              <p className="text-[26px] font-extrabold leading-tight mt-1">오늘의 레슨 시작하기</p>
              <p className="text-small opacity-90 mt-1">퀴즈 몇 문제 + 나의 원칙 한 문장</p>
              <span className="inline-flex mt-4 items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1.5 text-small font-bold">
                🌰 지금 시작 →
              </span>
            </button>
          )}
        </section>

        {/* 핵심 숫자 3개 — 한눈에 */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: "🔥", value: streak, label: "연속 일수", tone: "bg-tone-caution-bg text-tone-caution-fg" },
            { icon: "📝", value: profile?.total_sentences || 0, label: "심은 문장", tone: "bg-tone-growth-bg text-tone-growth-fg" },
            { icon: "🏆", value: profile?.longest_streak || 0, label: "최장 기록", tone: "bg-tone-wisdom-bg text-tone-wisdom-fg" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-3.5 ${s.tone}`}>
              <span className="text-lg" aria-hidden>{s.icon}</span>
              <p className="text-[26px] font-extrabold tabular-nums leading-none mt-1">{s.value}</p>
              <p className="text-xs font-medium mt-1 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 레벨 진행 */}
        <PpuriCard>
          <div className="flex items-center justify-between mb-2">
            <LevelBadge totalSentences={profile?.total_sentences || 0} />
            <span className="text-small text-primary font-extrabold tabular-nums">{Math.round(progress.percent)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-hero rounded-full transition-all duration-700" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">다음 단계까지 꾸준히 한 문장씩 🌱</p>
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