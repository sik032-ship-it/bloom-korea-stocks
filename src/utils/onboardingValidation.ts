// Runtime validators ensuring onboarding labels match downstream mappings.
// If a mismatch occurs (e.g. UI label changed but quiz logic not updated),
// we log a warning so it surfaces in dev/QA instead of silently breaking
// personalization.

import { getExperienceBoost, type ExperienceLevel } from "@/data/quizQuestions";

const VALID_EXPERIENCE_LABELS: ExperienceLevel[] = [
  "완전 초보",
  "조금 해봤어요",
  "1년 이상 투자 중",
  "베테랑 투자자",
];

const VALID_INVESTMENT_GOALS = [
  "노후 준비",
  "자산 증식",
  "경제적 자유",
  "재미와 학습",
];

const VALID_DAILY_GOALS = [1, 3, 5];

export function validateOnboardingPayload(payload: {
  experience_level: string | null;
  investment_goal: string | null;
  daily_goal: number;
}): { ok: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (payload.experience_level && !VALID_EXPERIENCE_LABELS.includes(payload.experience_level as ExperienceLevel)) {
    warnings.push(
      `[onboarding] experience_level "${payload.experience_level}" not in known labels — getExperienceBoost will fall back to 0.`
    );
  } else if (payload.experience_level) {
    // Sanity: the boost function should recognize this label (returns >0 for non-beginner)
    const boost = getExperienceBoost(payload.experience_level);
    if (payload.experience_level !== "완전 초보" && boost === 0) {
      warnings.push(
        `[onboarding] experience_level "${payload.experience_level}" returned boost=0 — getExperienceBoost mapping may be out of sync.`
      );
    }
  }

  if (payload.investment_goal && !VALID_INVESTMENT_GOALS.includes(payload.investment_goal)) {
    warnings.push(
      `[onboarding] investment_goal "${payload.investment_goal}" not in known labels.`
    );
  }

  if (!VALID_DAILY_GOALS.includes(payload.daily_goal)) {
    warnings.push(
      `[onboarding] daily_goal ${payload.daily_goal} is not one of ${VALID_DAILY_GOALS.join(", ")}.`
    );
  }

  warnings.forEach((w) => console.warn(w));
  return { ok: warnings.length === 0, warnings };
}

// Retry wrapper with exponential backoff for transient network failures.
// Does NOT retry RLS / auth errors (those won't succeed on retry).
export async function retryAsync<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; baseDelayMs?: number; shouldRetry?: (err: unknown) => boolean } = {}
): Promise<T> {
  const { retries = 2, baseDelayMs = 400, shouldRetry = () => true } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries || !shouldRetry(err)) break;
      await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt)));
    }
  }
  throw lastErr;
}

// Supabase error codes / messages that mean "don't bother retrying"
export function isRetryablePostgrestError(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  // 42501 = insufficient_privilege (RLS), 23xxx = constraint, PGRST = PostgREST permission/parse
  if (code === "42501" || code.startsWith("23") || code.startsWith("PGRST")) return false;
  return true;
}
