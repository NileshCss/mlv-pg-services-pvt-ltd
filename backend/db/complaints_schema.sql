-- Complaints table for MLV PG Services
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.complaints (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id  text UNIQUE NOT NULL,       -- e.g. MLV-2026-0042
  student_name  text NOT NULL,
  room_number   text NOT NULL,
  phone         text NOT NULL,
  category      text NOT NULL,              -- Food Quality | WiFi/Internet | etc
  details       text NOT NULL,
  urgency       text NOT NULL DEFAULT 'medium', -- low | medium | high
  status        text NOT NULL DEFAULT 'pending',-- pending | in-progress | resolved
  photo_url     text,
  admin_notes   text DEFAULT '',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  resolved_at   timestamptz
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: public can insert, only authenticated can select/update/delete
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit complaints" ON public.complaints
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated can view complaints" ON public.complaints
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can update complaints" ON public.complaints
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete complaints" ON public.complaints
  FOR DELETE TO authenticated USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS complaints_status_idx   ON public.complaints(status);
CREATE INDEX IF NOT EXISTS complaints_created_idx  ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS complaints_urgency_idx  ON public.complaints(urgency);
