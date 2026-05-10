-- ============================================================
-- MLV PG Services — Migration to Add Nationality Column
-- Run this ENTIRE script in your Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Enable RLS (Row Level Security) on tables
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 2. Create RLS Policies for pre_registrations
-- ─────────────────────────────────────────────────────────────

-- Allow anon role to INSERT
DROP POLICY IF EXISTS "pre_registrations_insert_anon" ON public.pre_registrations;
CREATE POLICY "pre_registrations_insert_anon"
  ON public.pre_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated role to INSERT
DROP POLICY IF EXISTS "pre_registrations_insert_auth" ON public.pre_registrations;
CREATE POLICY "pre_registrations_insert_auth"
  ON public.pre_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated role to SELECT
DROP POLICY IF EXISTS "pre_registrations_select_auth" ON public.pre_registrations;
CREATE POLICY "pre_registrations_select_auth"
  ON public.pre_registrations
  FOR SELECT
  TO authenticated
  USING (true);

-- ─────────────────────────────────────────────────────────────
-- 3. Create RLS Policies for contact
-- ─────────────────────────────────────────────────────────────

-- Allow anon role to INSERT
DROP POLICY IF EXISTS "contact_insert_anon" ON public.contact;
CREATE POLICY "contact_insert_anon"
  ON public.contact
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated role to INSERT
DROP POLICY IF EXISTS "contact_insert_auth" ON public.contact;
CREATE POLICY "contact_insert_auth"
  ON public.contact
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated role to SELECT
DROP POLICY IF EXISTS "contact_select_auth" ON public.contact;
CREATE POLICY "contact_select_auth"
  ON public.contact
  FOR SELECT
  TO authenticated
  USING (true);

-- ─────────────────────────────────────────────────────────────
-- 4. Add nationality column to pre_registrations
-- ─────────────────────────────────────────────────────────────

-- First, add the column if it doesn't exist
ALTER TABLE public.pre_registrations 
ADD COLUMN IF NOT EXISTS nationality TEXT;

-- ─────────────────────────────────────────────────────────────
-- 5. Update gender column constraint (relax it to allow any text)
-- ─────────────────────────────────────────────────────────────

-- Drop the old CHECK constraint
ALTER TABLE public.pre_registrations 
DROP CONSTRAINT IF EXISTS pre_registrations_gender_check;

-- The gender column can now store any text value (for backward compatibility)
-- but won't enforce specific values

-- ─────────────────────────────────────────────────────────────
-- 6. Verify the changes
-- ─────────────────────────────────────────────────────────────

-- Check table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'pre_registrations' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pre_registrations', 'contact')
ORDER BY tablename, policyname;
