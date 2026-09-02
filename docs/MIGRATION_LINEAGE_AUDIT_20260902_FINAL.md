## Final audit boundary
The authoritative runtime database ledger is the Supabase `schema_migrations` table exposed through the project migration listing. Repository filenames are source identities; the live remote version may be a deployment-time identity. Parity therefore requires a canonical mapping, not a timestamp-prefix comparison.

The current audit does not certify parity and does not change `main`. Production certification remains blocked until the mapping is implemented and the exact-head preview migration gate passes.
