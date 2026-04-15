import { cn } from "@/utils/cn";
import { type HTMLAttributes, forwardRef } from "react";

interface PpuriCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const PpuriCard = forwardRef<HTMLDivElement, PpuriCardProps>(
  ({ hoverable = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card rounded-lg border border-border p-5 shadow-card transition-all duration-200",
          hoverable && "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer press-effect",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PpuriCard.displayName = "PpuriCard";
