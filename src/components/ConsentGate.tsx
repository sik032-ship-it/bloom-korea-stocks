import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PpuriButton } from "@/components/PpuriButton";
import { Checkbox } from "@/components/ui/checkbox";

const TERMS_VERSION = "2026-04-20";
const PRIVACY_VERSION = "2026-04-20";

/**
 * AppGate (구 ConsentGate)
 * 인증된 사용자에 대해 순차적으로 확인:
 *  1) consented_at 없음 → 동의 화면
 *  2) onboarded_at 없음 → /onboarding 강제 리다이렉트 (온보딩/공개 경로 제외)
 *  3) 통과 → children
 * profile을 한 번만 조회한다.
 */
export function ConsentGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 온보딩 페이지 자체나 공개성 라우트에서는 리다이렉트하지 않는다.
  const isOnboardingRoute = location.pathname.startsWith("/onboarding");

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setChecking(false);
      setNeedsConsent(false);
      setNeedsOnboarding(false);
      return;
    }
    (async () => {
      // 트리거가 아직 profiles 행을 못 만든 경우를 대비해 짧은 재시도
      for (let i = 0; i < 3; i++) {
        const { data } = await supabase
          .from("profiles")
          .select("consented_at, onboarded_at")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (data) {
          setNeedsConsent(!data.consented_at);
          setNeedsOnboarding(!data.onboarded_at);
          setChecking(false);
          return;
        }
        await new Promise((r) => setTimeout(r, 400));
      }
      if (!cancelled) {
        // profile 자체가 없으면 신규 가입자로 간주
        setNeedsConsent(true);
        setNeedsOnboarding(true);
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // consent 통과 후 onboarding 필요하면 자동 리다이렉트
  useEffect(() => {
    if (checking || needsConsent) return;
    if (needsOnboarding && !isOnboardingRoute) {
      navigate("/onboarding", { replace: true });
    }
  }, [checking, needsConsent, needsOnboarding, isOnboardingRoute, navigate]);

  const allAgreed = agreeTerms && agreePrivacy && agreeAge;

  const handleAccept = async () => {
    if (!user || !allAgreed || saving) return;
    setSaving(true);
    setError("");
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        consented_at: new Date().toISOString(),
        consent_terms_version: TERMS_VERSION,
        consent_privacy_version: PRIVACY_VERSION,
      },
      { onConflict: "id" },
    );
    if (upsertError) {
      setError("동의 정보를 저장하지 못했어요. 다시 시도해주세요.");
      setSaving(false);
      return;
    }
    setNeedsConsent(false);
    setSaving(false);
  };

  const handleDecline = async () => {
    await supabase.auth.signOut();
  };

  if (!user || checking) {
    return <>{children}</>;
  }

  if (needsConsent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-6">
            <span className="text-5xl block mb-3">🌱</span>
            <h1 className="text-2xl font-bold text-foreground mb-2">PPURI 시작 전에</h1>
            <p className="text-small text-muted-foreground">
              안전한 학습 환경을 위해<br />아래 항목에 동의해주세요.
            </p>
          </div>

          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={() => {
                const next = !allAgreed;
                setAgreeTerms(next);
                setAgreePrivacy(next);
                setAgreeAge(next);
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                allAgreed ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <Checkbox checked={allAgreed} className="pointer-events-none" />
              <span className="text-body font-bold text-foreground">전체 동의</span>
            </button>

            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={agreeTerms}
                onCheckedChange={(c) => setAgreeTerms(c === true)}
                className="mt-0.5"
              />
              <span className="flex-1 text-small text-foreground">
                <span className="text-destructive">[필수]</span>{" "}
                <Link to="/terms" target="_blank" className="underline underline-offset-2">
                  이용약관
                </Link>
                에 동의합니다.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={agreePrivacy}
                onCheckedChange={(c) => setAgreePrivacy(c === true)}
                className="mt-0.5"
              />
              <span className="flex-1 text-small text-foreground">
                <span className="text-destructive">[필수]</span>{" "}
                <Link to="/privacy" target="_blank" className="underline underline-offset-2">
                  개인정보 처리방침
                </Link>
                에 동의합니다.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={agreeAge}
                onCheckedChange={(c) => setAgreeAge(c === true)}
                className="mt-0.5"
              />
              <span className="flex-1 text-small text-foreground">
                <span className="text-destructive">[필수]</span> 만 14세 이상입니다.
              </span>
            </label>
          </div>

          {error && (
            <p className="text-small text-destructive text-center mb-3 animate-fade-in">{error}</p>
          )}

          <PpuriButton fullWidth onClick={handleAccept} disabled={!allAgreed || saving}>
            {saving ? "저장 중..." : "동의하고 시작하기 🌱"}
          </PpuriButton>

          <button
            onClick={handleDecline}
            className="w-full mt-3 py-3 text-small text-muted-foreground hover:text-foreground transition-colors"
          >
            동의하지 않고 로그아웃
          </button>
        </div>
      </div>
    );
  }

  // 온보딩 필요하지만 이미 /onboarding에 있으면 children(온보딩 페이지) 렌더
  // 아니면 위 useEffect가 리다이렉트 중이므로 잠깐 빈 화면
  if (needsOnboarding && !isOnboardingRoute) {
    return null;
  }

  return <>{children}</>;
}
