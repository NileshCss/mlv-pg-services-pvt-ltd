-- ============================================================
-- MLV PG Services — Complete Supabase Schema
-- Run this ENTIRE script in your Supabase SQL Editor
-- Project: wgnbbxvbzjsmvmiutzgd.supabase.co
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- 2. ENUM TYPES
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('new', 'contacted', 'confirmed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE contact_status AS ENUM ('new', 'read', 'replied');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'manager');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. TABLE: pre_registrations
--    Used by: /api/registrations, PreRegistrationForm.tsx
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pre_registrations (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Student Info
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT NOT NULL,
  gender          TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),

  -- Academic Info
  college_name    TEXT NOT NULL,
  course          TEXT NOT NULL,

  -- PG Preferences
  room_preference TEXT NOT NULL,
  check_in_date   DATE NOT NULL,
  food_preference TEXT NOT NULL,

  -- Emergency Contact
  parent_contact  TEXT NOT NULL,

  -- Optional
  additional_notes TEXT,

  -- Admin Tracking
  status          registration_status DEFAULT 'new' NOT NULL,
  notes           TEXT,                        -- Internal admin notes
  assigned_to     TEXT                         -- Admin email who is handling
);

-- ─────────────────────────────────────────────────────────────
-- 4. TABLE: contact
--    Used by: /api/contact, ContactForm.tsx
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,

  status      contact_status DEFAULT 'new' NOT NULL,
  reply_text  TEXT,                   -- Admin reply stored here
  replied_at  TIMESTAMPTZ             -- When admin replied
);

-- ─────────────────────────────────────────────────────────────
-- 5. TABLE: room_bookings
--    Used by: types/database.ts RoomBooking type
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_bookings (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  student_name    TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  room_number     TEXT NOT NULL,
  room_type       TEXT NOT NULL,

  check_in_date   DATE,
  check_out_date  DATE,
  monthly_rent    NUMERIC(10,2),

  payment_status  payment_status DEFAULT 'pending' NOT NULL,
  booking_status  booking_status DEFAULT 'pending' NOT NULL,

  -- Link to pre_registration if exists
  registration_id UUID REFERENCES public.pre_registrations(id) ON DELETE SET NULL,
  notes           TEXT
);

-- ─────────────────────────────────────────────────────────────
-- 6. TABLE: admin_users
--    Used by: types/database.ts AdminUser type, admin dashboard
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  email       TEXT NOT NULL UNIQUE,
  role        admin_role DEFAULT 'admin' NOT NULL,
  full_name   TEXT,
  is_active   BOOLEAN DEFAULT TRUE NOT NULL,
  last_login  TIMESTAMPTZ
);

