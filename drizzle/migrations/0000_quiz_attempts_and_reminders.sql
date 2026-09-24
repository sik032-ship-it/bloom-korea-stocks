CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Seoul')::date,
  question_key text NOT NULL,
  question_text text NOT NULL,
  category text,
  format text,
  user_answer text,
  correct_answer text,
  is_correct boolean NOT NULL DEFAULT false,
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day, question_key)
);
GRANT SELECT, INSERT, UPDATE ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts select" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own attempts insert" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own attempts update" ON public.quiz_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX quiz_attempts_user_day ON public.quiz_attempts (user_id, day DESC);

CREATE TABLE public.reminder_preferences (
  user_id uuid PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  remind_time time NOT NULL DEFAULT '20:00',
  timezone text NOT NULL DEFAULT 'Asia/Seoul',
  permission text,
  push_subscription jsonb,
  asked_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_preferences TO authenticated;
GRANT ALL ON public.reminder_preferences TO service_role;
ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reminder all" ON public.reminder_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);