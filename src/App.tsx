import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import React, { Suspense, lazy } from "react";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const DailyLessonPage = lazy(() => import("./pages/DailyLessonPage"));
const HoldingsPage = lazy(() => import("./pages/HoldingsPage"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));
const CrisisModePage = lazy(() => import("./pages/CrisisModePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PaywallPage = lazy(() => import("./pages/PaywallPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
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
  return <>{children}</>;
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
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                <Route path="/lesson" element={<ProtectedRoute><DailyLessonPage /></ProtectedRoute>} />
                <Route path="/holdings" element={<ProtectedRoute><HoldingsPage /></ProtectedRoute>} />
                <Route path="/archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
                <Route path="/crisis" element={<ProtectedRoute><CrisisModePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/paywall" element={<ProtectedRoute><PaywallPage /></ProtectedRoute>} />
                <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
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
