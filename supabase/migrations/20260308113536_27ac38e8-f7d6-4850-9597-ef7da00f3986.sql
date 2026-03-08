
-- 1. Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS work_experience TEXT,
  ADD COLUMN IF NOT EXISTS interest_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS activity_preferences TEXT[] DEFAULT '{}';

-- 2. Create clubs table
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  club_email TEXT,
  description TEXT,
  logo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clubs viewable by authenticated" ON public.clubs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage clubs" ON public.clubs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Change event_type enum: must drop dependent policy first
DROP POLICY IF EXISTS "View public events" ON public.events;
ALTER TABLE public.events ALTER COLUMN event_type DROP DEFAULT;

CREATE TYPE public.event_type_v2 AS ENUM ('mandatory', 'club', 'open_invite', 'private');

ALTER TABLE public.events
  ALTER COLUMN event_type TYPE public.event_type_v2
  USING (
    CASE event_type::text
      WHEN 'admin' THEN 'mandatory'::public.event_type_v2
      WHEN 'club' THEN 'club'::public.event_type_v2
      WHEN 'student' THEN 'open_invite'::public.event_type_v2
      WHEN 'private' THEN 'private'::public.event_type_v2
    END
  );

DROP TYPE public.event_type;
ALTER TYPE public.event_type_v2 RENAME TO event_type;
ALTER TABLE public.events ALTER COLUMN event_type SET DEFAULT 'open_invite'::public.event_type;

-- Recreate the select policy
CREATE POLICY "View public events" ON public.events
  FOR SELECT TO authenticated
  USING (event_type != 'private'::public.event_type OR created_by = auth.uid());

-- 4. Add category enum and new event columns
CREATE TYPE public.event_category AS ENUM ('academic', 'sports', 'cultural', 'social', 'other');

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS category public.event_category DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS sub_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS max_cap INTEGER,
  ADD COLUMN IF NOT EXISTS ignore_cap BOOLEAN NOT NULL DEFAULT false;

-- 5. Replace saved_events with event_attendees
DROP TABLE IF EXISTS public.saved_events;

CREATE TABLE public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'attending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View event attendees" ON public.event_attendees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own attendance" ON public.event_attendees FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own attendance" ON public.event_attendees FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own attendance" ON public.event_attendees FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ,
  delivered_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
