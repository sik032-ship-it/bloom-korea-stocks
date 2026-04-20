import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PpuriButton } from "@/components/PpuriButton";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { translateAuthError } from "@/utils/authErrors";
import { evaluatePassword, validateEmail } from "@/utils/passwordStrength";
import { Shield, Brain, Crosshair, TrendingUp, Eye, EyeOff, X, Check } from "lucide-react";

const ONBOARDING_SLIDES = [
  {
    icon: Shield,
    iconColor: "hsl(var(--primary))",
    iconBg: "hsl(var(--primary) / 0.1)",
    title: "금융 지식보다\n더 중요한 것",
    subtitle: "좋은 투자자는 지식이 많은 사람이 아니에요.\n위험과 불확실성을 이해하는 사람이에요.",
    highlight: "Risk Literacy > Financial Literacy",
  },
  {
    icon: Brain,
    iconColor: "hsl(var(--ppuri-purple))",
    iconBg: "hsl(var(--ppuri-purple) / 0.1)",
    title: "감정을 다스리는\n투자 훈련",
    subtitle: "폭락장에서 패닉 매도하지 않는 힘,\nFOMO에 흔들리지 않는 판단력을 길러요.",
    highlight: "매일 1분, 시나리오 훈련",
  },
  {
    icon: Crosshair,
    iconColor: "hsl(var(--ppuri-blue))",
    iconBg: "hsl(var(--ppuri-blue) / 0.1)",
    title: "위기 시뮬레이션으로\n실전 대비",
    subtitle: "실제 역사 속 투자 위기를 미리 경험하고\n올바른 판단을 연습하세요.",
    highlight: "2008 금융위기, 코로나 폭락, FOMO 버블",
  },
  {
    icon: TrendingUp,
    iconColor: "hsl(var(--ppuri-amber))",
    iconBg: "hsl(var(--ppuri-amber) / 0.1)",
    title: "매일 성장하는\n나의 투자 체질",
    subtitle: "도토리처럼 매일 조금씩 쌓이면\n어떤 폭풍에도 흔들리지 않는 뿌리가 돼요.",
    highlight: "🌰 → 🌱 → 🌿 → 🌳 → 🌲 → 🏔️",
  },
];

