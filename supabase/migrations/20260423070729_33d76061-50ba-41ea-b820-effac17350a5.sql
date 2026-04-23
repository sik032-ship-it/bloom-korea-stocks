-- Add soft delete columns
ALTER TABLE public.holdings ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE public.sentences ADD COLUMN deleted_at TIMESTAMPTZ;

-- Indexes for filtering active rows efficiently
CREATE INDEX idx_holdings_user_deleted ON public.holdings(user_id, deleted_at);
CREATE INDEX idx_sentences_user_deleted ON public.sentences(user_id, deleted_at);

-- Cleanup function: permanently delete rows soft-deleted >30 days ago
CREATE OR REPLACE FUNCTION public.purge_old_soft_deleted()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.sentences WHERE deleted_at IS NOT NULL AND deleted_at < now() - INTERVAL '30 days';
  DELETE FROM public.holdings WHERE deleted_at IS NOT NULL AND deleted_at < now() - INTERVAL '30 days';
END;
$$;