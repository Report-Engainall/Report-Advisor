# CYCLE-006 — decision/recommendation link authorization boundary

Start main SHA: `76f8f6bc174838dcd7ba95c17d2794a7816b1e14`

## Finding
Forensic comparison with PR #92 found that `src/lib/decision-automation/vertical-slice-runtime.ts` still performed direct UPDATEs on `recommendations` and `business_intelligence_decisions` when linking them. PR #92 contained the safer RPC-only boundary, but that useful delta had not reached current main.

## Live proof
Supabase live catalog confirms `link_recommendation_to_decision(uuid,uuid)` exists as SECURITY DEFINER, fixed `search_path=public`, with anon EXECUTE=false and authenticated EXECUTE=true. Its live definition derives tenant authority from `current_company_id()` and rejects cross-tenant/missing references before updating either row.

## Fix
Replaced both direct lifecycle UPDATEs with the canonical tenant-bound RPC call. Added `scripts/check-decision-link-rpc-boundary.mjs` and wired it into the existing `batch-integrity-guards` workflow.

## Classification
IMPLEMENTED on branch; runtime behavior of the application call path still requires fresh authenticated runtime proof. This cycle does not claim production certification.
