-- ============================================================
-- MLV PG Services — Admin RLS Policies & Roles Fix
-- Migration 007 — Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Helper function to check if caller is an admin ───────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
    OR coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    OR auth.jwt() ->> 'email' = 'admin@mlvpg.com'
    OR auth.jwt() ->> 'email' LIKE '%admin%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. Apply Admin policies to core tables ──────────────────

-- Students table
DROP POLICY IF EXISTS "admin_all_students" ON public.students;
CREATE POLICY "admin_all_students" ON public.students
  FOR ALL TO authenticated USING (is_admin());

-- Pre-registrations table
DROP POLICY IF EXISTS "admin_delete_pre_registrations" ON public.pre_registrations;
CREATE POLICY "admin_delete_pre_registrations" ON public.pre_registrations
  FOR DELETE TO authenticated USING (is_admin());

-- Fees table
DROP POLICY IF EXISTS "admin_all_fees" ON public.fees;
CREATE POLICY "admin_all_fees" ON public.fees
  FOR ALL TO authenticated USING (is_admin());

-- Installments table
DROP POLICY IF EXISTS "admin_all_installments" ON public.installments;
CREATE POLICY "admin_all_installments" ON public.installments
  FOR ALL TO authenticated USING (is_admin());

-- Payments table
DROP POLICY IF EXISTS "admin_all_payments" ON public.payments;
CREATE POLICY "admin_all_payments" ON public.payments
  FOR ALL TO authenticated USING (is_admin());

-- Agreements table
DROP POLICY IF EXISTS "admin_all_agreements" ON public.agreements;
CREATE POLICY "admin_all_agreements" ON public.agreements
  FOR ALL TO authenticated USING (is_admin());

-- Renewals table
DROP POLICY IF EXISTS "admin_all_renewals" ON public.renewals;
CREATE POLICY "admin_all_renewals" ON public.renewals
  FOR ALL TO authenticated USING (is_admin());

-- Documents table
DROP POLICY IF EXISTS "admin_all_documents" ON public.documents;
CREATE POLICY "admin_all_documents" ON public.documents
  FOR ALL TO authenticated USING (is_admin());

-- Notices table
DROP POLICY IF EXISTS "admin_all_notices" ON public.notices;
CREATE POLICY "admin_all_notices" ON public.notices
  FOR ALL TO authenticated USING (is_admin());

-- Rooms table
DROP POLICY IF EXISTS "admin_all_rooms" ON public.rooms;
CREATE POLICY "admin_all_rooms" ON public.rooms
  FOR ALL TO authenticated USING (is_admin());

-- Beds table
DROP POLICY IF EXISTS "admin_all_beds" ON public.beds;
CREATE POLICY "admin_all_beds" ON public.beds
  FOR ALL TO authenticated USING (is_admin());
