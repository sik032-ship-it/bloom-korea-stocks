import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PpuriButton } from "@/components/PpuriButton";
import { Checkbox } from "@/components/ui/checkbox";

const TERMS_VERSION = "2026-04-20";
const PRIVACY_VERSION = "2026-04-20";

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setChecking(false);
      setNeedsConsent(false);
      return;
    }
    (async () => {
      // 트리거가 아직 profiles 행을 못 만든 경우를 대비해 짧은 재시도
      for (let i = 0; i < 3; i++) {
        const { data } = await supabase
          .from("profiles")
          .select("consented_at")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (data) {
          setNeedsConsent(!data.consented_at);
          setChecking(false);
          return;
        }
        await new Promise((r) => setTimeout(r, 400));
      }
      // profiles 행 자체가 없으면 동의 필요로 간주
      if (!cancelled) {
        setNeedsConsent(true);
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const allAgreed = agreeTerms && agreePrivacy && agreeAge;

  const handleAccept = async () => {
    if (!user || !allAgreed || saving) return;
    setSaving(true);
    setError("");
    // upsert: profiles 행이 아직 없을 수도 있어 안전하게 처리
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

  if (!user || checking || !needsConsent) {
    return <>{children}</>;
  }

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
