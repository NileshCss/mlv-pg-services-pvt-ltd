-- MLV PG Services — Testimonials Table
-- Run this in your Supabase SQL editor

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name  text NOT NULL,
  college       text,
  rating        integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review        text NOT NULL,
  photo_url     text,
  storage_path  text,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured   boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_status      ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at  ON testimonials(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_testimonials_updated_at ON testimonials;
CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_testimonials_updated_at();

-- RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT (public submit)
CREATE POLICY "testimonials_insert_public"
  ON testimonials FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can SELECT approved/featured (public display)
CREATE POLICY "testimonials_select_public"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (status IN ('approved') OR is_featured = true);

-- Authenticated (admin) can SELECT all
CREATE POLICY "testimonials_select_admin"
  ON testimonials FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated (admin) can UPDATE
CREATE POLICY "testimonials_update_admin"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

-- Authenticated (admin) can DELETE
CREATE POLICY "testimonials_delete_admin"
  ON testimonials FOR DELETE
  TO authenticated
  USING (true);

-- Grants
GRANT INSERT ON testimonials TO anon;
GRANT SELECT ON testimonials TO anon;
GRANT ALL   ON testimonials TO authenticated;

-- Verify
SELECT 'Testimonials table created successfully' AS result;