-- ─────────────────────────────────────────────────────────────
-- 7. TABLE: testimonials
--    Used by: types/database.ts Testimonial type
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.testimonials (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  student_name TEXT NOT NULL,
  course       TEXT,
  college_name TEXT,
  message      TEXT NOT NULL,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  image_url    TEXT,
  is_approved  BOOLEAN DEFAULT FALSE NOT NULL,
  is_featured  BOOLEAN DEFAULT FALSE NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- 8. TABLE: gallery_images
--    Used by: types/database.ts GalleryImage type
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  image_url   TEXT NOT NULL,
  title       TEXT,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'general',
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- 9. TRIGGERS: auto-update updated_at
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'pre_registrations', 
    'contact', 
    'room_bookings', 
    'admin_users', 
    'testimonials', 
    'gallery_images'
  ] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    ', tbl, tbl);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 10. INDEXES (for performance)
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pre_reg_status    ON public.pre_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pre_reg_email     ON public.pre_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pre_reg_created   ON public.pre_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status    ON public.contact(status);
CREATE INDEX IF NOT EXISTS idx_contact_created   ON public.contact(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status   ON public.room_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_gallery_category  ON public.gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_active    ON public.gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_appr ON public.testimonials(is_approved);

-- ─────────────────────────────────────────────────────────────
-- 11. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images     ENABLE ROW LEVEL SECURITY;

-- ── pre_registrations ──────────────────────────────────────
-- Anyone can INSERT (public form submission)
DROP POLICY IF EXISTS "pre_registrations_insert_public" ON public.pre_registrations;
CREATE POLICY "pre_registrations_insert_public"
  ON public.pre_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service_role / authenticated admins can SELECT
DROP POLICY IF EXISTS "pre_registrations_select_admin" ON public.pre_registrations;
CREATE POLICY "pre_registrations_select_admin"
  ON public.pre_registrations FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated can UPDATE/DELETE
DROP POLICY IF EXISTS "pre_registrations_update_admin" ON public.pre_registrations;
CREATE POLICY "pre_registrations_update_admin"
  ON public.pre_registrations FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "pre_registrations_delete_admin" ON public.pre_registrations;
CREATE POLICY "pre_registrations_delete_admin"
  ON public.pre_registrations FOR DELETE
  TO authenticated
  USING (true);

-- ── contact ────────────────────────────────────────────────
DROP POLICY IF EXISTS "contact_insert_public" ON public.contact;
CREATE POLICY "contact_insert_public"
  ON public.contact FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "contact_select_admin" ON public.contact;
CREATE POLICY "contact_select_admin"
  ON public.contact FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "contact_update_admin" ON public.contact;
CREATE POLICY "contact_update_admin"
  ON public.contact FOR UPDATE
  TO authenticated
  USING (true);

-- ── testimonials ───────────────────────────────────────────
-- Anyone can read approved testimonials
DROP POLICY IF EXISTS "testimonials_select_public" ON public.testimonials;
CREATE POLICY "testimonials_select_public"
  ON public.testimonials FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

DROP POLICY IF EXISTS "testimonials_all_admin" ON public.testimonials;
CREATE POLICY "testimonials_all_admin"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── gallery_images ─────────────────────────────────────────
DROP POLICY IF EXISTS "gallery_select_public" ON public.gallery_images;
CREATE POLICY "gallery_select_public"
  ON public.gallery_images FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "gallery_all_admin" ON public.gallery_images;
CREATE POLICY "gallery_all_admin"
  ON public.gallery_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── room_bookings ──────────────────────────────────────────
DROP POLICY IF EXISTS "bookings_all_admin" ON public.room_bookings;
CREATE POLICY "bookings_all_admin"
  ON public.room_bookings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── admin_users ────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_users_select" ON public.admin_users;
CREATE POLICY "admin_users_select"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (true);

-- ─────────────────────────────────────────────────────────────
-- 12. SEED DATA — Sample testimonials & gallery (for testing)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.testimonials (student_name, course, college_name, message, rating, is_approved, is_featured)
VALUES
  ('Rahul Sharma', 'B.Tech CSE', 'Acharya Institute of Technology', 'MLV PG Services provided an amazing stay. Clean rooms, great food, and very cooperative staff. Highly recommended!', 5, true, true),
  ('Priya Patel', 'MBA', 'REVA University', 'Excellent PG accommodation with all modern amenities. The mess food is hygienic and delicious. Felt like home!', 5, true, true),
  ('Amit Kumar', 'B.Com', 'Christ University', 'Great location, affordable price, and excellent security. My parents feel safe knowing I stay here.', 4, true, false)
ON CONFLICT DO NOTHING;

INSERT INTO public.gallery_images (image_url, title, category, sort_order, is_active)
VALUES
  ('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'Common Room', 'amenities', 1, true),
  ('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'Double Sharing Room', 'rooms', 2, true),
  ('https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800', 'Single Room', 'rooms', 3, true),
  ('https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800', 'Dining Area', 'amenities', 4, true)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 13. VERIFY — Check all tables were created
-- ─────────────────────────────────────────────────────────────
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name AND table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
