-- ============================================================
-- MLV PG Services — Admission Fee & Admin Notes Tracking
-- Migration 005 — Run in Supabase SQL Editor
-- ============================================================

-- Add admin_notes column to pre_registrations for admin remarks
ALTER TABLE pre_registrations
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Allow admin (service role) to update deposit fields in pre_registrations
-- The service role bypasses RLS so this is for completeness
-- Also allow anon/authenticated to read their own via application_id (already done in 003)

-- Ensure all deposit-related columns exist (idempotent)
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10,2) DEFAULT 5000;
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS deposit_payment_mode TEXT;
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS deposit_transaction_ref TEXT;
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS deposit_waive_reason TEXT;

-- Admission fee tracking (separate from security deposit if needed)
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS admission_fee_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS admission_fee_status TEXT DEFAULT 'not_applicable'
  CHECK (admission_fee_status IN ('not_applicable','pending','paid','waived'));
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS admission_fee_paid_at TIMESTAMPTZ;
ALTER TABLE pre_registrations ADD COLUMN IF NOT EXISTS admission_fee_transaction_ref TEXT;

-- Index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_pre_registrations_deposit_status
  ON pre_registrations(deposit_status);
CREATE INDEX IF NOT EXISTS idx_pre_registrations_status
  ON pre_registrations(status);
