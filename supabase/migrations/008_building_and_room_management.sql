-- ============================================================
-- MLV PG Services — Buildings & Room Management Upgrade
-- Migration 008 — Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Create Buildings Table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('Boys PG', 'Girls PG')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on buildings
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

-- Drop existing admin/public policies for buildings
DROP POLICY IF EXISTS "admin_all_buildings" ON public.buildings;
DROP POLICY IF EXISTS "public_select_buildings" ON public.buildings;

-- Admin Policy: Authenticated admin has full access
CREATE POLICY "admin_all_buildings" ON public.buildings
  FOR ALL TO authenticated USING (public.is_admin());

-- Public Policy: Authenticated users (students & public) can view buildings
CREATE POLICY "public_select_buildings" ON public.buildings
  FOR SELECT TO authenticated USING (true);


-- ── 2. Alter Rooms Table Schema ──────────────────────────────
-- Safely alter CHECK constraint on status to include 'reserved'
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_status_check1;
ALTER TABLE public.rooms ADD CONSTRAINT rooms_status_check CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved'));

-- Add columns to rooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS security_deposit NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS electricity_charges NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS maintenance_charges NUMERIC(10,2) DEFAULT 0;


-- ── 3. Seed Buildings Data ───────────────────────────────────
INSERT INTO public.buildings (name, code, address, description, status)
VALUES
  ('MLV PG Building A', 'BLDG-A', 'Near Acharya College, Soladevanahalli, Bangalore', 'Premium block with AC rooms', 'Boys PG'),
  ('MLV PG Building B', 'BLDG-B', 'Near Acharya College, Soladevanahalli, Bangalore', 'Standard single and double sharing block', 'Boys PG'),
  ('MLV PG Building C', 'BLDG-C', 'Near Acharya College, Soladevanahalli, Bangalore', 'Exclusive Girls PG block', 'Girls PG')
ON CONFLICT (name) DO NOTHING;


-- ── 4. Map Existing Rooms to New Buildings ───────────────────
-- If rooms building_name matches newly seeded buildings, link building_id
UPDATE public.rooms r
SET building_id = b.id
FROM public.buildings b
WHERE r.building_name = b.name;

-- For any other rooms, link to Building A as a default fallback
UPDATE public.rooms
SET building_id = (SELECT id FROM public.buildings WHERE name = 'MLV PG Building A' LIMIT 1)
WHERE building_id IS NULL;


-- ── 5. Enable Realtime Replication for Buildings ─────────────
ALTER TABLE public.buildings REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'buildings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.buildings;
  END IF;
END $$;
