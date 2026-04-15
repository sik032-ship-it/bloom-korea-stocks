import React from "react";

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-5xl">🌱</span>
            <h2 className="text-title text-foreground font-bold">앗, 문제가 생겼어요</h2>
            <p className="text-small text-muted-foreground">
              잠시 후 다시 시도해주세요
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-small"
            >
              홈으로 돌아가기
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
