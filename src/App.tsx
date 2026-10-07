import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ConsentGate } from "@/components/ConsentGate";
import React, { Suspense, lazy } from "react";
import { Seo } from "@/components/Seo";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import mascotDefault from "@/assets/mascot-default.png";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const DailyLessonPage = lazy(() => import("./pages/DailyLessonPage"));
const HoldingsPage = lazy(() => import("./pages/HoldingsPage"));
const TrashPage = lazy(() => import("./pages/TrashPage"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));
const CrisisModePage = lazy(() => import("./pages/CrisisModePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const QuizHistoryPage = lazy(() => import("./pages/QuizHistoryPage"));
const TimeMachinePage = lazy(() => import("./pages/TimeMachinePage"));
const LegendsPage = lazy(() => import("./pages/LegendsPage"));
const SecurityCheckPage = lazy(() => import("./pages/admin/SecurityCheckPage"));
const OnboardingStatsPage = lazy(() => import("./pages/admin/OnboardingStatsPage"));
const OnboardingEventCheckPage = lazy(() => import("./pages/admin/OnboardingEventCheckPage"));
const BeaconTestPage = lazy(() => import("./pages/admin/BeaconTestPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function withSeo(
  element: React.ReactNode,
  title: string,
  description: string,
  path: string,
  noindex = false,
) {
  return (
    <>
      <Seo title={title} description={description} path={path} noindex={noindex} />
      {element}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <img src={mascotDefault} alt="뿌리 다람쥐" className="w-20 h-20 object-contain animate-bounce-in" width={80} height={80} />
      <p className="text-small text-muted-foreground">로딩 중...</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/auth" replace />;
  return <ConsentGate>{children}</ConsentGate>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  if (authLoading || roleLoading) return <LoadingFallback />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <ConsentGate>{children}</ConsentGate>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/auth" element={withSeo(<PublicRoute><AuthPage /></PublicRoute>, "로그인·회원가입", "PPURI에 로그인하고 미국 우량주 장기투자 습관 훈련을 시작하세요.", "/auth")} />
                <Route path="/reset-password" element={withSeo(<ResetPasswordPage />, "비밀번호 재설정", "PPURI 계정의 비밀번호를 재설정합니다.", "/reset-password", true)} />
                <Route path="/terms" element={withSeo(<TermsPage />, "이용약관", "PPURI(뿌리) 서비스 이용약관입니다. 교육용 콘텐츠 제공 범위와 투자 판단의 책임을 안내합니다.", "/terms")} />
                <Route path="/privacy" element={withSeo(<PrivacyPage />, "개인정보 처리방침", "PPURI(뿌리)가 수집하는 개인정보의 항목, 이용 목적, 보관 및 탈퇴 시 삭제 정책을 안내합니다.", "/privacy")} />
                <Route path="/onboarding" element={withSeo(<ProtectedRoute><OnboardingPage /></ProtectedRoute>, "시작하기", "30초 온보딩으로 PPURI의 투자 습관 훈련을 시작하세요.", "/onboarding", true)} />
                <Route path="/lesson" element={withSeo(<ProtectedRoute><DailyLessonPage /></ProtectedRoute>, "오늘의 레슨", "오늘의 퀘스트 퀴즈를 풀며 좋은 기업에 오래 머무는 판단력을 매일 훈련하세요.", "/lesson", true)} />
                <Route path="/holdings" element={withSeo(<ProtectedRoute><HoldingsPage /></ProtectedRoute>, "내 보유 종목", "내가 보유한 미국 주식 종목을 기록하고 관리합니다.", "/holdings", true)} />
                <Route path="/trash" element={withSeo(<ProtectedRoute><TrashPage /></ProtectedRoute>, "휴지통", "삭제한 기록을 복구하거나 영구 삭제합니다.", "/trash", true)} />
                <Route path="/archive" element={withSeo(<ProtectedRoute><ArchivePage /></ProtectedRoute>, "오늘의 기록", "매일 남긴 투자 다짐 문장을 모아보는 기록 보관함입니다.", "/archive", true)} />
                <Route path="/crisis" element={withSeo(<ProtectedRoute><CrisisModePage /></ProtectedRoute>, "위기 모드", "주가가 급락했을 때 흔들리지 않도록 돕는 위기 대응 훈련입니다.", "/crisis", true)} />
                <Route path="/settings" element={withSeo(<ProtectedRoute><SettingsPage /></ProtectedRoute>, "설정", "알림, 계정, 회원 탈퇴 등 PPURI 앱 설정을 관리합니다.", "/settings", true)} />
                <Route path="/quiz-history" element={withSeo(<ProtectedRoute><QuizHistoryPage /></ProtectedRoute>, "퀴즈 기록", "지금까지 푼 퀴즈의 정답률과 난이도별 기록을 확인하세요.", "/quiz-history", true)} />
                <Route path="/legends" element={withSeo(<ProtectedRoute><LegendsPage /></ProtectedRoute>, "투자 거장 카드", "워런 버핏, 피터 린치 등 투자 거장의 장기투자 지혜를 카드로 만나보세요.", "/legends")} />
                <Route path="/timemachine" element={withSeo(<ProtectedRoute><TimeMachinePage /></ProtectedRoute>, "시간 머신", "MSFT·GOOGL·AMZN·AAPL에 10년 전 투자했다면? 실제 주가 데이터로 장기투자의 힘을 체험하세요.", "/timemachine")} />
                <Route path="/admin/security-check" element={withSeo(<AdminRoute><SecurityCheckPage /></AdminRoute>, "관리자 보안 점검", "관리자 전용 보안 점검 페이지입니다.", "/admin/security-check", true)} />
                <Route path="/admin/onboarding-stats" element={withSeo(<AdminRoute><OnboardingStatsPage /></AdminRoute>, "관리자 온보딩 통계", "관리자 전용 온보딩 통계 페이지입니다.", "/admin/onboarding-stats", true)} />
                <Route path="/admin/onboarding-events" element={withSeo(<AdminRoute><OnboardingEventCheckPage /></AdminRoute>, "관리자 온보딩 이벤트", "관리자 전용 온보딩 이벤트 확인 페이지입니다.", "/admin/onboarding-events", true)} />
                <Route path="/admin/beacon-test" element={withSeo(<AdminRoute><BeaconTestPage /></AdminRoute>, "관리자 비콘 테스트", "관리자 전용 테스트 페이지입니다.", "/admin/beacon-test", true)} />
                <Route path="/" element={withSeo(<ProtectedRoute><HomePage /></ProtectedRoute>, "PPURI (뿌리) — 미국 우량주 장기투자 습관", "듀오링고처럼 매일 3분, 퀴즈와 퀘스트로 좋은 기업에 오래 머무는 투자 습관을 훈련하는 앱입니다.", "/")} />
                <Route path="*" element={withSeo(<NotFound />, "페이지를 찾을 수 없음", "요청하신 페이지를 찾을 수 없습니다.", undefined, true)} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;