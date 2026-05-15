-- ─── notices table ──────────────────────────────────────────────────────────
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text        TEXT        NOT NULL,
  emoji       TEXT        NOT NULL DEFAULT '📢',
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  "order"     INTEGER     NOT NULL DEFAULT 99,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for the homepage query (active only, ordered)
CREATE INDEX IF NOT EXISTS idx_notices_active_order ON notices (is_active, "order");

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_notices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notices_updated_at ON notices;
CREATE TRIGGER trg_notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW
  EXECUTE FUNCTION update_notices_updated_at();

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Public can only read active notices
DROP POLICY IF EXISTS "Public read active notices" ON notices;
CREATE POLICY "Public read active notices"
  ON notices FOR SELECT
  USING (is_active = true);

-- Authenticated users (admins) can read all
DROP POLICY IF EXISTS "Admins read all notices" ON notices;
CREATE POLICY "Admins read all notices"
  ON notices FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert
DROP POLICY IF EXISTS "Admins insert notices" ON notices;
CREATE POLICY "Admins insert notices"
  ON notices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update
DROP POLICY IF EXISTS "Admins update notices" ON notices;
CREATE POLICY "Admins update notices"
  ON notices FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated users can delete
DROP POLICY IF EXISTS "Admins delete notices" ON notices;
CREATE POLICY "Admins delete notices"
  ON notices FOR DELETE
  TO authenticated
  USING (true);

-- ─── Seed data (optional) ────────────────────────────────────────────────────
INSERT INTO notices (text, emoji, is_active, "order") VALUES
  ('New rooms now available – Limited seats!',  '🏠',  true, 1),
  ('Updated Food Menu for this month is live',  '🍽️', true, 2),
  ('Pre-Registration open for 2026 batch',      '📋',  true, 3),
  ('Contact us: +91 8809630649',                '📞',  true, 4),
  ('WiFi upgraded to 1 Gbps across all floors', '✅',  true, 5)
ON CONFLICT DO NOTHING;
