# Upwork Bid Engine — Evidence-First Commercial Operating Procedure
## 2026-09-18

## 1. Mission
تحويل البحث عن العمل من إرسال عروض عامة إلى نظام:
**DISCOVER → SCREEN → FIT-MAP → PROOF-MAP → GAP-MAP → OFFER → DEMO → PROPOSAL → FOLLOW-UP → INTERVIEW → DELIVERY → OUTCOME → PORTFOLIO → LEARNING**

## 2. Opportunity Record
كل وظيفة مرشحة تحتوي:
- opportunity_id
- source_url
- title
- client_context
- requirements
- stack
- business_problem
- deadline
- budget
- delivery_risk
- fit_class
- proof_coverage
- expected_effort
- offer_angle
- demo_sequence
- proposal_status
- outcome

## 3. Fit Classes
- **PROVEN_MATCH**: capability + current evidence.
- **DEMO_MATCH**: capability available in product/demo, runtime proof incomplete.
- **PROOF_GAP**: likely fit but evidence missing.
- **PRODUCT_GAP**: requires capability not currently in product.
- **DELIVERY_GAP**: technically possible but delivery constraints are not currently credible.
- **LOW_FIT**: weak alignment.

No class may be silently promoted.

## 4. Job Scoring Model
استخدم scoring كأداة داخلية، وليس كحقيقة موضوعية:
- Problem fit: 0–25
- Capability fit: 0–20
- Proof coverage: 0–20
- Delivery confidence: 0–15
- Commercial value: 0–10
- Strategic learning value: 0–10

Before spending proposal effort, record the reasons behind the score.

## 5. Proof Map
لكل requirement:
1. requirement text
2. mapped capability
3. product route
4. evidence passport
5. exact-head proof
6. known limitations
7. demo asset
8. claim-safe wording

If no evidence exists: mark Proof Gap.

## 6. Proposal Architecture
### Variant A — Business outcome
Problem → impact → approach → proof → delivery → next step.

### Variant B — Technical
Architecture/problem → relevant controls → evidence → implementation plan → risk controls.

### Variant C — Security
Tenant isolation → RLS/RBAC → denial path → audit trail → verification.

### Variant D — Data / Import
Source → extraction → validation → reconciliation → canonical data → report.

## 7. Demo Sequence
Recommended default:
1. Client problem statement
2. Evidence / Trust state
3. Relevant live product surface
4. Decision/result
5. Action workflow
6. Known limitation
7. Expected next step

Do not open unrelated product pages.

## 8. Proof Strength
Badge every commercial claim:
- PROVEN
- DEMO
- PARTIAL
- BLOCKED

Proposal copy must be generated from this state.

## 9. Commercial Checks
Before sending:
- Is this real fit?
- Is evidence current?
- Is scope explicit?
- Are assumptions explicit?
- Is delivery boundary credible?
- Are any claims stronger than evidence?
- Does the requested work justify the effort?
- Is a reusable product/portfolio artifact likely?

## 10. Interview Preparation
Generate a compact pack:
- client problem
- proposed architecture
- relevant proof
- open questions
- implementation phases
- acceptance criteria
- risks
- fallback plan

Never invent experience.

## 11. Delivery-to-Portfolio Loop
After a completed job:
1. verify result
2. capture permission/redaction state
3. record outcome
4. extract reusable capability
5. update playbook
6. update portfolio proof
7. update Bid Engine patterns

## 12. Proposal Feedback Loop
Record:
- seen/replied
- interview
- declined
- hired
- reason when known
- fit class
- proof gap
- pricing/scope issue
- proposal variant
- reusable learning

Do not infer a reason when unknown.

## 13. Opportunity Economics
For each opportunity estimate:
- reading/research effort
- proposal effort
- demo preparation effort
- expected delivery effort
- integration uncertainty
- probability of reuse of resulting work
- strategic value

These are internal planning estimates, not guarantees.

## 14. Anti-Spam Rules
- No generic proposal blast.
- No portfolio links unrelated to the problem.
- No fabricated numbers.
- No invented client references.
- No claim of production certification from local build evidence.
- No copying client proprietary requirements/code/assets beyond permitted use.
- No use of secret tenant data in demos.

## 15. Product Feedback Loop
When the same high-value Proof Gap appears repeatedly:
- create a product requirement candidate;
- run Product Value Gate;
- reject if it causes architecture duplication or weakens the product identity;
- accept only when it improves reusable product capability.

## 16. Commercial Artifact Types
The system should produce reusable:
- job fit brief
- evidence map
- demo sequence
- proposal draft
- interview pack
- implementation plan
- acceptance criteria
- case study
- portfolio card
- postmortem
- playbook update

## 17. Leadership Principle
The Bid Engine is not a sales script.
It is a **commercial control plane** that prevents the team from selling capabilities it cannot prove and prevents the product team from chasing every market trend.

## 18. Completion
Bid Engine is operationally complete only when:
- opportunity schema exists
- proof states exist
- proposal variants exist
- demo path exists
- feedback loop exists
- portfolio update path exists
- claims remain fail-closed
- latest Exact-HEAD evidence is discoverable
