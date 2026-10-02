# DEPLOYMENT EVIDENCE PORTABILITY — PRODUCT/RELEASE CONTRACT
## 2026-10-02

### Problem
Runtime certification must not become hostage to one hosting provider.

Separate:
`CODE → BUILD → DEPLOYMENT → RUNTIME PROOF`

### Provider-neutral runtime proof
Every deployment claim records:
`EXPECTED_SHA`
`ACTUAL_DEPLOYMENT_SHA`
`DEPLOYMENT_ID`
`ENVIRONMENT`
`PROVIDER`
`CHECKED_AT`
`HEALTH_STATUS`
`REAL_ACTION`
`READBACK`
`RESULT`

HTTP 200 alone is never sufficient when deployment identity is part of the release requirement.

### Current alternatives
**Netlify:** PR Deploy Previews are automatically generated from connected repositories; preview URLs remain tied to the PR/branch and can be used for review and validation.

**Cloudflare:** Pages supports Git-connected preview deployments, while current Workers Previews provide isolated, production-like branch environments with their own configuration and observability.

**Supabase Edge Functions:** independent edge deployment via CLI/API can be used for backend-specific runtime checks and CI/CD.

### Operational rule
When Vercel is unavailable because of rate limiting:
1. Do not create speculative Vercel patches.
2. Prove the exact execution SHA on an independent provider.
3. Run the same real browser/runtime journey.
4. Persist provider + deployment identity in the artifact.
5. Keep preview certification distinct from production certification.

### Acceptance
A valid runtime proof remains semantically valid when the provider changes, provided:

`EXACT SHA + DEPLOYMENT ID + REAL RUNTIME + REAL ACTION + READBACK`

all match.

### Product value
Removes infrastructure-provider availability from the definition of product correctness and strengthens release trust.
