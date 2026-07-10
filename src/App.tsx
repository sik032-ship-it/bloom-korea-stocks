import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ConsentGate } from "@/components/ConsentGate";
import React, { Suspense, lazy } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

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

const TimeMachinePage = lazy(() => import("./pages/TimeMachinePage"));
const SecurityCheckPage = lazy(() => import("./pages/admin/SecurityCheckPage"));
const OnboardingStatsPage = lazy(() => import("./pages/admin/OnboardingStatsPage"));
const OnboardingEventCheckPage = lazy(() => import("./pages/admin/OnboardingEventCheckPage"));
const BeaconTestPage = lazy(() => import("./pages/admin/BeaconTestPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <span className="text-4xl animate-bounce-in">🌱</span>
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
                <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                <Route path="/lesson" element={<ProtectedRoute><DailyLessonPage /></ProtectedRoute>} />
                <Route path="/holdings" element={<ProtectedRoute><HoldingsPage /></ProtectedRoute>} />
                <Route path="/trash" element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
                <Route path="/archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
                <Route path="/crisis" element={<ProtectedRoute><CrisisModePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                
                <Route path="/timemachine" element={<ProtectedRoute><TimeMachinePage /></ProtectedRoute>} />
                <Route path="/admin/security-check" element={<AdminRoute><SecurityCheckPage /></AdminRoute>} />
                <Route path="/admin/onboarding-stats" element={<AdminRoute><OnboardingStatsPage /></AdminRoute>} />
                <Route path="/admin/onboarding-events" element={<AdminRoute><OnboardingEventCheckPage /></AdminRoute>} />
                <Route path="/admin/beacon-test" element={<AdminRoute><BeaconTestPage /></AdminRoute>} />
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;