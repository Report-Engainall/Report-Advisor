## Audit appendix

The Supabase remote migration ledger currently contains 125 applied versions. Several remote version timestamps are deployment-time identities that differ from the source migration filename timestamps. Therefore filename-prefix equality is not a valid parity rule by itself.

PR #304 was reviewed at file level. Its four recovered migrations have canonical SQL in that branch, but the PR also changes application code and an audit script. Whole-PR merge is rejected for the lineage-only objective.

The safe closure path is to map each remote `(version, name)` pair to exactly one repository migration file or to a documented canonical alias, then make the CI check compare canonical identity rather than raw timestamp prefix. Until that mapping is complete and replay-safe, Supabase Preview remains a legitimate blocker.
