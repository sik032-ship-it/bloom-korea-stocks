import mascotDefault from "@/assets/mascot-default.png";
import mascotCelebrate from "@/assets/mascot-celebrate.png";
import mascotThinking from "@/assets/mascot-thinking.png";
import mascotWave from "@/assets/mascot-wave.png";

type MascotMood = "default" | "celebrate" | "thinking" | "wave";

const mascotImages: Record<MascotMood, string> = {
  default: mascotDefault,
  celebrate: mascotCelebrate,
  thinking: mascotThinking,
  wave: mascotWave,
};

interface MascotProps {
  mood?: MascotMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-28 h-28",
  xl: "w-36 h-36",
};

export const Mascot = ({ mood = "default", size = "md", className = "" }: MascotProps) => {
  return (
    <img
      src={mascotImages[mood]}
      alt="뿌리 다람쥐"
      className={`${sizeMap[size]} object-contain ${className}`}
      width={512}
      height={512}
    />
  );
};
