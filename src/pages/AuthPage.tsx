import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PpuriButton } from "@/components/PpuriButton";
import { Shield, Brain, Crosshair, TrendingUp } from "lucide-react";

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

  // Auto-advance timer
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
      {/* Skip button */}
      <div className="flex justify-end px-5 pt-4">
        <button
          onClick={onComplete}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
        >
          건너뛰기
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        <div
          key={current}
          className={`flex flex-col items-center text-center ${
            direction === "next" ? "animate-slide-up" : "animate-fade-in"
          }`}
        >
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: slide.iconBg }}
          >
            <Icon size={36} style={{ color: slide.iconColor }} />
          </div>

          {/* Title */}
          <h1 className="text-[26px] leading-tight font-bold text-foreground mb-4 whitespace-pre-line">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-small text-muted-foreground leading-relaxed mb-6 whitespace-pre-line max-w-[280px]">
            {slide.subtitle}
          </p>

          {/* Highlight pill */}
          <div className="px-4 py-2 rounded-full bg-muted border border-border">
            <p className="text-xs font-semibold text-foreground">{slide.highlight}</p>
          </div>
        </div>
      </div>

      {/* Bottom area */}
      <div className="px-6 pb-8">
        {/* Dots */}
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

        {/* CTA */}
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

export default function AuthPage() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Show onboarding only once per session
  useEffect(() => {
    if (sessionStorage.getItem("ppuri_onboarding_seen")) {
      setShowOnboarding(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    sessionStorage.setItem("ppuri_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate("/");
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) setError(error.message);
      else navigate("/onboarding");
    }
    setLoading(false);
  };

  if (showOnboarding) {
    return <OnboardingSlides onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3 animate-float">🌱</span>
          <h1 className="text-display text-foreground animate-scale-pop">PPURI</h1>
          <p className="text-small text-muted-foreground mt-1">
            위험을 이해하는 투자자로 성장하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="닉네임"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-input border-2 border-border text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-xl bg-input border-2 border-border text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-12 px-4 rounded-xl bg-input border-2 border-border text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />

          {error && (
            <p className="text-small text-destructive text-center animate-fade-in">{error}</p>
          )}

          <PpuriButton type="submit" fullWidth disabled={loading}>
            {loading ? "잠시만..." : isLogin ? "로그인" : "회원가입"}
          </PpuriButton>
        </form>

        <button
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
          className="w-full mt-4 text-small text-muted-foreground hover:text-primary text-center transition-colors"
        >
          {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </div>
    </div>
  );
}
