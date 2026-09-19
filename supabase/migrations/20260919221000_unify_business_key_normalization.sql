-- One canonical business-key normalization algorithm for import, reconciliation,
-- analysis/decision lookup, duplicate detection, and DB writes.
-- Mirrors src/lib/file-engine/business-key.ts.

CREATE OR REPLACE FUNCTION public.normalize_import_key(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path TO pg_catalog
AS $function$
SELECT NULLIF(
  upper(
    regexp_replace(
      translate(
        translate(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    regexp_replace(
                      regexp_replace(
                        regexp_replace(
                          normalize(coalesce(input, ''), NFKC),
                          chr(0x0640), '', 'g'
                        ),
                        '[' || chr(0x064B) || '-' || chr(0x065F) || chr(0x0670) || ']', '', 'g'
                      ),
                      '[' || chr(0x200B) || chr(0x200C) || chr(0x200D) || chr(0x200E) || chr(0x200F) ||
                        chr(0x202A) || chr(0x202B) || chr(0x202C) || chr(0x202D) || chr(0x202E) ||
                        chr(0xFEFF) || ']', '', 'g'
                    ),
                    chr(0x0622), chr(0x0627)
                  ),
                  chr(0x0623), chr(0x0627)
                ),
                chr(0x0625), chr(0x0627)
              ),
              chr(0x0649), chr(0x064A)
            ),
            chr(0x0629), chr(0x0647)
          ),
          '‐‑‒–—―',
          '------'
        ),
        '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹',
        '01234567890123456789'
      ),
      '\s+',
      '',
      'g'
    )
  ),
  ''
)
$function$;
