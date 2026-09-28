-- Align the canonical private documents bucket with the executable import/file-engine contract.
-- Historical bucket state remains immutable; this additive migration updates only the existing documents bucket.
UPDATE storage.buckets
SET file_size_limit = 104857600,
    allowed_mime_types = ARRAY[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
      'application/vnd.oasis.opendocument.spreadsheet',
      'text/csv',
      'text/tab-separated-values',
      'application/json',
      'application/x-ndjson',
      'text/plain',
      'text/markdown',
      'image/png',
      'image/jpeg',
      'image/tiff',
      'image/webp',
      'image/bmp'
    ]::text[]
WHERE id = 'documents';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'documents'
      AND file_size_limit = 104857600
      AND allowed_mime_types @> ARRAY[
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.oasis.opendocument.spreadsheet',
        'text/tab-separated-values',
        'application/json',
        'application/x-ndjson',
        'text/markdown',
        'image/bmp'
      ]::text[]
  ) THEN
    RAISE EXCEPTION 'DOCUMENTS_BUCKET_CONTRACT_NOT_APPLIED';
  END IF;
END $$;