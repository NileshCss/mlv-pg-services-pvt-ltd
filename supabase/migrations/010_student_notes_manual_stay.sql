-- ── Migration 010: Add notes column to students table ────────────────────────
-- This migration adds a `notes` TEXT column to the students table.
-- This column is used to store manual stay information (building name & room number)
-- for existing residents who registered without a database-managed room.
-- Applies to residents onboarded via the direct /existing-resident-registration route.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Optional: Update existing null-room students if any admin_notes exist in resident_invitations
-- (run manually if needed after reviewing data)
-- UPDATE students s
--   SET notes = ri.profile_data->>'manualBuildingName' || ' | ' || ri.profile_data->>'manualRoomNumber'
--   FROM resident_invitations ri
--   WHERE ri.student_id = s.id AND s.room_id IS NULL;

COMMENT ON COLUMN students.notes IS 'Admin or system notes. Stores manual building/room info for existing residents registered without a DB-managed room.';
