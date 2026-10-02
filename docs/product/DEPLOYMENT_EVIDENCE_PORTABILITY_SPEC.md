# NASR CAPTAIN — DEPLOYMENT EVIDENCE PORTABILITY SPEC
## Date
2026-10-02

## Problem
إثبات المنتج يجب ألا يتوقف لأن مزود نشر واحد وصل إلى rate limit أو فشل نشره. يجب فصل:

`CODE` → `BUILD` → `DEPLOYMENT` → `RUNTIME PROOF`

بحيث يكون runtime evidence مرتبطًا بالـSHA الفعلي، لا باسم مزود بعينه.

## 1. Runtime Evidence Contract
كل runtime proof يحمل:

`EXPECTED_SHA`
`ACTUAL_DEPLOYMENT_SHA`
`DEPLOYMENT_ID`
`ENVIRONMENT`
`PROVIDER`
`CHECKED_AT`
`HEALTH_STATUS`
`RESULT`

ولا يُقبل `HTTP 200` منفردًا عندما تكون deployment identity جزءًا من القاعدة.

## 2. Provider strategy
### Primary free proof path
Netlify:
- PR Deploy Previews are automatically generated from connected repositories.
- Deploy Preview URLs are stable for the pull request.
- Netlify Functions deploy with the site and have versioned immutable deployments.

Official documentation checked 2026-10-02:
- Netlify Deploy Previews.
- Netlify Functions.

### Secondary independent proof path
Cloudflare:
- Pages supports GitHub-integrated preview deployments.
- Worker/Pages previews can isolate branch changes.
- Worker Previews provide branch-specific configuration/secrets/observability.

Official documentation checked 2026-10-02:
- Cloudflare Pages Git integration and Preview Deployments.
- Cloudflare Worker Previews.

### Backend-adjacent fallback
Supabase Edge Functions:
- functions can be deployed independently through CLI/API;
- deployment can be automated through GitHub Actions;
- useful for backend/runtime probes that should not depend on the web host.

## 3. Anti-coupling rule
No single provider is the definition of “runtime exists”.

The certification layer should accept a provider that satisfies:

`EXACT SHA`
+`DEPLOYMENT ID`
+`REAL HEALTH`
+`REAL ACTION`
+`READBACK`

while retaining provider identity for audit.

## 4. Practical consequence for Report-Advisor
When Vercel is rate-limited:
1. do not create another Vercel workaround patch unless the workflow contract itself is defective;
2. publish/verify the exact execution SHA on Netlify or Cloudflare;
3. run the same browser/runtime proof against that exact deployment;
4. store provider + deployment identity in the evidence artifact;
5. keep production certification separate from preview certification.

## 5. Acceptance
A release proof must remain valid when the hosting provider changes, provided all identity and runtime invariants remain true.

The proof format is provider-neutral:
`SHA → DEPLOYMENT → RUNTIME → ACTION → READBACK`.

## 6. Product value
This reduces deployment-provider lock-in and prevents infrastructure availability from being confused with product correctness.
