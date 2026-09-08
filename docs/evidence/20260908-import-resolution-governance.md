# Universal Import Resolution Governance — 2026-09-08

## Closure

Universal row analysis now has an explicit non-destructive resolution policy before durable writes.

| Source outcome | Governed action | Write allowed |
|---|---|---|
| `new` | `write_new` | yes |
| `skip_exact` | `skip_exact` | no |
| `candidate_duplicate` | `review_duplicate` | no |
| `conflict` | `review_conflict` | no |

## Safety contract

- Exact duplicates cannot create a second row through this policy.
- Candidate duplicates never become writes automatically.
- Conflicts never become writes automatically.
- A write is allowed only for a row classified as genuinely new by the current deterministic comparison boundary.
- This module does not mutate the database and does not grant approval to bypass existing tenant/RLS/import RPC controls.

## Evidence boundary

Implementation SHA: `c82e55a67b2f6717b2a389501385abbeea0a0bb8`.

The policy is source-level governance. It is not authenticated E2E, live Tenant A/B isolation, production certification, or proof that every downstream writer consumes this policy. Downstream wiring remains an explicit closure item.
