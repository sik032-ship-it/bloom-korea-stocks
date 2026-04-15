CREATE POLICY "Block direct insert on subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Block direct update on subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Block direct delete on subscriptions"
ON public.subscriptions
FOR DELETE
TO authenticated
USING (false);

CREATE POLICY "Users can update their own sentences"
ON public.sentences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);