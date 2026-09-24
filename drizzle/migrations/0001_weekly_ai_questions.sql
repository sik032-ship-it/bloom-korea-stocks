CREATE TABLE public.weekly_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  category text NOT NULL,
  statement text NOT NULL,
  answer boolean NOT NULL,
  explanation text NOT NULL,
  insight text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_start, statement)
);
GRANT SELECT ON public.weekly_questions TO authenticated;
GRANT ALL ON public.weekly_questions TO service_role;
ALTER TABLE public.weekly_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read weekly questions" ON public.weekly_questions FOR SELECT TO authenticated USING (true);
CREATE INDEX weekly_questions_week ON public.weekly_questions (week_start DESC);