-- MLV PG Services — Gallery Table & Storage Setup
-- Run this in your Supabase SQL Editor

-- ── 1. Create gallery table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text,
  description  text,
  image_url    text NOT NULL,
  storage_path text NOT NULL,
  category     text NOT NULL DEFAULT 'general'
                 CHECK (category IN ('hostel','food','rooms','events','general')),
  sort_order   integer NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- ── 2. Indexes ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_gallery_category   ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_is_active  ON gallery(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON gallery(sort_order);

-- ── 3. Auto-update updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_gallery_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_gallery_updated_at ON gallery;
CREATE TRIGGER trg_gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW EXECUTE FUNCTION update_gallery_updated_at();

-- ── 4. Row Level Security ─────────────────────────────────────────────
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Public can SELECT active images
CREATE POLICY "gallery_select_public"
  ON gallery FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Authenticated (admin) can SELECT all
CREATE POLICY "gallery_select_admin"
  ON gallery FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated (admin) can INSERT / UPDATE / DELETE
CREATE POLICY "gallery_insert_admin"
  ON gallery FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "gallery_update_admin"
  ON gallery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "gallery_delete_admin"
  ON gallery FOR DELETE TO authenticated USING (true);

-- ── 5. Grants ─────────────────────────────────────────────────────────
GRANT SELECT ON gallery TO anon;
GRANT ALL   ON gallery TO authenticated;

-- ── 6. Verify ─────────────────────────────────────────────────────────
SELECT 'Gallery table created successfully ✅' AS result;

-- ─────────────────────────────────────────────────────────────────────
-- STORAGE BUCKET (run separately if needed via Supabase Dashboard)
-- Go to: Storage → New Bucket → Name: "gallery" → Public: ON
-- OR run:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true)
-- ON CONFLICT (id) DO NOTHING;
-- ─────────────────────────────────────────────────────────────────────
