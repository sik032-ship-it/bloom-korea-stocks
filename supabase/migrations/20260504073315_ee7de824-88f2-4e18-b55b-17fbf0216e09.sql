-- A/B 테스트 이벤트 추적
CREATE TABLE public.mentor_card_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  placement TEXT NOT NULL,           -- 'crisis_trigger' | 'sell_block' | 'onboarding_pact'
  variant_id TEXT NOT NULL,          -- e.g. 'buffett_v1_a', 'buffett_v1_b', ...
  event_type TEXT NOT NULL,          -- 'impression' | 'cta_click' | 'secondary_click' | 'dismiss'
  context JSONB,                     -- 자유 메타 (drop_pct, ticker 등)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mentor_events_user ON public.mentor_card_events(user_id);
CREATE INDEX idx_mentor_events_variant ON public.mentor_card_events(placement, variant_id, event_type);

ALTER TABLE public.mentor_card_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users insert own events"
  ON public.mentor_card_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users read own events"
  ON public.mentor_card_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);