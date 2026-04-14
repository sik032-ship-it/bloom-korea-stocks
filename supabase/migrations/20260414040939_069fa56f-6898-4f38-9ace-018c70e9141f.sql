-- Create enum for question types
CREATE TYPE public.question_type AS ENUM ('daily', 'earnings', 'drop', 'surge', 'fomo');

-- Create sentences table
CREATE TABLE public.sentences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  holding_id UUID NOT NULL REFERENCES public.holdings(id) ON DELETE CASCADE,
  question_type public.question_type NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sentences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sentences"
  ON public.sentences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sentences"
  ON public.sentences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sentences"
  ON public.sentences FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups by user and date
CREATE INDEX idx_sentences_user_created ON public.sentences (user_id, created_at DESC);

-- Create question_templates table
CREATE TABLE public.question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.question_type NOT NULL,
  template_text TEXT NOT NULL,
  placeholder_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  language VARCHAR(5) NOT NULL DEFAULT 'ko'
);

ALTER TABLE public.question_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are publicly readable"
  ON public.question_templates FOR SELECT
  USING (true);