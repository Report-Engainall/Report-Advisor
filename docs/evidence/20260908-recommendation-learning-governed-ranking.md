# Recommendation Learning — Governed Ranking

Date: 2026-09-08
Branch: `fix/folder-sync-universal-persistence`

## Closure delivered

The recommendation layer now has a governed learning-ranking primitive. Historical decision/recommendation outcomes may influence ordering only when the attributable sample reaches the minimum threshold of 3 observations.

- Positive signal: bounded `+0.15` ranking adjustment.
- Negative signal: bounded `-0.15` ranking adjustment.
- Mixed/insufficient/unavailable: `0` adjustment.
- Original recommendation fields remain intact; learning metadata is additive.
- Ranking tie-breakers remain deterministic through expected impact and title.
- No source-of-truth business data is rewritten.
- No policy/model is automatically mutated.

## Database boundary

Staging now exposes `public.get_governed_recommendations(integer)` as `SECURITY INVOKER`, tenant-scoped through `current_company_id()`, with `authenticated` execution only. `anon` and `public` execution are revoked.

The direct SQL verification correctly failed with `TENANT_REQUIRED` because the SQL execution context has no authenticated tenant; the function catalog verification confirms `SECURITY INVOKER` and authenticated-only ACL. This is an environment limitation, not a claimed authenticated runtime PASS.

## Alternatives boundary

The existing alternative-item model is present in Staging (`alternative_item_groups` / `alternative_item_group_members`). This batch deliberately does not rewrite alternative master data. Learning remains an advisory ranking signal until an authenticated runtime path supplies attributable recommendation/decision context.

## Certification boundary

This is source/database implementation evidence only. It does not certify browser E2E, production runtime, live tenant isolation, backup/restore, rollback, or Vercel preview.
