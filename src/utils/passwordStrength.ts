/**
 * 비밀번호 강도 평가
 * - 길이, 문자 다양성(소문자/대문자/숫자/특수문자) 기준
 */
export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4; // 0=없음, 1=매우약함, 2=약함, 3=보통, 4=강함
  label: string;
  color: string; // hsl token reference
  percent: number; // 0-100
  suggestions: string[];
};

export function evaluatePassword(pw: string): PasswordStrength {
  if (!pw) {
    return { score: 0, label: "", color: "hsl(var(--muted))", percent: 0, suggestions: [] };
  }

  const checks = {
    length8: pw.length >= 8,
    length12: pw.length >= 12,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    digit: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };

  let points = 0;
  if (checks.length8) points++;
  if (checks.length12) points++;
  if (checks.lower) points++;
  if (checks.upper) points++;
  if (checks.digit) points++;
  if (checks.special) points++;

  // 흔한 패턴 감점
  if (/^[a-z]+$/i.test(pw) || /^\d+$/.test(pw)) points = Math.max(0, points - 2);
  if (/(.)\1{3,}/.test(pw)) points = Math.max(0, points - 1); // 같은 문자 4번 이상

  const suggestions: string[] = [];
  if (!checks.length8) suggestions.push("8자 이상");
  if (!checks.upper) suggestions.push("대문자");
  if (!checks.digit) suggestions.push("숫자");
  if (!checks.special) suggestions.push("특수문자(!@#$ 등)");

  let score: PasswordStrength["score"];
  let label: string;
  let color: string;

  if (!checks.length8 || points <= 2) {
    score = 1;
    label = "매우 약함";
    color = "hsl(var(--destructive))";
  } else if (points <= 3) {
    score = 2;
    label = "약함";
    color = "hsl(var(--ppuri-amber))";
  } else if (points <= 4) {
    score = 3;
    label = "보통";
    color = "hsl(var(--ppuri-blue))";
  } else {
    score = 4;
    label = "강함";
    color = "hsl(var(--primary))";
  }

  return {
    score,
    label,
    color,
    percent: (score / 4) * 100,
    suggestions: score >= 4 ? [] : suggestions,
  };
}

/**
 * 이메일 형식 검증 (RFC 5322 단순화 버전)
 */
export function validateEmail(email: string): { valid: boolean; message: string } {
  if (!email) return { valid: false, message: "" };
  const trimmed = email.trim();
  if (trimmed.length > 254) return { valid: false, message: "이메일이 너무 길어요." };
  // 간단하지만 실용적인 정규식
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(trimmed)) return { valid: false, message: "올바른 이메일 형식이 아니에요." };
  return { valid: true, message: "" };
}
