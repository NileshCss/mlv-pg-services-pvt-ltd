-- ============================================================
-- MLV PG Services — Complete RLS Policy Fix for pre_registrations
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Check current data
SELECT COUNT(*) as total_rows FROM pre_registrations;

-- Step 2: Drop ALL existing policies on pre_registrations
DROP POLICY IF EXISTS "pre_registrations_insert_public" ON public.pre_registrations;
DROP POLICY IF EXISTS "pre_registrations_insert_anon" ON public.pre_registrations;
DROP POLICY IF EXISTS "pre_registrations_insert_auth" ON public.pre_registrations;
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.pre_registrations;
DROP POLICY IF EXISTS "Admin access only" ON public.pre_registrations;
DROP POLICY IF EXISTS "Public can insert" ON public.pre_registrations;
DROP POLICY IF EXISTS "Authenticated can read" ON public.pre_registrations;
DROP POLICY IF EXISTS "Authenticated can update" ON public.pre_registrations;
DROP POLICY IF EXISTS "Authenticated can delete" ON public.pre_registrations;

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;

-- Step 4: Create correct policies

-- Anyone (anon + authenticated) can INSERT (public form submission)
CREATE POLICY "pre_reg_insert_all"
  ON public.pre_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated admins can SELECT (read in dashboard)
CREATE POLICY "pre_reg_select_auth"
  ON public.pre_registrations
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated admins can UPDATE (change status etc.)
CREATE POLICY "pre_reg_update_auth"
  ON public.pre_registrations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can DELETE
CREATE POLICY "pre_reg_delete_auth"
  ON public.pre_registrations
  FOR DELETE
  TO authenticated
  USING (true);

-- Step 5: Grant permissions explicitly
GRANT INSERT ON public.pre_registrations TO anon;
GRANT ALL ON public.pre_registrations TO authenticated;

-- Step 6: Verify policies are set correctly
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'pre_registrations'
ORDER BY policyname;

-- Step 7: Quick verification - check columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pre_registrations'
ORDER BY ordinal_position;
