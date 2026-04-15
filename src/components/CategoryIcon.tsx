import { Crosshair, Brain, Shield, Scale } from "lucide-react";
import type { QuizCategory } from "@/data/quizQuestions";

const iconMap: Record<QuizCategory, React.FC<{ size?: number; className?: string }>> = {
  risk: Crosshair,
  psychology: Brain,
  crisis: Shield,
  judgment: Scale,
};

interface CategoryIconProps {
  category: QuizCategory;
  size?: number;
  color?: string;
  className?: string;
}

export function CategoryIcon({ category, size = 14, color, className }: CategoryIconProps) {
  const Icon = iconMap[category];
  return <Icon size={size} className={className} style={color ? { color } : undefined} />;
}
