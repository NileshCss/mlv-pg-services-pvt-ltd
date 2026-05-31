-- ============================================================
-- MLV PG Services — Existing Resident Registration & Invitation Upgrade
-- Migration 009 — Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Create resident_invitations Table ──────────────────────
CREATE TABLE IF NOT EXISTS public.resident_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  floor_number INTEGER,
  joining_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('invited', 'profile_submitted', 'approved', 'rejected', 'active')) DEFAULT 'invited',
  expires_at TIMESTAMPTZ NOT NULL,
  profile_data JSONB NULL, -- Holds form inputs until admin approves
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on resident_invitations
ALTER TABLE public.resident_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_all_invitations" ON public.resident_invitations;
DROP POLICY IF EXISTS "public_select_invitations_by_token" ON public.resident_invitations;

-- Admin Policy: Authenticated admin has full access
CREATE POLICY "admin_all_invitations" ON public.resident_invitations
  FOR ALL TO authenticated USING (public.is_admin());

-- Public Policy: Anyone (anonymous/students) can view an invitation by its token
CREATE POLICY "public_select_invitations_by_token" ON public.resident_invitations
  FOR SELECT TO anon, authenticated USING (true);


-- ── 2. Fix update_bed_room_on_student_change trigger ─────────
-- Redefine trigger to safely handle TG_OP and correct checkout deactivations
CREATE OR REPLACE FUNCTION update_bed_room_on_student_change()
RETURNS TRIGGER AS $$
DECLARE
  old_bed_id UUID := NULL;
  old_room_id UUID := NULL;
  old_is_active BOOLEAN := false;
BEGIN
  -- Safely extract OLD values if this is an UPDATE operation
  IF TG_OP = 'UPDATE' THEN
    old_bed_id := OLD.bed_id;
    old_room_id := OLD.room_id;
    old_is_active := OLD.is_active;
  END IF;

  -- 1. Free the OLD bed if student was reassigned or checked out (became inactive)
  IF old_bed_id IS NOT NULL AND (
    NEW.bed_id IS NULL 
    OR old_bed_id != NEW.bed_id 
    OR (old_is_active = true AND NEW.is_active = false)
  ) THEN
    UPDATE beds SET status = 'available' WHERE id = old_bed_id;
  END IF;

  -- 2. Occupy the NEW bed if the student is active, otherwise make it available
  IF NEW.bed_id IS NOT NULL AND NEW.is_active = true THEN
    UPDATE beds SET status = 'occupied' WHERE id = NEW.bed_id;
  ELSIF NEW.bed_id IS NOT NULL AND NEW.is_active = false THEN
    UPDATE beds SET status = 'available' WHERE id = NEW.bed_id;
  END IF;

  -- 3. Recalculate occupied_beds count for the OLD room
  IF old_room_id IS NOT NULL AND (
    NEW.room_id IS NULL 
    OR old_room_id != NEW.room_id 
    OR (old_is_active = true AND NEW.is_active = false)
  ) THEN
    UPDATE rooms
    SET
      occupied_beds = (SELECT COUNT(*) FROM beds WHERE room_id = old_room_id AND status = 'occupied'),
      status = CASE
        WHEN (SELECT COUNT(*) FROM beds WHERE room_id = old_room_id AND status = 'available') > 0
        THEN 'available'
        ELSE 'occupied'
      END
    WHERE id = old_room_id;
  END IF;

  -- 4. Recalculate occupied_beds count for the NEW room
  IF NEW.room_id IS NOT NULL THEN
    UPDATE rooms
    SET
      occupied_beds = (SELECT COUNT(*) FROM beds WHERE room_id = NEW.room_id AND status = 'occupied'),
      status = CASE
        WHEN (SELECT COUNT(*) FROM beds WHERE room_id = NEW.room_id AND status = 'available') > 0
        THEN 'available'
        ELSE 'occupied'
      END
    WHERE id = NEW.room_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 3. Enable Realtime Replication for resident_invitations ────
ALTER TABLE public.resident_invitations REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'resident_invitations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resident_invitations;
  END IF;
END $$;
