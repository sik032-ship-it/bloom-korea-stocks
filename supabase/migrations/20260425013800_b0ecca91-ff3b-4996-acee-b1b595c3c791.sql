UPDATE public.profiles
SET consented_at = COALESCE(consented_at, now()),
    consent_terms_version = COALESCE(consent_terms_version, 'legacy'),
    consent_privacy_version = COALESCE(consent_privacy_version, 'legacy')
WHERE consented_at IS NULL;