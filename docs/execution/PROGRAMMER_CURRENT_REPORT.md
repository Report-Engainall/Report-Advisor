SESSION HANDOFF = READY
REPORT_FOR_HEAD = b0c023b7e69d1d34e904094f6ac3537dbafd0abf
UPDATED_AT = 2026-10-06T06:48:00+03:00
BRANCH = feat/calculation-capability-engine-20261006
PR = #850
BASE = a6d034e05172189d278e689eb01a0c86454f529e
CURRENT_PRODUCT_CODE_HEAD = 16f23f2724c7e570b24a7e46680a6aed558a9886
CURRENT_BRANCH_HEAD_AT_REPORT_GENERATION = acb3a4d03bf6d3237d8fb5dc6975a831ab3dcb81

WHAT_I_WAS_ASKED_TO_DO = Repair the exact-head calculation capability branch without rebuilding the product; restore the browser harness; retain calculation/evidence lineage during REVIEW_REQUIRED; expose real kernel intelligence; prove Smart Report, Decision, Work, Outcome/Learning, 48/48 and deployed runtime with exact-head evidence.
WHAT_I_ACTUALLY_DID = Restored the truncated Full Product Browser E2E harness from parent 56b323620c4abc64c0ee179c32dec3b441e7df75 and preserved only the current_company_id Smart Report auth/bootstrap settlement exception; fixed its TDZ; separated calculation persistence from SUPPORTED; preserved source intelligence under REVIEW_REQUIRED; added the customer-visible Kernel Decision Surface and deterministic browser selectors; made the 48/48 source matrix exact-head and lineage-blocking; added Outcome→Learning and source-bound Benchmark proof; and corrected the real-open-report CI wiring so its resume proof uses actor C, whose membership is the certified f68a7e91 tenant.
WHAT_IS_PROVEN = Direct Supabase recomputation of تقارير ادارية.xlsx proves 332 rows, stock 23075, demand 324250, baseline coverage 0.07116422513492675405 and demand+15% coverage 0.06188193489993630787. Evidence Passport for job 16709d80-e012-40ef-9c12-6fd8255897f8 and source hash sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313 is VERIFIED/READY/ACCEPTED with evidence snapshot 01e41830-fa44-41a3-9790-cb5cd8202d6a. The separate open report d074ad5c-70d4-4402-a763-01129786f392 is completed/rendered with 6776 canonical rows, matching import and analyzed source snapshot.
FIRST_ACTIVE_FAILURE = Full Product Browser Resume failed because the resume actor was bound to Smart Report tenant 99e33354 while the open report job belongs to f68a7e91; the source data itself was healthy.
ROOT_CAUSE = Actor C is intentionally defaulted to the certified Smart Report company 99e33354. Reusing C for the open report was a tenant-context error. The fix creates actor D and derives D's default tenant from OPEN_REPORT_EXECUTION_JOB_ID itself.
REPAIR_PROOF = b0c023b7 adds dedicated actor D, derives its tenant from the exact open report job, validates sourceHash binding, provisions D as default for that tenant, and wires Resume to D credentials.
TRUST_PROOF_RULE = Runtime trust must be derived from a lineage-matching Evidence Passport when effective renderedOutput trustState is absent; contradictions remain REVIEW/PENDING/BLOCKED, never synthetic TRUSTED.
PERSISTENCE_PROOF_RULE = calculation persistence/readback no longer depends on archetypeRun.state === SUPPORTED.
REAL_48_PROOF_RULE = Every one of the 48 archetypes must yield an exact-head matrix row with an explicit runtime state and lineage; NOT_PROVEN requires a reason, supported/review/insufficient/blocked require source/job/evidence lineage. Registry presence alone is insufficient.
CURRENT_VALIDATION = Prior c7 Browser run proved 48/48 runtime PASS and failed only at Resume due tenant actor binding. b0c023b7 fixes that wiring; exact-head re-run pending.
DEPLOYED_RUNTIME = Netlify preview 6ac46a30c857e90008c4220e is READY for 16f23f2724c7e570b24a7e46680a6aed558a9886. PC01 Edge verified the preview DOM source SHA, Arabic RTL shell and product title for that exact code head.
DECISION_WORK_OUTCOME = Contract/E2E paths exist for Decision→Approval→Work→Outcome and now classify Outcome→Learning without inventing impact; exact customer-run evidence is still pending.
PRODUCT_COMPLETE = NO
SALE_READY = NO
NEXT_EXACT_ACTION = Consume the b0c023b7 exact-head Full Product Browser E2E. First failure only -> repair -> rerun. On Resume PASS, consume Smart Report refresh/readback, Decision→Approval→Work→Outcome→Learning, Benchmark, exact-head 48/48 matrix, and final certification/deployed SHA proof.