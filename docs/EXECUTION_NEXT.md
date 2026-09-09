# Execution Next — 2026-09-09

Continue without waiting for Vercel rate-limit recovery:

1. Inspect the existing import implementation and its actual database RPCs before adding wrappers.
2. Run real-document ingestion against the existing boundary; do not invent RPC names or seed business rows.
3. Use the real Arabic PDF corpus and any operator-provided Excel/CSV/PDF files as source artifacts.
4. Capture SHA-256, extraction mode, DQS, mapping, commit/idempotency and evidence.
5. In parallel, execute authenticated Tenant A/B adversarial checks against staging/local Supabase where access is available.
6. Extend decision work execution into employee workload and outcome evidence only through existing verified boundaries.
7. Keep Vercel deployment rate-limit as an infrastructure gate, not as a reason to stop code-level verification.