function OnboardingSlides({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const goNext = useCallback(() => {
    if (current < ONBOARDING_SLIDES.length - 1) {
      setDirection("next");
      setCurrent(c => c + 1);
    } else {
      onComplete();
    }
  }, [current, onComplete]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setDirection("prev");
      setCurrent(c => c - 1);
    }
  }, [current]);

  useEffect(() => {
    const timer = setTimeout(goNext, 6000);
    return () => clearTimeout(timer);
  }, [current, goNext]);

  const slide = ONBOARDING_SLIDES[current];
  const Icon = slide.icon;

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (diff > 50) goNext();
        else if (diff < -50) goPrev();
        setTouchStart(null);
      }}
    >
      <div className="flex justify-end px-5 pt-4">
        <button
          onClick={onComplete}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
        >
          건너뛰기
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        <div
          key={current}
          className={`flex flex-col items-center text-center ${
            direction === "next" ? "animate-slide-up" : "animate-fade-in"
          }`}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: slide.iconBg }}
          >
            <Icon size={36} style={{ color: slide.iconColor }} />
          </div>
          <h1 className="text-[26px] leading-tight font-bold text-foreground mb-4 whitespace-pre-line">
            {slide.title}
          </h1>
          <p className="text-small text-muted-foreground leading-relaxed mb-6 whitespace-pre-line max-w-[280px]">
            {slide.subtitle}
          </p>
          <div className="px-4 py-2 rounded-full bg-muted border border-border">
            <p className="text-xs font-semibold text-foreground">{slide.highlight}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          {ONBOARDING_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? "next" : "prev"); setCurrent(i); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <button
          onClick={goNext}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-body shadow-button hover:opacity-90 transition-all press-effect"
        >
          {current === ONBOARDING_SLIDES.length - 1 ? "🌱 시작하기" : "다음"}
        </button>
      </div>
    </div>
  );
}

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);

  const emailCheck = useMemo(() => validateEmail(email), [email]);
  const showEmailError = email.length > 0 && !emailCheck.valid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!emailCheck.valid) {
      setError(emailCheck.message || "올바른 이메일을 입력해주세요.");
      return;
    }
    submittingRef.current = true;
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    submittingRef.current = false;
    if (error) setError(translateAuthError(error));
    else setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-sm bg-card border-2 border-border rounded-2xl p-6 relative animate-scale-pop">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-lg hover:bg-muted text-muted-foreground"
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        {sent ? (
          <div className="text-center py-4">
            <span className="text-5xl block mb-3">📧</span>
            <h2 className="text-xl font-bold text-foreground mb-2">이메일을 확인해주세요</h2>
            <p className="text-small text-muted-foreground mb-6">
              <strong className="text-foreground">{email}</strong>으로<br />
              비밀번호 재설정 링크를 보냈어요.
            </p>
            <PpuriButton fullWidth onClick={onClose}>확인</PpuriButton>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-foreground mb-2">비밀번호 찾기</h2>
            <p className="text-small text-muted-foreground mb-5">
              가입하신 이메일을 입력하시면<br />재설정 링크를 보내드려요.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <input
                type="email"
                inputMode="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={`w-full h-12 px-4 rounded-xl bg-input border-2 text-body text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                  showEmailError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                }`}
              />
              {showEmailError && (
                <p className="text-xs text-destructive animate-fade-in">{emailCheck.message}</p>
              )}
              {error && (
                <p className="text-small text-destructive text-center animate-fade-in">{error}</p>
              )}
              <PpuriButton type="submit" fullWidth disabled={loading || !emailCheck.valid}>
                {loading ? "전송 중..." : "재설정 링크 보내기"}
              </PpuriButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // 실시간 검증
  const emailCheck = useMemo(() => validateEmail(email), [email]);
  const showEmailError = email.length > 0 && !emailCheck.valid;
  const passwordStrength = useMemo(() => evaluatePassword(password), [password]);

  useEffect(() => {
    if (sessionStorage.getItem("ppuri_onboarding_seen")) {
      setShowOnboarding(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    sessionStorage.setItem("ppuri_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  const allAgreed = agreeTerms && agreePrivacy && agreeAge;
  const toggleAll = () => {
    const next = !(agreeTerms && agreePrivacy && agreeAge);
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setAgreeAge(next);
  };

  // 회원가입은 강도 2 이상(약함) 이상 + 모든 약관 + 8자 이상 필요
  const canSubmit = isLogin
    ? emailCheck.valid && password.length >= 6 && !loading
    : emailCheck.valid && password.length >= 8 && passwordStrength.score >= 2 && allAgreed && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return; // 중복 제출 방지
    setError("");

    if (!emailCheck.valid) {
      setError(emailCheck.message || "올바른 이메일을 입력해주세요.");
      return;
    }

    if (!isLogin) {
      if (password.length < 8) {
        setError("비밀번호는 최소 8자 이상이어야 해요.");
        return;
      }
      if (passwordStrength.score < 2) {
        setError("비밀번호가 너무 약해요. 더 안전한 비밀번호를 사용해주세요.");
        return;
      }
      if (!allAgreed) {
        setError("필수 항목에 모두 동의해주세요.");
        return;
      }
    }

    submittingRef.current = true;
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email.trim(), password);
      if (error) setError(translateAuthError(error));
      else navigate("/");
    } else {
      const { error } = await signUp(email.trim(), password, displayName.trim());
      if (error) setError(translateAuthError(error));
      else navigate("/onboarding");
    }
    setLoading(false);
    submittingRef.current = false;
  };

  if (showOnboarding) {
    return <OnboardingSlides onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3 animate-float">🌱</span>
          <h1 className="text-display text-foreground animate-scale-pop">PPURI</h1>
          <p className="text-small text-muted-foreground mt-1">
            위험을 이해하는 투자자로 성장하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {!isLogin && (
            <input
              type="text"
              placeholder="닉네임"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
              className="w-full h-12 px-4 rounded-xl bg-input border-2 border-border text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          )}
          <div>
            <div className="relative">
              <input
                type="email"
                inputMode="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete={isLogin ? "username" : "email"}
                className={`w-full h-12 px-4 pr-10 rounded-xl bg-input border-2 text-body text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                  showEmailError
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                }`}
              />
              {emailCheck.valid && (
                <Check
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-fade-in"
                  aria-label="유효한 이메일"
                />
              )}
            </div>
            {showEmailError && (
              <p className="text-xs text-destructive mt-1 animate-fade-in">{emailCheck.message}</p>
            )}
          </div>
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isLogin ? "비밀번호" : "비밀번호 (최소 8자)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isLogin ? 6 : 8}
                autoComplete={isLogin ? "current-password" : "new-password"}
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
            {!isLogin && (
              <div className="mt-2">
                <PasswordStrengthMeter password={password} />
              </div>
            )}
          </div>

          {/* 약관 동의 (회원가입 시만) */}
          {!isLogin && (
            <div className="space-y-2 pt-2 pb-1 border-y border-border py-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={toggleAll}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
                <span className="text-small font-bold text-foreground">전체 동의</span>
              </label>
              <div className="pl-7 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground flex-1">
                    [필수] <Link to="/terms" target="_blank" className="underline text-foreground">이용약관</Link> 동의
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground flex-1">
                    [필수] <Link to="/privacy" target="_blank" className="underline text-foreground">개인정보 처리방침</Link> 동의
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeAge}
                    onChange={(e) => setAgreeAge(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground flex-1">
                    [필수] 만 14세 이상입니다
                  </span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <p className="text-small text-destructive text-center animate-fade-in">{error}</p>
          )}

          <PpuriButton
            type="submit"
            fullWidth
            disabled={!canSubmit}
          >
            {loading ? "잠시만..." : isLogin ? "로그인" : "회원가입"}
          </PpuriButton>
        </form>

        {isLogin && (
          <button
            onClick={() => setShowForgot(true)}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-primary text-center transition-colors"
          >
            비밀번호를 잊으셨나요?
          </button>
        )}

        <button
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
          className="w-full mt-4 text-small text-muted-foreground hover:text-primary text-center transition-colors"
        >
          {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}
