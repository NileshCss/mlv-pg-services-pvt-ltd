-- ============================================================
-- MLV PG Services — Payment Tracking & Application Status
-- Migration 003 — Run in Supabase SQL Editor
-- ============================================================

-- ── Extend payments table with Razorpay fields ───────────────
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type
  TEXT CHECK (payment_type IN ('security_deposit','monthly_fee','renewal','late_fee'));
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status
  TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded'));

-- ── Extend pre_registrations with deposit + application tracking ──
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS deposit_status
  TEXT DEFAULT 'pending' CHECK (deposit_status IN ('pending','paid','waived'));
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS deposit_payment_id TEXT;
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT false;
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS otp_verified_at TIMESTAMPTZ;

-- ── Extend the registration_status ENUM with new workflow values ──
-- The `status` column in pre_registrations uses the enum type `registration_status`.
-- We cannot add a TEXT CHECK constraint — we must extend the enum type instead.
-- `IF NOT EXISTS` prevents errors on re-run (Postgres 9.6+).

DO $$
BEGIN
  -- Add new enum values if they don't already exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'otp_verified'
                 AND enumtypid = 'registration_status'::regtype) THEN
    ALTER TYPE registration_status ADD VALUE 'otp_verified';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'deposit_paid'
                 AND enumtypid = 'registration_status'::regtype) THEN
    ALTER TYPE registration_status ADD VALUE 'deposit_paid';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'under_review'
                 AND enumtypid = 'registration_status'::regtype) THEN
    ALTER TYPE registration_status ADD VALUE 'under_review';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'room_allocated'
                 AND enumtypid = 'registration_status'::regtype) THEN
    ALTER TYPE registration_status ADD VALUE 'room_allocated';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- The enum type doesn't exist — the status column is plain TEXT, nothing to do
    NULL;
END $$;

-- ── Indexes for tracking lookups ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pre_registrations_application_id
  ON pre_registrations(application_id);
CREATE INDEX IF NOT EXISTS idx_pre_registrations_email
  ON pre_registrations(email);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id
  ON payments(razorpay_order_id);

-- ── RLS: Allow public read of pre_registrations ───────────────
-- (so /track-application works without auth)
ALTER TABLE pre_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pre_registrations_public_track" ON pre_registrations;
CREATE POLICY "pre_registrations_public_track" ON pre_registrations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "pre_registrations_service_insert" ON pre_registrations;
CREATE POLICY "pre_registrations_service_insert" ON pre_registrations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "pre_registrations_service_update" ON pre_registrations;
CREATE POLICY "pre_registrations_service_update" ON pre_registrations
  FOR UPDATE USING (true);

-- ── Allow anonymous uploads for pre-registration documents ───
-- Students aren't logged in during /pre-register, so we need anon upload
-- permission for the `pre-reg/` prefix in the student-documents bucket.
DROP POLICY IF EXISTS "storage_prereg_anon_upload" ON storage.objects;
CREATE POLICY "storage_prereg_anon_upload"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'student-documents' AND name LIKE 'pre-reg/%');
