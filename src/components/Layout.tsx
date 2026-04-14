import { type ReactNode } from "react";
import { StreakDisplay } from "@/components/StreakDisplay";

interface LayoutProps {
  children: ReactNode;
  currentStreak?: number;
  longestStreak?: number;
}

export const Layout = ({ children, currentStreak = 0, longestStreak = 0 }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
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
          <NavItem emoji="🏠" label="홈" active />
          <NavItem emoji="📊" label="종목" />
          <NavItem emoji="📖" label="기록" />
          <NavItem emoji="👤" label="프로필" />
        </div>
      </nav>
    </div>
  );
};

function NavItem({ emoji, label, active = false }: { emoji: string; label: string; active?: boolean }) {
  return (
    <button
      className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-md transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
