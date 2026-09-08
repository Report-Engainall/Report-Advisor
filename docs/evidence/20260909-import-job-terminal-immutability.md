# Import Job Terminal Immutability — 2026-09-09

## Closure

The import job table is RLS-protected to the authenticated tenant, but authenticated users also have table UPDATE privilege. That means row-level security alone does not guarantee lifecycle integrity: a client could otherwise attempt to move a terminal job back to `processing` or `queued` through a direct update path.

A database trigger now closes that gap.

## Staging verification

Supabase Staging project: `fnqbvfuwbdpwvhcgzksl`

Verified:

- `public.import_jobs` has RLS enabled.
- `anon` has no INSERT/UPDATE/DELETE table privilege.
- `authenticated` is tenant-scoped by existing RLS policies.
- `trg_import_jobs_lifecycle_guard` exists and is enabled.
- `guard_import_job_lifecycle_update()` is `SECURITY INVOKER`.
- `anon` cannot execute the guard function; `authenticated` can.
- The guard rejects company/tenant changes.
- The guard rejects status changes once a job is `completed`, `partial`, `failed`, or `cancelled`.

## Boundary

This hardening does not replace `import_finish_job`; it adds a database-level invariant beneath it. It does not claim authenticated browser E2E or production certification.
