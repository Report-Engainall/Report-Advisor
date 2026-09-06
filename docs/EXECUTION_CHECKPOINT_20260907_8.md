# Execution Checkpoint — 2026-09-07 / Batch 8

## Protocol
`1` continued from the latest authoritative PR head. This batch expanded evidence across CI, Vercel, and live Supabase security/performance boundaries instead of repeating closed Worker source checks. Frozen historical RCs and production aliases were not mutated.

## Exact-head continuity
- PR: #348
- Branch: `fix/runtime-provenance-20260906`
- Authoritative checkpoint HEAD: `44b9831a49e000db3b2698415384ee9fcea1e086`
- Previous documented functional head: `e8b3d58ca5ea223f6cb290fd35ba47c3352d8e7d`

## CI recovery
- Current-head Quality run `34067492946` initially failed with a single `verify` job exposing zero steps and no log blob.
- That failed job was explicitly re-run; the new job `101578958569` is now queued.
- Immediate inspection confirms the rerun has not produced executable step/log evidence yet.
- The same zero-step failure pattern remains visible across the repository's other current-head workflows. No CI PASS or application-code root cause is claimed without executable evidence.

## Live Supabase security boundary
Fresh Security Advisor evidence on Staging project `fnqbvfuwbdpwvhcgzksl` was collected after the current remediation chain:
- `auth_leaked_password_protection` remains WARN/disabled.
- Multiple public SECURITY DEFINER functions remain executable by `authenticated`, including decision/recommendation/work-item RPCs.
- These are live control-plane/database findings and are not closed by source-only repository changes.
- Issue #354 was updated with the fresh evidence and remains OPEN because the connected tooling does not expose the required Auth control-plane mutation.

Fresh Performance Advisor evidence also reports many unused indexes, including several indexes introduced by recent tenant-FK hardening. These are INFO-level observations, not immediate correctness blockers; they will not be removed speculatively because usage statistics can change after workload activation.

## Current-head Vercel proof
Vercel deployment `dpl_AGRLcHsym1DTzp7ejPHysxdpZXkR` is READY and is bound to exact GitHub SHA `44b9831a49e000db3b2698415384ee9fcea1e086` on the active branch.

Executable build evidence:
- Vercel CLI 59.11.7
- dependency installation completed
- `npm run build`
- Vite 5.4.8 production build
- 2781 modules transformed
- build completed successfully in 11.45s
- deployment completed successfully
- largest listed JavaScript chunk: 495.64 KB, below the repository's 600 KB maximum chunk threshold

Non-fatal warnings remain for outdated Browserslist data, Bluebird `eval`, and pending npm install-script approvals for `esbuild`/`tesseract.js`.

Preview runtime logs for the deployment over the inspected one-hour window contain no error/warning entries.

## Release boundary
This establishes exact-head source -> Vercel deployment/build continuity and fresh live Supabase security observations. It does not certify authenticated browser behavior, Tenant A/B browser isolation, production runtime, backup/restore, rollback, OCR golden runtime, or live worker crash/recovery.

## Remaining high-value gates
1. Authenticated current-head Chromium business E2E and Tenant A/B adversarial browser proof.
2. Production runtime and business data-path evidence.
3. Fresh source-to-live migration parity evidence for the active candidate.
4. Arabic OCR/document golden-corpus runtime.
5. Production worker crash/retry/dead-letter/recovery.
6. Backup/restore with measured RPO/RTO and rollback drill.
7. Executable CI steps/logs and PASS.
8. Supabase Auth leaked-password protection enablement plus fresh post-change Advisor evidence.
9. Least-privilege closure for the remaining authenticated SECURITY DEFINER RPC warnings after confirming intended client/server call paths.

## Safety
- PR #348 remains open and unmerged.
- Frozen historical RCs untouched.
- Production aliases untouched.
- No operational certification claimed.

## Next execution point
Start from `44b9831a49e000db3b2698415384ee9fcea1e086`. First harvest the queued Quality rerun once it has executable steps/logs; in parallel, continue the remaining operational release gates without fabricating credentials, runtime evidence, or control-plane state.