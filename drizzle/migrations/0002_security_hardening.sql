-- Internal functions: nobody calls them through the API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_old_soft_deleted() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_onboarding_funnel() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_rls_audit() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_onboarding_funnel() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rls_audit() TO authenticated;

-- Prevent moving rows to another owner on update
DROP POLICY IF EXISTS "Users can update their own holdings" ON public.holdings;
CREATE POLICY "Users can update their own holdings" ON public.holdings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "own attempts update" ON public.quiz_attempts;
CREATE POLICY "own attempts update" ON public.quiz_attempts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Input size / format limits (NOT VALID so old rows are untouched)
ALTER TABLE public.holdings ADD CONSTRAINT holdings_ticker_fmt CHECK (ticker ~ '^[A-Z0-9.\-]{1,10}$') NOT VALID;
ALTER TABLE public.holdings ADD CONSTRAINT holdings_name_len CHECK (char_length(company_name_kr) BETWEEN 1 AND 60) NOT VALID;
ALTER TABLE public.sentences ADD CONSTRAINT sentences_answer_len CHECK (char_length(answer_text) BETWEEN 1 AND 2000) NOT VALID;
ALTER TABLE public.sentences ADD CONSTRAINT sentences_question_len CHECK (char_length(question_text) <= 500) NOT VALID;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_display_name_len CHECK (display_name IS NULL OR char_length(display_name) <= 40) NOT VALID;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_daily_goal_range CHECK (daily_goal BETWEEN 1 AND 10) NOT VALID;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_freezes_range CHECK (streak_freezes BETWEEN 0 AND 10) NOT VALID;
ALTER TABLE public.quiz_attempts ADD CONSTRAINT quiz_attempts_len CHECK (char_length(question_text) <= 1000 AND char_length(coalesce(user_answer,'')) <= 500 AND char_length(coalesce(explanation,'')) <= 2000) NOT VALID;
ALTER TABLE public.onboarding_events ADD CONSTRAINT onboarding_events_meta_size CHECK (pg_column_size(metadata) <= 4000 AND step BETWEEN 0 AND 20) NOT VALID;
ALTER TABLE public.mentor_card_events ADD CONSTRAINT mentor_events_size CHECK (pg_column_size(context) <= 4000 AND char_length(placement) <= 60 AND char_length(variant_id) <= 60 AND char_length(event_type) <= 60) NOT VALID;
ALTER TABLE public.reminder_preferences ADD CONSTRAINT reminder_sub_size CHECK (push_subscription IS NULL OR pg_column_size(push_subscription) <= 4000) NOT VALID;

-- Max 10 active holdings enforced server-side
CREATE OR REPLACE FUNCTION public.enforce_holdings_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.holdings WHERE user_id = NEW.user_id AND is_active AND deleted_at IS NULL) >= 10 THEN
    RAISE EXCEPTION 'holdings_limit' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.enforce_holdings_limit() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS holdings_limit ON public.holdings;
CREATE TRIGGER holdings_limit BEFORE INSERT ON public.holdings FOR EACH ROW EXECUTE FUNCTION public.enforce_holdings_limit();

-- Gamification counters can't be self-edited through the API
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, consented_at, consent_terms_version, consent_privacy_version, experience_level, investment_goal, daily_goal, onboarded_at, total_sentences, current_level, current_streak, longest_streak, last_sentence_date, streak_freezes, updated_at) ON public.profiles TO authenticated;