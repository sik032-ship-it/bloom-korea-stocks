import { cn } from "@/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface PpuriButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-button hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
  secondary:
    "bg-muted text-foreground border border-border hover:bg-accent",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
};

export const PpuriButton = forwardRef<HTMLButtonElement, PpuriButtonProps>(
  ({ variant = "primary", fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "h-11 px-5 rounded-md font-semibold text-body transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none press-effect",
          variantStyles[variant],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PpuriButton.displayName = "PpuriButton";
