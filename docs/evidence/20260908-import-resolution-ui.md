# Import Resolution Review UX — 2026-09-08

## Closure
The import product now has a dedicated review surface for governed row-resolution outcomes:

- `new` — eligible for canonical persistence after server validation.
- `skip_exact` — exact duplicate; never silently merged.
- `candidate_duplicate` — likely duplicate; explicit review required.
- `conflict` — materially different existing record; blocked from persistence.

The component is intentionally presentation-only. It does not grant write authority. Durable authorization remains in the tenant-bound Supabase governed write gate.

## Evidence
- UI commit: `33870e825ca2617a129bec1c66da7220ff57faf3`
- Resolver/writer commit: `ebcadf61418995fe03a47a4bd0ddc8bd3804b11c`
- Server gate verification: `SECURITY INVOKER`, `anon=false`, `authenticated=true`, server duplicate gate and batch duplicate gate enabled.

## Non-claims
This closes the reusable review surface, not authenticated browser E2E certification. A production deployment is not certified by this document.
