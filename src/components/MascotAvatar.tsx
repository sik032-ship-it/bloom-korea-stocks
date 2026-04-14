import { cn } from "@/utils/cn";

const LEVEL_EMOJIS = ["🌱", "🌿", "🌳", "🌲", "🏔", "🌍"];
const LEVEL_NAMES = ["씨앗", "새싹", "줄기", "가지", "나무", "숲"];

interface MascotAvatarProps {
  level?: number; // 1-6
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

const sizeMap = {
  sm: "text-xl w-8 h-8",
  md: "text-3xl w-12 h-12",
  lg: "text-5xl w-16 h-16",
};

export const MascotAvatar = ({
  level = 1,
  size = "md",
  className,
  animated = true,
}: MascotAvatarProps) => {
  const idx = Math.max(0, Math.min(5, level - 1));

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-accent",
        sizeMap[size],
        animated && "animate-bounce-in",
        className
      )}
      title={`${LEVEL_NAMES[idx]} (Lv.${level})`}
    >
      {LEVEL_EMOJIS[idx]}
    </div>
  );
};

export { LEVEL_EMOJIS, LEVEL_NAMES };
