CREATE TABLE public.stock_prices (
  ticker text PRIMARY KEY,
  price numeric NOT NULL,
  as_of date NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stock_prices TO anon, authenticated;
GRANT ALL ON public.stock_prices TO service_role;
ALTER TABLE public.stock_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock prices are public" ON public.stock_prices FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.weekly_questions ADD COLUMN IF NOT EXISTS review_note text;