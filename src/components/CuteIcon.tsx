import {
  Flame, PenLine, Trophy, Home, BarChart3, BookOpen, Settings, Sprout, Leaf,
  TreeDeciduous, TreePine, Mountain, Globe, Lightbulb, Sun, Shield, Zap,
  PartyPopper, Star, Mail, Coins, Package, TrendingUp, TrendingDown, Skull,
  Dices, ScrollText, Handshake, PenTool, CheckCircle2, AlertTriangle,
  Gamepad2, Apple, Search, GraduationCap, Glasses, RefreshCw, XCircle, Lock,
  Sparkles, Anchor, Users, Clock, Brain, type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";

type Tone = "growth" | "caution" | "wisdom" | "truth" | "danger" | "muted";

const toneClasses: Record<Tone, string> = {
  growth: "bg-tone-growth-bg text-tone-growth-fg",
  caution: "bg-tone-caution-bg text-tone-caution-fg",
  wisdom: "bg-tone-wisdom-bg text-tone-wisdom-fg",
  truth: "bg-tone-truth-bg text-tone-truth-fg",
  danger: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

const EMOJI_MAP: Record<string, { icon: LucideIcon; tone: Tone }> = {
  "🔥": { icon: Flame, tone: "caution" },
  "📝": { icon: PenLine, tone: "growth" },
  "🏆": { icon: Trophy, tone: "caution" },
  "🏠": { icon: Home, tone: "growth" },
  "📊": { icon: BarChart3, tone: "truth" },
  "📖": { icon: BookOpen, tone: "wisdom" },
  "⚙️": { icon: Settings, tone: "muted" },
  "⚙": { icon: Settings, tone: "muted" },
  "🌱": { icon: Sprout, tone: "growth" },
  "🌿": { icon: Leaf, tone: "growth" },
  "🌳": { icon: TreeDeciduous, tone: "growth" },
  "🌲": { icon: TreePine, tone: "growth" },
  "🏔": { icon: Mountain, tone: "wisdom" },
  "🏔️": { icon: Mountain, tone: "wisdom" },
  "🌍": { icon: Globe, tone: "truth" },
  "💡": { icon: Lightbulb, tone: "caution" },
  "☀️": { icon: Sun, tone: "caution" },
  "☀": { icon: Sun, tone: "caution" },
  "🛡️": { icon: Shield, tone: "truth" },
  "🛡": { icon: Shield, tone: "truth" },
  "💪": { icon: Zap, tone: "growth" },
  "🎉": { icon: PartyPopper, tone: "caution" },
  "⭐": { icon: Star, tone: "caution" },
  "📬": { icon: Mail, tone: "truth" },
  "📧": { icon: Mail, tone: "truth" },
  "💰": { icon: Coins, tone: "caution" },
  "📦": { icon: Package, tone: "truth" },
  "📈": { icon: TrendingUp, tone: "growth" },
  "📉": { icon: TrendingDown, tone: "danger" },
  "💀": { icon: Skull, tone: "danger" },
  "🎰": { icon: Dices, tone: "danger" },
  "😵": { icon: AlertTriangle, tone: "danger" },
  "📜": { icon: ScrollText, tone: "wisdom" },
  "🤝": { icon: Handshake, tone: "growth" },
  "🖋": { icon: PenTool, tone: "wisdom" },
  "✅": { icon: CheckCircle2, tone: "growth" },
  "⚠️": { icon: AlertTriangle, tone: "caution" },
  "⚠": { icon: AlertTriangle, tone: "caution" },
  "🎮": { icon: Gamepad2, tone: "wisdom" },
  "🍎": { icon: Apple, tone: "danger" },
  "🔍": { icon: Search, tone: "truth" },
  "🎩": { icon: GraduationCap, tone: "wisdom" },
  "👓": { icon: Glasses, tone: "wisdom" },
  "🔄": { icon: RefreshCw, tone: "muted" },
  "❌": { icon: XCircle, tone: "danger" },
  "🔒": { icon: Lock, tone: "truth" },
  "🏃": { icon: Zap, tone: "caution" },
  "😤": { icon: Brain, tone: "caution" },
  "😰": { icon: AlertTriangle, tone: "caution" },
  "⚓": { icon: Anchor, tone: "truth" },
  "🐑": { icon: Users, tone: "wisdom" },
  "⏰": { icon: Clock, tone: "wisdom" },
  "🧠": { icon: Brain, tone: "wisdom" },
  "🐿️": { icon: Sparkles, tone: "growth" },
  "⚔️": { icon: Shield, tone: "truth" },
  "⚔": { icon: Shield, tone: "truth" },
  "🏅": { icon: Trophy, tone: "growth" },
  "🤖": { icon: Brain, tone: "wisdom" },
  "🌙": { icon: Clock, tone: "muted" },
};

const sizeMap = {
  sm: { box: "w-7 h-7 rounded-lg", icon: 14 },
  md: { box: "w-9 h-9 rounded-xl", icon: 18 },
  lg: { box: "w-12 h-12 rounded-2xl", icon: 22 },
};

interface CuteIconProps {
  emoji: string;
  size?: keyof typeof sizeMap;
  className?: string;
}

/** 이모지 대신 쓰는 귀여운 컬러 아이콘 타일 — 4톤 시맨틱 팔레트 */
export const CuteIcon = ({ emoji, size = "md", className }: CuteIconProps) => {
  const entry = EMOJI_MAP[emoji] ?? { icon: Sparkles, tone: "growth" as Tone };
  const Icon = entry.icon;
  const s = sizeMap[size];
  return (
    <span
      className={cn("inline-flex items-center justify-center shrink-0", s.box, toneClasses[entry.tone], className)}
      aria-hidden
    >
      <Icon size={s.icon} strokeWidth={2.2} />
    </span>
  );
};
