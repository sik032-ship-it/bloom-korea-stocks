ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consented_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_terms_version text,
  ADD COLUMN IF NOT EXISTS consent_privacy_version text;