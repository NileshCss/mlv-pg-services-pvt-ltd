-- ============================================================
-- MLV PG Services — Student Portal Schema Migration
-- Run this in Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- ── 1. Extend pre_registrations with new fields ─────────────
ALTER TABLE pre_registrations
  ADD COLUMN IF NOT EXISTS application_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS aadhar_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS college_id_url TEXT,
  ADD COLUMN IF NOT EXISTS parent_name TEXT,
  ADD COLUMN IF NOT EXISTS parent_contact TEXT,
  ADD COLUMN IF NOT EXISTS permanent_address TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Indian',
  ADD COLUMN IF NOT EXISTS year_of_study TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- ── 2. Rooms ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT UNIQUE NOT NULL,
  floor INTEGER DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('single','double','triple')),
  capacity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance')),
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  monthly_rent NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. Beds ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, bed_number)
);

-- ── 4. Students ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  application_id TEXT REFERENCES pre_registrations(application_id) ON DELETE SET NULL,
  student_id TEXT UNIQUE,                   -- e.g. MLV-STU-0001
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT,
  college_name TEXT,
  course TEXT,
  year_of_study TEXT,
  parent_name TEXT,
  parent_contact TEXT,
  permanent_address TEXT,
  emergency_contact TEXT,
  nationality TEXT DEFAULT 'Indian',
  gender TEXT,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  joining_date DATE,
  agreement_end_date DATE,
  profile_photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. Fees ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  monthly_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  security_deposit NUMERIC(10,2) NOT NULL DEFAULT 0,
  security_deposit_paid BOOLEAN NOT NULL DEFAULT false,
  security_deposit_paid_at TIMESTAMPTZ,
  plan_type TEXT NOT NULL DEFAULT 'monthly' CHECK (plan_type IN ('monthly','bi_monthly','quarterly')),
  late_fee NUMERIC(10,2) DEFAULT 0,
  payment_mode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 6. Installments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id UUID NOT NULL REFERENCES fees(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  installment_no INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid','pending','overdue')),
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 7. Payments ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  installment_id UUID REFERENCES installments(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cash','upi','bank_transfer','razorpay','cheque','other')),
  transaction_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('monthly','security_deposit','renewal','late_fee','other')),
  receipt_url TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 8. Agreements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  file_url TEXT,
  signed BOOLEAN NOT NULL DEFAULT false,
  signature_data TEXT,
  signed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 9. Renewals ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  slip_url TEXT,
  new_end_date DATE,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- ── 10. Complaints (student portal version) ──────────────────
CREATE TABLE IF NOT EXISTS student_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('food','electricity','internet','cleaning','water','maintenance','other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 11. Documents ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('aadhar','photo','college_id','agreement','renewal_slip','receipt','other')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  uploaded_by TEXT NOT NULL DEFAULT 'student',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 12. Notices ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general','urgent','events','maintenance')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all','student','admin')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 13. OTP Tokens ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,              -- store plain (short-lived, 10 min)
  purpose TEXT NOT NULL CHECK (purpose IN ('pre_register','forgot_password')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 14. Audit Logs ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_room_id ON students(room_id);
CREATE INDEX IF NOT EXISTS idx_installments_student_id ON installments(student_id);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_complaints_student_id ON student_complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_email ON otp_tokens(email);
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON beds(room_id);

-- ── RLS Policies ─────────────────────────────────────────────

-- Students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students_own_row" ON students
  FOR ALL USING (user_id = auth.uid());

-- Fees table
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fees_own" ON fees
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Installments table
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "installments_own" ON installments
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_own" ON payments
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Agreements table
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agreements_own" ON agreements
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Renewals table
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "renewals_own" ON renewals
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Student Complaints table
ALTER TABLE student_complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints_own" ON student_complaints
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_own" ON documents
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Notices: all authenticated users can read
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notices_read" ON notices
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Rooms: authenticated users can read
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_read" ON rooms
  FOR SELECT USING (auth.role() = 'authenticated');

-- Beds: authenticated users can read
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "beds_read" ON beds
  FOR SELECT USING (auth.role() = 'authenticated');

-- OTP tokens: no RLS — only accessible via service role in API routes
-- (keep table private, access only through API)

-- ── Seed: Insert sample rooms ─────────────────────────────────
INSERT INTO rooms (room_number, floor, type, capacity, monthly_rent, amenities)
VALUES
  ('101', 1, 'single', 1, 13000, ARRAY['WiFi','AC','Wardrobe','Study Table']),
  ('102', 1, 'double', 2, 9500, ARRAY['WiFi','Fan','Wardrobe','Study Table']),
  ('103', 1, 'triple', 3, 7500, ARRAY['WiFi','Fan','Wardrobe','Study Table']),
  ('201', 2, 'double', 2, 9500, ARRAY['WiFi','Fan','Wardrobe','Study Table']),
  ('202', 2, 'triple', 3, 7500, ARRAY['WiFi','Fan','Wardrobe','Study Table']),
  ('203', 2, 'single', 1, 13000, ARRAY['WiFi','AC','Wardrobe','Study Table'])
ON CONFLICT (room_number) DO NOTHING;

-- Seed beds for each room
INSERT INTO beds (room_id, bed_number)
SELECT id, 'A' FROM rooms WHERE room_number IN ('101','201','203')
ON CONFLICT DO NOTHING;

INSERT INTO beds (room_id, bed_number)
SELECT r.id, b.bed FROM rooms r CROSS JOIN (VALUES ('A'),('B')) AS b(bed)
WHERE r.room_number IN ('102','201')
ON CONFLICT DO NOTHING;

INSERT INTO beds (room_id, bed_number)
SELECT r.id, b.bed FROM rooms r CROSS JOIN (VALUES ('A'),('B'),('C')) AS b(bed)
WHERE r.room_number IN ('103','202')
ON CONFLICT DO NOTHING;
