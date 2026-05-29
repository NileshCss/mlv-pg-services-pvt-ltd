-- ── MLV PG Services — Student Documents Storage Setup ──
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
