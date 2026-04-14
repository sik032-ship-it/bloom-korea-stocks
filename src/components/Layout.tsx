import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StreakDisplay } from "@/components/StreakDisplay";

interface LayoutProps {
  children: React.ReactNode;
  currentStreak?: number;
  longestStreak?: number;
}

const NAV_ITEMS = [
  { path: "/", emoji: "🏠", label: "홈" },
  { path: "/holdings", emoji: "📊", label: "종목" },
  { path: "/archive", emoji: "📖", label: "기록" },
  { path: "/settings", emoji: "⚙️", label: "설정" },
];

export const Layout = ({ children, currentStreak = 0, longestStreak = 0 }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl">🌱</span>
            <h1 className="text-title text-foreground font-bold">PPURI</h1>
          </div>
          <StreakDisplay currentStreak={currentStreak} longestStreak={longestStreak} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border z-10">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-md transition-colors ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
