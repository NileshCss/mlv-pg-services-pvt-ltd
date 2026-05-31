-- Migration 012: Document Audit System Upgrade
-- Upgrades documents table with explicit status, rejection notes, and expiry tracking

-- 1. Add status column with check constraint
ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' 
  CHECK (status IN ('pending', 'verified', 'rejected', 'expired'));

-- 2. Add expiry_date column
ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- 3. Add rejection_reason column
ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. Sync existing verified boolean to new status column
UPDATE public.documents 
  SET status = CASE 
    WHEN verified = true THEN 'verified'::text
    ELSE 'pending'::text
  END;

-- 5. Create or replace sync trigger function to keep legacy verified column in sync with status
CREATE OR REPLACE FUNCTION sync_document_verified_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' THEN
    NEW.verified := true;
  ELSE
    NEW.verified := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Attach trigger to automatically sync verified boolean column
DROP TRIGGER IF EXISTS trg_sync_document_verified_status ON public.documents;
CREATE TRIGGER trg_sync_document_verified_status
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION sync_document_verified_status();
