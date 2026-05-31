-- ============================================================
-- MLV PG Services — Notification Management System
-- Migration 011 — Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Create Notifications Table ──────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'complaint', 'payment', 'contact', 'review', 'student', 'room', 'building', 'system')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  recipient_type TEXT NOT NULL DEFAULT 'admin' CHECK (recipient_type IN ('admin', 'student')),
  recipient_id UUID, -- NULL for global admin notifications, or student user_id for student notifications
  read_status BOOLEAN NOT NULL DEFAULT false,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  whatsapp_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Create Admin Notification Settings Table ─────────────
CREATE TABLE IF NOT EXISTS public.admin_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT true,
  dashboard_enabled BOOLEAN NOT NULL DEFAULT true,
  critical_alerts BOOLEAN NOT NULL DEFAULT true,
  payment_alerts BOOLEAN NOT NULL DEFAULT true,
  complaint_alerts BOOLEAN NOT NULL DEFAULT true,
  registration_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. Enable RLS and Add Policies ──────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
DROP POLICY IF EXISTS "admin_all_notifications" ON public.notifications;
CREATE POLICY "admin_all_notifications" ON public.notifications
  FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "student_read_notifications" ON public.notifications;
CREATE POLICY "student_read_notifications" ON public.notifications
  FOR SELECT TO authenticated USING (
    recipient_type = 'student' 
    AND recipient_id = auth.uid()
  );

-- Settings Policies
DROP POLICY IF EXISTS "admin_all_settings" ON public.admin_notification_settings;
CREATE POLICY "admin_all_settings" ON public.admin_notification_settings
  FOR ALL TO authenticated USING (public.is_admin());

-- ── 4. Set up Supabase Realtime for Notifications ───────────
-- Add the notifications table to the realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- ── 5. Trigger: Auto-create default settings for new Admin users ──
-- This will automatically set up default settings when a new admin user logs in
CREATE OR REPLACE FUNCTION public.handle_new_admin_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- We check if the user is an admin or has admin role in metadata
  IF (NEW.raw_user_meta_data->>'role' = 'admin' OR NEW.email = 'admin@mlvpg.com' OR NEW.email LIKE '%admin%') THEN
    INSERT INTO public.admin_notification_settings (admin_id)
    VALUES (NEW.id)
    ON CONFLICT (admin_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_settings();

-- Insert default settings for existing admin users (in case they exist in auth.users)
-- (We use raw SQL block to seed default settings safely)
INSERT INTO public.admin_notification_settings (admin_id)
SELECT id FROM auth.users u
WHERE (u.raw_user_meta_data->>'role' = 'admin' OR u.email = 'admin@mlvpg.com' OR u.email LIKE '%admin%')
ON CONFLICT (admin_id) DO NOTHING;

COMMENT ON TABLE public.notifications IS 'Audit and system events that trigger admin notifications, dashboard feeds, emails, or WhatsApp dispatches.';
COMMENT ON TABLE public.admin_notification_settings IS 'Preferences configured by administrators to enable or disable specific notification alerts.';
