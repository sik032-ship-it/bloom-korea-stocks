
-- 1) app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3) Grants (auth-only — no anon)
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 4) RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5) has_role — SECURITY DEFINER to avoid recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 6) Policies on user_roles
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7) Lock admin-only RPCs — remove anon/authenticated EXECUTE,
--    add gate inside function body so only admins get data.
REVOKE ALL ON FUNCTION public.get_onboarding_funnel() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_onboarding_funnel() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_onboarding_funnel()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

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
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_rls_audit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_rls_audit() TO authenticated, service_role;

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
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  FOR t IN SELECT unnest(ARRAY['profiles','holdings','sentences','mentor_card_events','onboarding_events','user_roles']) LOOP
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

-- 8) Tighten policies: switch {public} role scoping to {authenticated}
--    (qual already uses auth.uid(), so no behavior change for real users,
--     but anon is now explicitly excluded from policy evaluation.)
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname='public'
      AND tablename IN ('profiles','holdings','sentences','crisis_results','subscriptions')
      AND 'public' = ANY(roles)
  LOOP
    EXECUTE format('ALTER POLICY %I ON public.%I TO authenticated', p.policyname, p.tablename);
  END LOOP;
END $$;

-- 9) Revoke unnecessary anon grants on auth-only tables
REVOKE ALL ON public.crisis_results FROM anon;
REVOKE ALL ON public.subscriptions FROM anon;
