# Report Advisor — Free-First / No Paid Fallback Policy

**Status:** Mandatory product and engineering policy  
**Effective:** 2026-08-25

## Purpose

Report-Advisor must preserve every existing capability while remaining usable without mandatory payment to any third party. Cost must never silently become a runtime requirement.

## Non-negotiable rules

1. Core application functionality MUST work without a paid provider, subscription, API key, credit card, or paid SaaS account.
2. No paid AI API may be a mandatory dependency for analytics, reports, recommendations, document processing, or ChatBI.
3. No silent paid fallback is permitted. Provider routing must never automatically switch from a free/local path to a paid provider in order to recover from an error.
4. AI is advisory only. Deterministic application logic remains usable when AI is unavailable.
5. Local/open-source/browser-native/free-compatible implementations are preferred for core functionality.
6. Ollama/local models may be used where appropriate, but Ollama itself must remain optional for deterministic core operation.
7. Optional paid integrations may exist only when explicitly requested by the user, clearly labelled `OPTIONAL / PAID`, disabled by default, and isolated behind a provider interface.
8. A paid integration must never be the only implementation of a core feature.
9. No feature may be removed merely to avoid implementation complexity or cost. Default decision is **KEEP + IMPROVE**.
10. New dependencies require an anti-bloat and anti-cost review covering necessity, license, local/free alternative, operational impact, failure mode, and preservation of existing features.
11. Missing provider capability must produce an explicit safe state such as `UNAVAILABLE`, `UNKNOWN`, or `INSUFFICIENT_EVIDENCE`; it must never fabricate a successful result.
12. Business numbers and financial truth must never depend on an LLM or a paid AI provider.

## Core free/local acceptance surface

The following must have a free/local path:

- Excel/CSV import and export.
- PDF and document inspection.
- OCR/document intelligence where applicable.
- Deterministic normalization, mapping, reconciliation, and validation.
- Semantic metrics and reports.
- Inventory, demand, customer, supplier and decision analytics.
- Evidence and lineage.
- Recommendations and alerts.
- Forecasting calculations and diagnostics.
- Scenario/what-if calculations.
- Audit and governance.
- Core ChatBI operation when AI assistance is available locally; deterministic query/report functionality must remain usable without hosted paid AI.

## Provider behavior

Every provider adapter must expose its capability and availability state. Routing must distinguish at least:

- `AVAILABLE_FREE_LOCAL`
- `AVAILABLE_OPTIONAL_EXTERNAL`
- `UNAVAILABLE`
- `BLOCKED_BY_POLICY`
- `INSUFFICIENT_EVIDENCE`

A provider outage must not cause an invisible paid escalation.

## Verification requirements

Before a capability is marked `COMPLETE`, applicable verification must demonstrate that the core path does not require a paid third party. Static policy text alone is insufficient; relevant runtime/CI evidence must be recorded in the execution ledger.

## Forbidden regressions

Do not reintroduce:

- Lovable AI gateway as a required path.
- The removed `/api/chat` hosted gateway path as a required path.
- Mandatory OpenAI/Anthropic/Gemini or other paid hosted AI APIs.
- Paid OCR/document APIs as the only extraction route.
- Paid analytics/dashboard SaaS as a runtime dependency.
- Hidden billing checks that disable core functionality.
- Silent paid-provider fallback.

## Relationship to the execution index

This document supplements `docs/MASTER_EXECUTION_INDEX.md` and `docs/MASTER_PRODUCT_REFERENCE.md`. If another implementation choice conflicts with this policy, the implementation must be redesigned or explicitly classified as an optional paid adapter; it must not become a mandatory core dependency.
