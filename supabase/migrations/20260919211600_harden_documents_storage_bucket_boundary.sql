-- Forward-only storage hardening.
-- Remove the generic tenant policy that accidentally applied to every bucket.
-- Replace it with explicit documents-bucket boundaries.
DROP POLICY IF EXISTS storage_objects_select_current_tenant ON storage.objects;
DROP POLICY IF EXISTS storage_objects_insert_current_tenant ON storage.objects;
DROP POLICY IF EXISTS storage_objects_update_current_tenant_owner ON storage.objects;
DROP POLICY IF EXISTS storage_objects_delete_current_tenant_owner ON storage.objects;

CREATE POLICY documents_storage_select_tenant
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (SELECT public.current_company_id()::text)
  );

CREATE POLICY documents_storage_insert_tenant
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (SELECT public.current_company_id()::text)
    AND owner_id = (SELECT auth.uid()::text)
  );

CREATE POLICY documents_storage_update_tenant_owner
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (SELECT public.current_company_id()::text)
    AND owner_id = (SELECT auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (SELECT public.current_company_id()::text)
    AND owner_id = (SELECT auth.uid()::text)
  );

CREATE POLICY documents_storage_delete_tenant_owner
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (SELECT public.current_company_id()::text)
    AND owner_id = (SELECT auth.uid()::text)
  );

UPDATE storage.buckets
SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/tiff',
    'image/webp'
  ]
WHERE id = 'documents';
