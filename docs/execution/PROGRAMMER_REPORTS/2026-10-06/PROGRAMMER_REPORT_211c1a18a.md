# Programmer Report — 211c1a18a

REPORT_FOR_HEAD = 211c1a18a97cb9fa06776dc1b8745af35e79dc94
UPDATED_AT = 2026-10-06T03:40:00+03:00
BRANCH = feat/calculation-capability-engine-20261006
PR = #850
BASE = a6d034e05172189d278e689eb01a0c86454f529e

## Delivery
- Aghbari Intelligence Kernel computes source-bound truth/quality/statistics/anomaly/scenario/sensitivity/provenance.
- Kernel integration is compiled separately and passed into runReportArchetype().
- Smart Report computes the Kernel from canonical rows with tenant/job/source/evidence provenance.
- Offline certification no longer executes live real-source proof scripts.
- DashboardPage is lazy-loaded to keep critical initial assets under the existing 900KB gate.

## Evidence
Real source = تقارير ادارية.xlsx
Job = 16709d80-e012-40ef-9c12-6fd8255897f8
Source hash = sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313
Rows = 332
Stock = 23075
Demand = 324250
Baseline coverage = 0.0711642251
Demand +15% coverage = 0.0618819349
Kernel anomalies = 3
Scenarios = 1
Sensitivity = 2
Kernel status = REVIEW_REQUIRED

## Local gates
Typecheck = PASS
Build = PASS
Performance budget = PASS, critical 863.0KB <= 900KB
Executive visual contract = PASS
Kernel -> Smart Report contract = PASS

## Remaining
Browser E2E = NOT_PROVEN
Final certification = IN_PROGRESS
Real-source 48/48 = NOT_PROVEN
Product complete = NO
