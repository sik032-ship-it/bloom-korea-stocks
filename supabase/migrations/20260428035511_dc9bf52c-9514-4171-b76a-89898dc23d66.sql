ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS investment_goal text,
  ADD COLUMN IF NOT EXISTS daily_goal smallint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz,
  ADD COLUMN IF NOT EXISTS streak_freezes smallint NOT NULL DEFAULT 2;

COMMENT ON COLUMN public.profiles.experience_level IS '완전 초보 | 조금 해봤어요 | 1년 이상 투자 중 | 베테랑 투자자';
COMMENT ON COLUMN public.profiles.daily_goal IS '하루 목표 문장 수 (1/3/5)';
COMMENT ON COLUMN public.profiles.streak_freezes IS '스트릭 보호 보유 개수 (Duolingo 모델, 기본 2개)';