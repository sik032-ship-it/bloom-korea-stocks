import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { PpuriButton } from "@/components/PpuriButton";
import { MascotAvatar } from "@/components/MascotAvatar";
import { getLevelForCount } from "@/utils/levelSystem";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setDisplayName(data.display_name || "");
        }
        setLoading(false);
      });
  }, [user]);

  const handleSaveName = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", user.id);
    if (error) toast.error("저장 실패");
    else toast.success("닉네임이 변경되었어요");
    setSaving(false);
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    const [{ data: profileData }, { data: holdingsData }, { data: sentencesData }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("holdings").select("*").eq("user_id", user.id),
        supabase.from("sentences").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      profile: profileData,
      holdings: holdingsData,
      sentences: sentencesData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ppuri-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("데이터가 다운로드되었어요");
    setExporting(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const level = profile ? getLevelForCount(profile.total_sentences) : null;

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentStreak={profile?.current_streak || 0} longestStreak={profile?.longest_streak || 0}>
      <h1 className="text-display text-foreground">설정</h1>

      {/* Profile */}
      <PpuriCard>
        <div className="flex items-center gap-4 mb-4">
          <MascotAvatar level={level?.level || 1} size="lg" />
          <div>
            <p className="text-title text-foreground font-bold">{displayName || "투자자"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground">
              {profile?.created_at
                ? `${new Date(profile.created_at).toLocaleDateString("ko-KR")} 부터 시작`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="닉네임"
            className="flex-1 h-11 px-3 rounded-md bg-input border border-border text-small focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <PpuriButton onClick={handleSaveName} disabled={saving}>
            {saving ? "..." : "저장"}
          </PpuriButton>
        </div>
      </PpuriCard>

      {/* Holdings link */}
      <PpuriCard hoverable onClick={() => navigate("/holdings")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <p className="text-body font-medium text-foreground">보유 종목 관리</p>
          </div>
          <span className="text-muted-foreground">→</span>
        </div>
      </PpuriCard>

      {/* Data & Privacy */}
      <PpuriCard>
        <p className="text-small font-semibold text-foreground mb-3">📁 데이터 & 개인정보</p>
        <div className="space-y-2">
          <PpuriButton variant="secondary" fullWidth onClick={handleExport} disabled={exporting}>
            {exporting ? "내보내는 중..." : "📥 데이터 내보내기 (JSON)"}
          </PpuriButton>
        </div>
      </PpuriCard>

      {/* About */}
      <PpuriCard>
        <p className="text-small font-semibold text-foreground mb-3">ℹ️ 앱 정보</p>
        <div className="space-y-1">
          <p className="text-small text-foreground">🌱 PPURI v1.0.0</p>
          <p className="text-xs text-muted-foreground">투자 체질을 기르는 앱</p>
          <p className="text-xs text-muted-foreground italic">"우리는 이렇게 변합니다"</p>
        </div>
        <a
          href="mailto:feedback@ppuri.app"
          className="mt-3 block text-small text-primary hover:underline"
        >
          💬 피드백 보내기
        </a>
      </PpuriCard>

      {/* Logout */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full h-11 rounded-md bg-destructive text-destructive-foreground font-semibold text-body"
      >
        로그아웃
      </button>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="bg-card rounded-lg p-6 mx-6 max-w-sm w-full text-center animate-bounce-in">
            <p className="text-title text-foreground mb-4">로그아웃하시겠습니까?</p>
            <div className="flex gap-3">
              <PpuriButton variant="ghost" fullWidth onClick={() => setShowLogoutConfirm(false)}>
                취소
              </PpuriButton>
              <button
                onClick={handleLogout}
                className="flex-1 h-11 rounded-md bg-destructive text-destructive-foreground font-semibold"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-md p-3 text-center">
      <p className="text-title text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
