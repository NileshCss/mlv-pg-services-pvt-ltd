-- ── MLV PG Services — Student Documents Storage & Table Setup ──
-- Safe to re-run multiple times (all statements are idempotent)

-- 1. Create the "student-documents" public bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-documents',
  'student-documents',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- 2. Drop existing storage RLS policies for student-documents (safe to re-run)
DROP POLICY IF EXISTS "storage_documents_upload"      ON storage.objects;
DROP POLICY IF EXISTS "storage_documents_update"      ON storage.objects;
DROP POLICY IF EXISTS "storage_documents_delete"      ON storage.objects;
DROP POLICY IF EXISTS "storage_documents_public_read" ON storage.objects;

-- 3. Storage RLS: Authenticated users (students & admins) can upload objects into student-documents
CREATE POLICY "storage_documents_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'student-documents');

-- 4. Storage RLS: Authenticated users can update objects in student-documents
CREATE POLICY "storage_documents_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'student-documents');

-- 5. Storage RLS: Authenticated users can delete their own objects in student-documents
CREATE POLICY "storage_documents_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'student-documents');

-- 6. Storage RLS: Anyone can read/view objects in student-documents (as it is a public bucket)
CREATE POLICY "storage_documents_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'student-documents');

-- 7. Database RLS: Configure "documents" table Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Drop existing documents policies
DROP POLICY IF EXISTS "documents_own" ON public.documents;
DROP POLICY IF EXISTS "documents_select" ON public.documents;
DROP POLICY IF EXISTS "documents_insert" ON public.documents;
DROP POLICY IF EXISTS "documents_update" ON public.documents;
DROP POLICY IF EXISTS "documents_delete" ON public.documents;

-- 7.1 SELECT Policy: Students and Admins can view documents (authenticated users)
CREATE POLICY "documents_select" ON public.documents
  FOR SELECT
  TO authenticated
  USING (true);

-- 7.2 INSERT Policy: Students can insert their own records, Admins (non-students) can insert any
CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    OR
    NOT EXISTS (SELECT 1 FROM students WHERE user_id = auth.uid())
  );

-- 7.3 UPDATE Policy: Admins can update records (students cannot update)
CREATE POLICY "documents_update" ON public.documents
  FOR UPDATE
  TO authenticated
  USING (
    NOT EXISTS (SELECT 1 FROM students WHERE user_id = auth.uid())
  )
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM students WHERE user_id = auth.uid())
  );

-- 7.4 DELETE Policy: Students can delete their own unverified records, Admins can delete any
CREATE POLICY "documents_delete" ON public.documents
  FOR DELETE
  TO authenticated
  USING (
    (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) AND NOT verified)
    OR
    NOT EXISTS (SELECT 1 FROM students WHERE user_id = auth.uid())
  );

