-- ============================================================
-- MLV PG Services — Complaints Cross-Reference Fix
-- Migration 004 — Run in Supabase SQL Editor
-- ============================================================

-- Add complaint_ref_id to student_complaints so students can
-- reference the complaint ID shown in the admin dashboard.
ALTER TABLE student_complaints 
  ADD COLUMN IF NOT EXISTS complaint_ref_id TEXT;

-- ── RLS: Allow authenticated students to insert into `complaints` ──
-- The admin dashboard reads from `complaints` table.
-- Students must be able to write to it directly from the client.
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "complaints_authenticated_insert" ON complaints;
CREATE POLICY "complaints_authenticated_insert"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "complaints_public_select" ON complaints;
CREATE POLICY "complaints_public_select"
  ON complaints FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "complaints_service_update" ON complaints;
CREATE POLICY "complaints_service_update"
  ON complaints FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "complaints_service_delete" ON complaints;
CREATE POLICY "complaints_service_delete"
  ON complaints FOR DELETE
  TO authenticated
  USING (true);
