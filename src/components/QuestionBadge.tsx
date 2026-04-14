import { cn } from "@/utils/cn";
import { type QuestionType, questionTypeColors, questionTypeLabels } from "@/styles/colors";

interface QuestionBadgeProps {
  type: QuestionType;
  className?: string;
}

export const QuestionBadge = ({ type, className }: QuestionBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        questionTypeColors[type],
        className
      )}
    >
      {questionTypeLabels[type]}
    </span>
  );
};
