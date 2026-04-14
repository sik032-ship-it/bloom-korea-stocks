import { cn } from "@/utils/cn";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  size?: "sm" | "md";
}

export const ProgressBar = ({ value, className, size = "md" }: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        size === "sm" ? "h-1.5" : "h-2.5",
        className
      )}
    >
      <div
        className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
