import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PpuriButton } from "@/components/PpuriButton";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { translateAuthError } from "@/utils/authErrors";
import { evaluatePassword } from "@/utils/passwordStrength";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const submittingRef = useRef(false);

  const passwordStrength = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit =
    password.length >= 8 &&
    passwordStrength.score >= 2 &&
    passwordsMatch &&
    !loading;

  // 복구 토큰으로 진입했는지 확인
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setIsRecoverySession(true);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setIsRecoverySession(true);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setError("");

    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 해요.");
      return;
    }
    if (passwordStrength.score < 2) {
      setError("비밀번호가 너무 약해요. 더 안전한 비밀번호를 사용해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않아요.");
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    submittingRef.current = false;

    if (error) {
      setError(translateAuthError(error));
    } else {
      setSuccess(true);
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/auth");
      }, 3000);
    }
  };

  if (!isRecoverySession) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <span className="text-5xl block mb-4">⚠️</span>
          <h1 className="text-xl font-bold text-foreground mb-2">유효하지 않은 링크예요</h1>
          <p className="text-small text-muted-foreground mb-6">
            비밀번호 재설정 링크가 만료되었거나 잘못되었어요.
          </p>
          <PpuriButton fullWidth onClick={() => navigate("/auth")}>
            로그인으로 돌아가기
          </PpuriButton>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <span className="text-5xl block mb-4 animate-bounce-in">✅</span>
          <h1 className="text-xl font-bold text-foreground mb-2">비밀번호가 변경되었어요</h1>
          <p className="text-small text-muted-foreground">
            잠시 후 로그인 페이지로 이동해요...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🔑</span>
          <h1 className="text-display text-foreground">새 비밀번호 설정</h1>
          <p className="text-small text-muted-foreground mt-1">
            안전한 비밀번호를 입력해주세요 (최소 8자)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="새 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full h-12 px-4 pr-12 rounded-xl bg-input border-2 border-border text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full h-12 px-4 rounded-xl bg-input border-2 border-border text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />

          {error && (
            <p className="text-small text-destructive text-center animate-fade-in">{error}</p>
          )}

          <PpuriButton type="submit" fullWidth disabled={loading}>
            {loading ? "변경 중..." : "비밀번호 변경"}
          </PpuriButton>
        </form>
      </div>
    </div>
  );
}
