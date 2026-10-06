SESSION HANDOFF = READY
REPORT_FOR_HEAD = 09d393fd5e187e646690610c294c7d31c55109aa
UPDATED_AT = 2026-10-06T06:10:00+03:00
BRANCH = feat/calculation-capability-engine-20261006
PR = #850
BASE = a6d034e05172189d278e689eb01a0c86454f529e
CURRENT_PRODUCT_CODE_HEAD = 09d393fd5e187e646690610c294c7d31c55109aa
CURRENT_BRANCH_HEAD_AT_REPORT_GENERATION = fe5f041a012b0155c1c8e7867ea5c8f67670d1aa

WHAT_I_WAS_ASKED_TO_DO = Repair the exact-head calculation capability branch without rebuilding the product; restore the browser harness; retain calculation/evidence lineage during REVIEW_REQUIRED; expose real kernel intelligence; prove Smart Report, Decision, Work, Outcome/Learning, 48/48 and deployed runtime with exact-head evidence.
WHAT_I_ACTUALLY_DID = Restored the truncated Full Product Browser E2E harness from parent 56b323620c4abc64c0ee179c32dec3b441e7df75 and preserved only the current_company_id Smart Report auth/bootstrap settlement exception. Fixed the settlement TDZ. Removed the calculation-persistence gate on SUPPORTED so calculations remain persisted/readable under REVIEW_REQUIRED. Added a customer-visible Kernel Decision Surface to Smart Report and browser assertions for source-bound stock, demand, coverage, review state, anomaly/scenario/sensitivity counts. Converted real 48-source preflight into explicit runtime outcome states and made the exact-head 48/48 evidence matrix blocking on completeness/lineage while preserving non-supported states as explicit evidence. Synchronized session governance to the current product code head.
WHAT_IS_PROVEN = Direct Supabase canonical-source recomputation for تقارير ادارية.xlsx proves 332 rows, stock 23075, demand 324250, baseline coverage 0.07116422513492675405 and demand+15% coverage 0.06188193489993630787. Evidence Passport for job 16709d80-e012-40ef-9c12-6fd8255897f8 and source hash sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313 is VERIFIED/READY/ACCEPTED with evidence snapshot 01e41830-fa44-41a3-9790-cb5cd8202d6a. Prior exact product runtime data also records anomalies=3, scenarios=1, sensitivity=2 and Kernel status REVIEW_REQUIRED.
FIRST_ACTIVE_FAILURE = The previous Full Product Browser E2E harness failed with SyntaxError at line 708 because the tail of scripts/run-full-product-browser-e2e.mjs had been deleted in 428a7cd4.
ROOT_CAUSE = Accidental tail deletion plus a later TDZ introduced while making current_company_id bootstrap settlement non-blocking.
REPAIR_PROOF = Full harness restored from 56b32362; TDZ corrected on the same execution path; no browser assertions or result/final-status logic were removed.
TRUST_PROOF_RULE = Runtime trust must be derived from a lineage-matching Evidence Passport when effective renderedOutput trustState is absent; contradictions remain REVIEW/PENDING/BLOCKED, never synthetic TRUSTED.
PERSISTENCE_PROOF_RULE = calculation persistence/readback no longer depends on archetypeRun.state === SUPPORTED.
REAL_48_PROOF_RULE = Every one of the 48 archetypes must yield an exact-head matrix row with an explicit runtime state and lineage; NOT_PROVEN requires a reason, supported/review/insufficient/blocked require source/job/evidence lineage. Registry presence alone is insufficient.
CURRENT_VALIDATION = The exact product code head is 09d393fd5e187e646690610c294c7d31c55109aa. GitHub Actions are currently queued/pending on this head; no final CI PASS is claimed. Product Build Gate, Quality, Device-Independent Browser E2E, Full Product Browser E2E, Session Handoff and Final Certification are not yet proven on this exact head.
DEPLOYED_RUNTIME = Public PR preview was previously verified to expose aghbari-source-sha matching earlier exact heads; final 09d393fd runtime SHA revalidation is pending.
DECISION_WORK_OUTCOME = The existing real-business-e2e.mjs contains source-bound Decision→Approval→Work→Outcome proof with tenant/evidence/audit checks; exact-head execution is pending. Learning/Benchmark final evidence remains pending until the current exact-head business artifact is consumed.
PRODUCT_COMPLETE = NO
SALE_READY = NO
NEXT_EXACT_ACTION = Consume the first exact-head CI/browser/certification failure or PASS on 09d393fd5e187e646690610c294c7d31c55109aa. On failure, fix only the first proven failure and rerun; on PASS, consume result.json and screenshots, then certify 48/48, Decision→Work→Outcome/Learning, deployed SHA and customer-visible browser proof.