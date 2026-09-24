import { cn } from "@/utils/cn";
import { Mascot } from "@/components/Mascot";

const LEVEL_NAMES = ["씨앗", "새싹", "줄기", "가지", "나무", "숲"];

interface MascotAvatarProps {
  level?: number; // 1-6
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const mascotSizeMap = { sm: "sm", md: "sm", lg: "md" } as const;

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
        "flex items-center justify-center rounded-full bg-accent overflow-hidden",
        sizeMap[size],
        animated && "animate-bounce-in",
        className
      )}
      title={`${LEVEL_NAMES[idx]} (Lv.${level})`}
    >
      <Mascot level={level} size={mascotSizeMap[size]} />
    </div>
  );
};

export { LEVEL_NAMES };
