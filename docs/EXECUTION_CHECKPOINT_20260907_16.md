# Execution Checkpoint — 2026-09-07 Batch 16

## Exact source boundary

- Branch: `fix/runtime-provenance-20260906`
- Starting exact HEAD: `df73b0cedb8b5ecc254f8927e87e6b27e82c3eba`
- Batch commits:
  - `fe6797ca9dfadf999536d97cf91026bb6c0aa5ac` — record live durable claim verification and update the master truth index.
  - this checkpoint commit follows on the same branch.

## Major execution result

The previously open live-application step for the durable worker claim hardening was executed against Staging project `fnqbvfuwbdpwvhcgzksl`.

### Live database evidence

- Forward migration applied successfully under migration record `20260907000717 / harden_report_execution_claim_token_20260907`.
- Canonical function exists as `claim_report_execution_job(uuid,uuid,text,integer)`.
- Return type is `jsonb`.
- `SECURITY DEFINER = true` with `search_path = pg_catalog`.
- `service_role_execute = true`.
- `authenticated_execute = false`.
- Canonical function definition was re-read successfully and contains:
  - explicit `p_company_id` validation;
  - explicit worker-owner validation;
  - minimum lease validation;
  - terminalization of expired final-attempt jobs to `dead_letter`;
  - atomic lease-token generation through `UPDATE ... RETURNING`;
  - return of the claimed row including the exact `lease_token`.

### Runtime boundary

The live table currently contains zero `report_execution_jobs` rows (`queued=0`, `leased=0`, `processing=0`, `dead_letter=0`). Therefore a real claim/heartbeat/checkpoint/complete/fail/retry lifecycle could not legitimately be exercised without manufacturing a business job. No synthetic PASS was claimed.

## CI / deployment evidence

- Fresh current-head CI fan-out for `7ed8b1dc...` remains non-diagnostic: Quality representative job completed `failure` with `steps=[]`, `runner_id=0`, and no executable command output.
- Vercel deployment `dpl_4NzGUFKuFua2FLQCYkjX1jxe6z8D` is `READY` and exactly bound to `7ed8b1dc...`; production build completed successfully in 12.00s.
- Source commits after `7ed8b1dc...` are not promoted to that deployment evidence.

## Important provenance caveat

The live Supabase migration history records the applied forward reconciliation as `20260907000717 / harden_report_execution_claim_token_20260907`, while the source migration file is timestamped `20260907000000_harden_report_execution_claim_token.sql`. This is an operational application-history difference that must be reconciled by the authoritative source/live parity gate; it is not silently declared exact parity.

## Safety boundaries

- Frozen historical RCs untouched.
- Production aliases untouched.
- No reset/rebase/merge/force movement.
- No fabricated worker lifecycle evidence.
- No production certification claimed.

## Net progress

Worker/report execution advanced from source-only hardening to a **live, privilege-verified claim contract**. The remaining worker blocker is now real lifecycle exercise plus production crash/recovery evidence, not migration application.

## Next execution point

Attack the next highest-value independent P0/P1 gate: authenticated A/B runtime when operational access permits; otherwise source/live migration parity, import/reconciliation adversarial runtime, OCR golden corpus, Windows watcher, backup/restore/rollback, and CI executable-run recovery in parallel without reopening closed findings.
