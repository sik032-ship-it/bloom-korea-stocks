import mascotDefault from "@/assets/mascot-default.png";
import mascotCelebrate from "@/assets/mascot-celebrate.png";
import mascotThinking from "@/assets/mascot-thinking.png";
import mascotWave from "@/assets/mascot-wave.png";
import mascotLevel1 from "@/assets/mascot-level1.png";
import mascotLevel2 from "@/assets/mascot-level2.png";
import mascotLevel3 from "@/assets/mascot-level3.png";
import mascotLevel4 from "@/assets/mascot-level4.png";
import mascotLevel5 from "@/assets/mascot-level5.png";
import mascotLevel6 from "@/assets/mascot-level6.png";

export type MascotMood = "default" | "celebrate" | "thinking" | "wave";

const mascotImages: Record<MascotMood, string> = {
  default: mascotDefault,
  celebrate: mascotCelebrate,
  thinking: mascotThinking,
  wave: mascotWave,
};

const levelImages: Record<number, string> = {
  1: mascotLevel1,
  2: mascotLevel2,
  3: mascotLevel3,
  4: mascotLevel4,
  5: mascotLevel5,
  6: mascotLevel6,
};

const LEVEL_NAMES = ["씨앗", "새싹", "줄기", "가지", "나무", "숲"];
const LEVEL_TITLES = [
  "꼬마 다람쥐",
  "호기심 다람쥐",
  "씩씩한 다람쥐",
  "용감한 다람쥐",
  "현명한 다람쥐",
  "도토리 왕",
];

interface MascotProps {
  mood?: MascotMood;
  level?: number; // 1-6, if provided shows level-specific image
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLevelTag?: boolean;
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-28 h-28",
  xl: "w-36 h-36",
};

export const Mascot = ({
  mood = "default",
  level,
  size = "md",
  className = "",
  showLevelTag = false,
}: MascotProps) => {
  const imgSrc = level ? levelImages[Math.min(6, Math.max(1, level))] : mascotImages[mood];
  const levelIdx = level ? Math.min(6, Math.max(1, level)) - 1 : 0;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src={imgSrc}
        alt={level ? `${LEVEL_NAMES[levelIdx]} 다람쥐` : "뿌리 다람쥐"}
        className={`${sizeMap[size]} object-contain`}
        width={512}
        height={512}
      />
      {showLevelTag && level && (
        <span className="mt-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
          {LEVEL_TITLES[levelIdx]}
        </span>
      )}
    </div>
  );
};

export { LEVEL_NAMES, LEVEL_TITLES };
