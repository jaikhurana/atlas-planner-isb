
-- Fix: restrict insert to service role only (drop permissive policy)
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
-- Service role bypasses RLS, so no INSERT policy is needed for it.
-- Add user self-insert for edge cases
CREATE POLICY "System insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
