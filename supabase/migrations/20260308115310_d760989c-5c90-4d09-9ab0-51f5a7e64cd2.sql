
-- Drop and recreate notifications table with proper structure
DROP TABLE IF EXISTS public.notifications;

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder_15m', 'reminder_1h', 'reminder_1d', 'event_update', 'event_cancelled', 'new_event_match')),
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- Service role inserts (from edge function)
CREATE POLICY "Service can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Notification mutes (per event per user)
CREATE TABLE public.notification_mutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE public.notification_mutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mutes" ON public.notification_mutes FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mutes" ON public.notification_mutes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Reminder preferences per attendance
ALTER TABLE public.event_attendees ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER[] DEFAULT '{60}';

-- Index for fast notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notification_mutes_user ON public.notification_mutes (user_id, event_id);
