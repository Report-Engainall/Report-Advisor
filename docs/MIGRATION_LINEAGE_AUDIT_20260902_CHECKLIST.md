# Migration Lineage Audit Checklist

- [x] Snapshot remote applied migration ledger
- [x] Isolate audit branch from current main
- [x] Inspect PR #304 changed-file boundaries
- [x] Extract canonical SQL for four recovered migrations
- [ ] Build repository filename ↔ remote version/name mapping
- [ ] Verify no semantic duplicate would replay on a fresh database
- [ ] Fix the migration parity gate itself if it incorrectly equates source timestamps with remote version identities
- [ ] Re-run exact-head Supabase Preview after a safe parity fix
