-- ============================================================
-- MLV PG Services — Complaints Table RLS Fix
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Drop ALL existing policies on complaints table
DROP POLICY IF EXISTS "Public can submit complaints"    ON public.complaints;
DROP POLICY IF EXISTS "Authenticated can view complaints"   ON public.complaints;
DROP POLICY IF EXISTS "Authenticated can update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Authenticated can delete complaints" ON public.complaints;
DROP POLICY IF EXISTS "complaints_insert_public"        ON public.complaints;
DROP POLICY IF EXISTS "complaints_select_admin"         ON public.complaints;
DROP POLICY IF EXISTS "complaints_update_admin"         ON public.complaints;
DROP POLICY IF EXISTS "complaints_delete_admin"         ON public.complaints;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Step 3: Recreate policies correctly

-- Anyone (anon + authenticated) can INSERT (public complaint form)
CREATE POLICY "complaints_insert_all"
  ON public.complaints
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated admins can SELECT (admin dashboard)
CREATE POLICY "complaints_select_auth"
  ON public.complaints
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated admins can UPDATE (resolve, add notes)
CREATE POLICY "complaints_update_auth"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can DELETE
CREATE POLICY "complaints_delete_auth"
  ON public.complaints
  FOR DELETE
  TO authenticated
  USING (true);

-- Step 4: Grant explicit permissions
GRANT INSERT ON public.complaints TO anon;
GRANT ALL   ON public.complaints TO authenticated;

-- Step 5: Verify — should show 4 policies
SELECT policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'complaints'
ORDER BY policyname;
