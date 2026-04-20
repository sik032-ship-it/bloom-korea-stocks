/**
 * Supabase 인증 에러 메시지를 한국어로 변환
 */
export function translateAuthError(error: Error | null | undefined): string {
  if (!error) return "알 수 없는 오류가 발생했어요.";
  const msg = error.message?.toLowerCase() ?? "";

  // 로그인 실패
  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않아요.";
  }
  if (msg.includes("email not confirmed")) {
    return "이메일 인증이 필요해요. 받은편지함을 확인해주세요.";
  }

  // 회원가입
  if (msg.includes("user already registered") || msg.includes("already registered")) {
    return "이미 가입된 이메일이에요. 로그인해주세요.";
  }
  if (msg.includes("password should be at least")) {
    return "비밀번호는 최소 6자 이상이어야 해요.";
  }
  if (msg.includes("weak password") || msg.includes("password is too weak")) {
    return "비밀번호가 너무 약해요. 더 복잡한 비밀번호를 사용해주세요.";
  }
  if (msg.includes("pwned") || msg.includes("compromised")) {
    return "유출된 적이 있는 비밀번호예요. 다른 비밀번호를 사용해주세요.";
  }

  // 이메일 형식
  if (msg.includes("invalid email") || msg.includes("email address") && msg.includes("invalid")) {
    return "올바른 이메일 형식이 아니에요.";
  }

  // Rate limit
  if (msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("over_email_send_rate_limit")) {
    return "요청이 너무 많아요. 잠시 후 다시 시도해주세요.";
  }
  if (msg.includes("for security purposes")) {
    return "보안을 위해 잠시 후 다시 시도해주세요.";
  }

  // 비밀번호 재설정
  if (msg.includes("token has expired") || msg.includes("token expired")) {
    return "링크가 만료되었어요. 다시 요청해주세요.";
  }
  if (msg.includes("same as the old password") || msg.includes("new password should be different")) {
    return "기존 비밀번호와 다른 비밀번호를 입력해주세요.";
  }

  // 네트워크
  if (msg.includes("network") || msg.includes("fetch")) {
    return "네트워크 연결을 확인해주세요.";
  }

  // 기본값
  return "오류가 발생했어요. 잠시 후 다시 시도해주세요.";
}
