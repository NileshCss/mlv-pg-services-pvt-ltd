-- ============================================================
-- MLV PG Services — Create bookings table (PRODUCTION)
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create bookings table (no demo data)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  college TEXT,
  room_number TEXT,
  check_in_date DATE,
  check_out_date DATE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','interested','contacted','confirmed','checked_in','cancelled')),
  amount_total NUMERIC(10,2) DEFAULT 0,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing policies
DROP POLICY IF EXISTS "bookings_select_auth" ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert_auth" ON public.bookings;
DROP POLICY IF EXISTS "bookings_update_auth" ON public.bookings;
DROP POLICY IF EXISTS "bookings_delete_auth" ON public.bookings;

-- 4. Create RLS policies
CREATE POLICY "bookings_select_auth" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "bookings_insert_auth" ON public.bookings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "bookings_update_auth" ON public.bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bookings_delete_auth" ON public.bookings FOR DELETE TO authenticated USING (true);

-- 5. Grant permissions
GRANT ALL ON public.bookings TO authenticated;

-- 6. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Verify table created
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'bookings' ORDER BY ordinal_position;
