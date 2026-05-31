-- ============================================================
-- MLV PG Services — Realtime Triggers & Sync Functions
-- Migration 006 — Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Add complaint_ref_id to student_complaints if missing ─
ALTER TABLE student_complaints ADD COLUMN IF NOT EXISTS complaint_ref_id TEXT;

-- ── 2. Complaint Status Sync Trigger ─────────────────────────
-- When admin updates complaints table (status/notes),
-- automatically mirror the change to student_complaints table
-- so the student sees it in real-time.

CREATE OR REPLACE FUNCTION sync_complaint_to_student()
RETURNS TRIGGER AS $$
DECLARE
  mapped_status TEXT;
BEGIN
  -- Map admin statuses to student-facing statuses
  mapped_status := CASE NEW.status
    WHEN 'pending'     THEN 'open'
    WHEN 'in-progress' THEN 'in_progress'
    WHEN 'resolved'    THEN 'resolved'
    ELSE 'closed'
  END;

  UPDATE student_complaints
  SET
    status         = mapped_status,
    admin_response = COALESCE(NEW.admin_notes, admin_response),
    responded_at   = CASE WHEN NEW.admin_notes IS NOT NULL AND NEW.admin_notes != '' THEN NOW() ELSE responded_at END,
    updated_at     = NOW()
  WHERE complaint_ref_id = NEW.complaint_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_complaint_status ON complaints;
CREATE TRIGGER trg_sync_complaint_status
  AFTER UPDATE ON complaints
  FOR EACH ROW
  WHEN (
    OLD.status IS DISTINCT FROM NEW.status
    OR OLD.admin_notes IS DISTINCT FROM NEW.admin_notes
  )
  EXECUTE FUNCTION sync_complaint_to_student();


-- ── 3. Bed & Room Availability Auto-Calculation Trigger ──────
-- When a student's bed_id or room_id changes (onboard/checkout),
-- automatically update the beds and rooms tables.

CREATE OR REPLACE FUNCTION update_bed_room_on_student_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Free the OLD bed if student was reassigned
  IF OLD.bed_id IS NOT NULL AND (NEW.bed_id IS NULL OR OLD.bed_id != NEW.bed_id) THEN
    UPDATE beds SET status = 'available' WHERE id = OLD.bed_id;
  END IF;

  -- Occupy the NEW bed
  IF NEW.bed_id IS NOT NULL THEN
    UPDATE beds SET status = 'occupied' WHERE id = NEW.bed_id;
  END IF;

  -- Recalculate occupied_beds count for old room
  IF OLD.room_id IS NOT NULL AND (NEW.room_id IS NULL OR OLD.room_id != NEW.room_id) THEN
    UPDATE rooms
    SET
      occupied_beds = (SELECT COUNT(*) FROM beds WHERE room_id = OLD.room_id AND status = 'occupied'),
      status = CASE
        WHEN (SELECT COUNT(*) FROM beds WHERE room_id = OLD.room_id AND status = 'available') > 0
        THEN 'available'
        ELSE 'occupied'
      END
    WHERE id = OLD.room_id;
  END IF;

  -- Recalculate occupied_beds count for new room
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

DROP TRIGGER IF EXISTS trg_bed_room_on_student ON students;
CREATE TRIGGER trg_bed_room_on_student
  AFTER INSERT OR UPDATE OF bed_id, room_id, is_active ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_bed_room_on_student_change();


-- ── 4. Overdue Installment Auto-Marking Function ─────────────
-- Call this via RPC to mark past-due installments as 'overdue'.
-- Also auto-called nightly via Supabase cron (optional).

CREATE OR REPLACE FUNCTION mark_overdue_installments()
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE installments
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated admin users
GRANT EXECUTE ON FUNCTION mark_overdue_installments() TO authenticated;


-- ── 5. Enable Supabase Realtime on Key Tables ─────────────────
-- These tables will push live changes to subscribed clients.

ALTER TABLE pre_registrations REPLICA IDENTITY FULL;
ALTER TABLE complaints        REPLICA IDENTITY FULL;
ALTER TABLE student_complaints REPLICA IDENTITY FULL;
ALTER TABLE payments          REPLICA IDENTITY FULL;
ALTER TABLE installments      REPLICA IDENTITY FULL;
ALTER TABLE beds              REPLICA IDENTITY FULL;
ALTER TABLE rooms             REPLICA IDENTITY FULL;
ALTER TABLE notices           REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
DO $$
BEGIN
  -- pre_registrations
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'pre_registrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pre_registrations;
  END IF;
  -- complaints
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'complaints'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
  END IF;
  -- student_complaints
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'student_complaints'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE student_complaints;
  END IF;
  -- payments
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE payments;
  END IF;
  -- installments
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'installments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE installments;
  END IF;
END $$;


-- ── 6. Admin Read Policy for student_complaints ───────────────
-- Admin users (authenticated) should be able to read ALL student complaints
-- to display them in the admin dashboard.

DROP POLICY IF EXISTS "admin_read_student_complaints" ON student_complaints;
CREATE POLICY "admin_read_student_complaints" ON student_complaints
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_update_student_complaints" ON student_complaints;
CREATE POLICY "admin_update_student_complaints" ON student_complaints
  FOR UPDATE
  TO authenticated
  USING (true);


-- ── 7. Indexes for Performance ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_student_complaints_ref_id   ON student_complaints(complaint_ref_id);
CREATE INDEX IF NOT EXISTS idx_installments_status_due     ON installments(status, due_date);
CREATE INDEX IF NOT EXISTS idx_payments_created_at         ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_beds_status_room            ON beds(room_id, status);
