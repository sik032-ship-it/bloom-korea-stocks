import { evaluatePassword } from "@/utils/passwordStrength";
import { Check } from "lucide-react";

interface Props {
  password: string;
  /** 제안 문구를 함께 표시할지 (회원가입에서만 권장) */
  showSuggestions?: boolean;
}

export function PasswordStrengthMeter({ password, showSuggestions = true }: Props) {
  const { score, label, color, percent, suggestions } = evaluatePassword(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5 animate-fade-in">
      {/* 4단계 바 */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= score ? color : "hsl(var(--muted))",
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold" style={{ color }}>
          {label}
        </span>
        {showSuggestions && suggestions.length > 0 && (
          <span className="text-muted-foreground">
            추가 권장: {suggestions.join(", ")}
          </span>
        )}
        {score === 4 && (
          <span className="flex items-center gap-1 text-primary">
            <Check size={12} /> 안전한 비밀번호
          </span>
        )}
      </div>
    </div>
  );
}
