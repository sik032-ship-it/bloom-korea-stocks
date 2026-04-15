
-- Crisis simulation results table
CREATE TABLE public.crisis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario_id TEXT NOT NULL,
  scenario_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  score_percentage INTEGER NOT NULL,
  step_scores INTEGER[] NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crisis_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own crisis results"
ON public.crisis_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crisis results"
ON public.crisis_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for efficient querying
CREATE INDEX idx_crisis_results_user_date ON public.crisis_results (user_id, completed_at DESC);
