# Gross Profit Truth Execution Ledger

Base SHA: `f5c706c40feb433a80f871476a6de5ca9ef63163`

Root cause: divergent revenue bases — canonical `SUM(sale_items.line_total)` versus consumer use of `sales_invoices.subtotal`.

Commits on exact-f5 descendant:
- `67139848b3bf3ff07dc19f1144de031fe9e51af2` canonical financial boundary
- `a68f5a8ae9b2b3e05964f33c94ec5c6ee792a572` canonical dashboard query consumers
- `8df511973b3692b3bd94d16d3c0330ec54a19ab5` Dashboard migration
- `049e38eea89e5a6c877346d5fa4df998467000df` semantic net-sales alignment
- `a96a43faf3637c760bf7a32d79d40f6be032b0f5` consumer regression gate
- `3b5e907ffcb969894723998152328f8df575342f` package contract preserved + gate registered
- `0fa6679a9124358a10bc306f8b3aba017b659629` Financial Truth Matrix

Proof state: FIXED IN BRANCH, REGRESSION-ENFORCED IN BRANCH. Exact-head CI, cross-surface execution, runtime and production evidence are still required.
