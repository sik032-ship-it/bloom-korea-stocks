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
          "bg-card rounded-lg border border-border p-5 shadow-card transition-shadow duration-200",
          hoverable && "hover:shadow-card-hover cursor-pointer",
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
