-- ================================================================
-- MLV PG Services Admin Dashboard - Complete PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- ENUM TYPES
-- ================================================================

CREATE TYPE booking_status AS ENUM (
  'new', 'interested', 'contacted', 'confirmed', 'checked_in', 'cancelled'
);

CREATE TYPE registration_status AS ENUM (
  'new', 'contacted', 'interested', 'confirmed', 'cancelled'
);

CREATE TYPE room_type AS ENUM ('single', 'double', 'triple', 'dormitory');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- ================================================================
-- REGISTRATIONS TABLE
-- ================================================================

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  college TEXT,
  course TEXT,
  check_in_date DATE,
  check_out_date DATE,
  status registration_status DEFAULT 'new',
  notes TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_created_at ON registrations(created_at DESC);
CREATE INDEX idx_registrations_phone ON registrations(phone);

-- ================================================================
-- BOOKINGS TABLE
-- ================================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  room_id UUID,
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  status booking_status DEFAULT 'new',
  amount_total NUMERIC(10,2),
  amount_paid NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT,
  payment_notes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_registration_id ON bookings(registration_id);

-- ================================================================
-- ROOMS TABLE
-- ================================================================

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number TEXT NOT NULL UNIQUE,
  floor INTEGER,
  room_type room_type DEFAULT 'double',
  total_beds INTEGER NOT NULL DEFAULT 2,
  occupied_beds INTEGER DEFAULT 0,
  price_per_bed NUMERIC(10,2),
  is_ac BOOLEAN DEFAULT FALSE,
  has_attached_bathroom BOOLEAN DEFAULT FALSE,
  maintenance_status BOOLEAN DEFAULT FALSE,
  amenities TEXT[],
  images TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rooms_floor ON rooms(floor);
CREATE INDEX idx_rooms_type ON rooms(room_type);

-- ================================================================
-- FOOD MENU TABLE
-- ================================================================

CREATE TABLE food_menu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day TEXT NOT NULL CHECK (day IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  breakfast TEXT,
  lunch TEXT,
  dinner TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(day)
);

-- ================================================================
-- GALLERY TABLE
-- ================================================================

CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('hostel','food','rooms','events','general')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gallery_category ON gallery(category);

-- ================================================================
-- TESTIMONIALS TABLE
-- ================================================================

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  college TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  photo_url TEXT,
  storage_path TEXT,
  status approval_status DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);

-- ================================================================
-- SETTINGS TABLE
-- ================================================================

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY - Enable on all tables
-- ================================================================

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES - Admin Access Only (Authenticated Users)
-- ================================================================

-- Registrations Policies
CREATE POLICY "Authenticated users can view registrations"
  ON registrations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert registrations"
  ON registrations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update registrations"
  ON registrations FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete registrations"
  ON registrations FOR DELETE
  USING (auth.role() = 'authenticated');

-- Bookings Policies
CREATE POLICY "Authenticated users can view bookings"
  ON bookings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update bookings"
  ON bookings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete bookings"
  ON bookings FOR DELETE
  USING (auth.role() = 'authenticated');

-- Rooms Policies
CREATE POLICY "Authenticated users can view rooms"
  ON rooms FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert rooms"
  ON rooms FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rooms"
  ON rooms FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete rooms"
  ON rooms FOR DELETE
  USING (auth.role() = 'authenticated');

-- Food Menu Policies
CREATE POLICY "Authenticated users can view food_menu"
  ON food_menu FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert food_menu"
  ON food_menu FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update food_menu"
  ON food_menu FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete food_menu"
  ON food_menu FOR DELETE
  USING (auth.role() = 'authenticated');

-- Gallery Policies
CREATE POLICY "Anyone can view active gallery"
  ON gallery FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert gallery"
  ON gallery FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update gallery"
  ON gallery FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete gallery"
  ON gallery FOR DELETE
  USING (auth.role() = 'authenticated');

-- Testimonials Policies
CREATE POLICY "Anyone can view approved testimonials"
  ON testimonials FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can view all testimonials"
  ON testimonials FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update testimonials"
  ON testimonials FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Settings Policies
CREATE POLICY "Authenticated users can view settings"
  ON settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert settings"
  ON settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update settings"
  ON settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ================================================================
-- TRIGGERS - Auto-update updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_registrations_updated_at BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_food_menu_updated_at BEFORE UPDATE ON food_menu
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================================

-- Insert sample registrations
INSERT INTO registrations (name, phone, email, college, course, check_in_date, status, source)
VALUES 
  ('Rajesh Kumar', '9876543210', 'rajesh@gmail.com', 'Acharya Institute', 'B.Tech CSE', '2026-05-15', 'new', 'website'),
  ('Priya Sharma', '9876543211', 'priya@gmail.com', 'Nitte Meenakshi', 'B.Tech ECE', '2026-05-20', 'interested', 'website'),
  ('Amit Patel', '9876543212', 'amit@gmail.com', 'Bangalore Institute', 'M.Tech', '2026-06-01', 'contacted', 'referral');

-- Insert sample rooms
INSERT INTO rooms (room_number, floor, room_type, total_beds, price_per_bed, is_ac, has_attached_bathroom)
VALUES
  ('101', 1, 'double', 2, 8500, true, true),
  ('102', 1, 'double', 2, 8500, true, true),
  ('201', 2, 'triple', 3, 7500, true, true),
  ('301', 3, 'single', 1, 12000, true, true);

-- Insert sample food menu
INSERT INTO food_menu (day, breakfast, lunch, dinner)
VALUES
  ('Monday', 'Idli + Sambar + Chutney', 'Rice + Sambar + Fry', 'Roti + Dal Fry + Sabzi'),
  ('Tuesday', 'Dosa + Sambhar', 'Rice + Rasam + Curry', 'Paratha + Dahi'),
  ('Wednesday', 'Upma + Chutney', 'Rice + Dal + Sabzi', 'Roti + Curry + Pickle');

-- ================================================================
-- END OF SCHEMA
-- ================================================================
