import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { MascotAvatar } from "@/components/MascotAvatar";
import { LevelBadge } from "@/components/LevelBadge";
import { PpuriButton } from "@/components/PpuriButton";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "좋은 아침이에요! 🌱";
  if (h >= 12 && h < 18) return "좋은 오후네요! 🌱";
  return "좋은 저녁이에요! 🌱";
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

    // Real-time subscription
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </Layout>
    );
  }

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "투자자";
  const level = Math.min(6, Math.max(1, profile?.current_level || 1));

  return (
    <Layout
      currentStreak={profile?.current_streak || 0}
      longestStreak={profile?.longest_streak || 0}
    >
      {/* Greeting */}
      <div className="pt-2">
        <p className="text-small text-muted-foreground">{getGreeting()}</p>
        <p className="text-title text-foreground font-bold">{displayName}님</p>
      </div>

      {/* Sentence Counter */}
      <PpuriCard>
        <div className="text-center">
          <p className="text-display text-primary font-bold">
            총 {profile?.total_sentences || 0}문장
          </p>
          <p className="text-small text-muted-foreground mt-1">
            모두 당신의 투자 이력이에요
          </p>
        </div>
      </PpuriCard>

      {/* Level Badge */}
      <PpuriCard>
        <div className="flex items-center gap-4">
          <MascotAvatar level={level} size="lg" />
          <div className="flex-1">
            <LevelBadge totalSentences={profile?.total_sentences || 0} />
          </div>
        </div>
      </PpuriCard>

      {/* Today's Status */}
      <PpuriCard>
        {todayDone ? (
          <div className="text-center py-2">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-title text-foreground font-semibold">오늘 완료!</p>
            <p className="text-small text-muted-foreground">내일도 기대할게요</p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-body text-muted-foreground mb-3">오늘의 문장을 아직 안 썼어요</p>
            <PpuriButton fullWidth onClick={() => navigate("/lesson")}>
              ✍️ 오늘의 문장 쓰러 가기
            </PpuriButton>
          </div>
        )}
      </PpuriCard>

      {/* Streak */}
      <PpuriCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-2xl ${(profile?.current_streak || 0) > 0 ? "animate-streak-pulse" : ""}`}>🔥</span>
            <div>
              <p className="text-title text-foreground">{profile?.current_streak || 0}일 연속중</p>
              <p className="text-xs text-muted-foreground">최장 {profile?.longest_streak || 0}일</p>
            </div>
          </div>
        </div>
      </PpuriCard>

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
