
-- 1) onboarding_events table
CREATE TABLE IF NOT EXISTS public.onboarding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step smallint NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('step_reached','onboarding_completed','onboarding_abandoned')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS onboarding_events_user_idx ON public.onboarding_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS onboarding_events_step_idx ON public.onboarding_events(step, event_type);

GRANT SELECT, INSERT ON public.onboarding_events TO authenticated;
GRANT ALL ON public.onboarding_events TO service_role;

ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users insert own onboarding events" ON public.onboarding_events;
CREATE POLICY "users insert own onboarding events"
  ON public.onboarding_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users read own onboarding events" ON public.onboarding_events;
CREATE POLICY "users read own onboarding events"
  ON public.onboarding_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2) Re-confirm GRANTs on the 4 core tables (idempotent)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.holdings TO authenticated;
GRANT ALL ON public.holdings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sentences TO authenticated;
GRANT ALL ON public.sentences TO service_role;

GRANT SELECT, INSERT ON public.mentor_card_events TO authenticated;
GRANT ALL ON public.mentor_card_events TO service_role;

-- Ensure no anon access on these auth-only tables
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.holdings FROM anon;
REVOKE ALL ON public.sentences FROM anon;
REVOKE ALL ON public.mentor_card_events FROM anon;
REVOKE ALL ON public.onboarding_events FROM anon;

-- 3) RLS audit function (read-only, aggregates pg_catalog)
CREATE OR REPLACE FUNCTION public.get_rls_audit()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  t text;
  tbl_info jsonb;
  policies jsonb;
  grants jsonb;
  rls_enabled boolean;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','holdings','sentences','mentor_card_events','onboarding_events']) LOOP
    SELECT c.relrowsecurity INTO rls_enabled
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname=t;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'name', policyname, 'cmd', cmd, 'roles', roles::text,
      'qual', qual, 'with_check', with_check
    ) ORDER BY policyname), '[]'::jsonb)
    INTO policies
    FROM pg_policies WHERE schemaname='public' AND tablename=t;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'grantee', grantee, 'privileges', privs
    ) ORDER BY grantee), '[]'::jsonb)
    INTO grants
    FROM (
      SELECT grantee, string_agg(privilege_type, ',' ORDER BY privilege_type) AS privs
      FROM information_schema.role_table_grants
      WHERE table_schema='public' AND table_name=t
        AND grantee IN ('anon','authenticated','service_role')
      GROUP BY grantee
    ) g;

    tbl_info := jsonb_build_object(
      'table', t,
      'rls_enabled', COALESCE(rls_enabled, false),
      'policies', policies,
      'grants', grants
    );
    result := result || jsonb_build_array(tbl_info);
  END LOOP;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_rls_audit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_rls_audit() TO authenticated;

-- 4) Onboarding funnel aggregator (no PII; only counts)
CREATE OR REPLACE FUNCTION public.get_onboarding_funnel()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH step_counts AS (
    SELECT step, COUNT(DISTINCT user_id) AS users_reached
    FROM public.onboarding_events
    WHERE event_type = 'step_reached'
    GROUP BY step
  ),
  completed AS (
    SELECT COUNT(DISTINCT user_id) AS users
    FROM public.onboarding_events
    WHERE event_type = 'onboarding_completed'
  ),
  total_started AS (
    SELECT COUNT(DISTINCT user_id) AS users
    FROM public.onboarding_events
    WHERE event_type = 'step_reached' AND step = 0
  )
  SELECT jsonb_build_object(
    'total_started', COALESCE((SELECT users FROM total_started), 0),
    'total_completed', COALESCE((SELECT users FROM completed), 0),
    'steps', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('step', step, 'users_reached', users_reached) ORDER BY step)
      FROM step_counts
    ), '[]'::jsonb)
  );
$$;

REVOKE ALL ON FUNCTION public.get_onboarding_funnel() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_onboarding_funnel() TO authenticated;
