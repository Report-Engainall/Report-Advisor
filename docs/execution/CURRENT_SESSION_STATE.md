SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT_EXACT_HEAD = 211c1a18a97cb9fa06776dc1b8745af35e79dc94
CURRENT_EXACT_PRODUCT_HEAD = 211c1a18a97cb9fa06776dc1b8745af35e79dc94
CURRENT_MAIN_HEAD = a6d034e05172189d278e689eb01a0c86454f529e
CURRENT_EXECUTION_HEAD = 211c1a18a97cb9fa06776dc1b8745af35e79dc94
BRANCH = feat/calculation-capability-engine-20261006
CURRENT_PR_HEAD = 211c1a18a97cb9fa06776dc1b8745af35e79dc94
PR = #850
PR_BASE = a6d034e05172189d278e689eb01a0c86454f529e

WHAT_ACTUALLY_HAPPENED
- Added Aghbari Intelligence Kernel above the existing Calculation Capability Registry.
- Wired kernel computation into Smart Report with explicit provenance and fail-closed quality/unknown states.
- Separated kernel compilation into findings/risks/signals/recommendations so runReportArchetype consumes precomputed intelligence rather than recomputing it.
- Added contract coverage for Kernel -> integration -> runReportArchetype.
- Fixed CI Node ESM compatibility with explicit canonical-schema.ts import.
- Separated live real-source proof from offline certification check scripts.
- Lazy-loaded DashboardPage to reduce critical initial assets without weakening the performance gate.

REAL_SOURCE_PROOF
- Source = تقارير ادارية.xlsx
- reportExecutionJobId = 16709d80-e012-40ef-9c12-6fd8255897f8
- sourceHash = sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313
- rows = 332
- qualityScore = 98
- stock = 23075
- demand = 324250
- baselineCoverage = 0.0711642251
- demandPlus15Coverage = 0.0618819349
- anomalyCount = 3
- scenarioCount = 1
- sensitivityCount = 2
- kernelStatus = REVIEW_REQUIRED
- blindSpot = monetary inventory value unavailable; no financial value fabricated

LOCAL_EVIDENCE
- typecheck = PASS
- production build = PASS
- performance budget = PASS at critical=863.0KB (limit 900KB)
- executive visual contract = PASS
- Kernel contract incl. Smart Report wiring = PASS
- git diff --check = PASS

OPEN_GATES
- Exact-head Full Product Browser E2E run 8547.
- Exact-head Final Certification run 17327.
- real-source 48/48 matrix runtime proof = NOT_PROVEN.
- final customer-visible Smart Report browser proof = NOT_PROVEN.

NEXT_EXACT_ACTION = Consume Browser E2E 8547 and Final Certification 17327 for this exact head; fix only the first newly proven failure, then prove 48/48 and final certification.
