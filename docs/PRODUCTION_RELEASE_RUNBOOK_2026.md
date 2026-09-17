# Report-Advisor Production Release Runbook — 2026

## Release candidate

- Validated exact SHA: `b3f447ec14e10e4ab81a842738a79d6246d0da90`
- Validated deployment: `dpl_2WYqjGjD3GV253QdpwCxAZTfjdmz`
- Current production deployment before promotion: `dpl_6eHpunMgga8a64uUGekrV3LXZz79`

## Promotion

Promote the already validated deployment. Do not rebuild and do not create a second deployment.

```bash
vercel promote dpl_2WYqjGjD3GV253QdpwCxAZTfjdmz --yes
```

The promotion target must remain the existing validated deployment. If the CLI version does not support `--yes`, use the equivalent interactive `vercel promote` command without creating a new deployment.

## Production verification

Immediately after promotion verify:

1. The production alias resolves to the promoted deployment.
2. Deployment state is `READY`.
3. GitHub SHA equals `b3f447ec14e10e4ab81a842738a79d6246d0da90`.
4. `https://report-advisor.vercel.app/` returns HTTP 200.
5. Production runtime errors remain clear during the stabilization window.
6. Authenticated login succeeds.
7. Current tenant resolves correctly.
8. Dashboard loads canonical KPIs.
9. A real business mutation persists and reads back.
10. Financial readback matches canonical persisted data.
11. Alerts load successfully.
12. Reports load from the authoritative reporting path.

## Post-release smoke

```text
Production
→ Login
→ Tenant resolution
→ Dashboard
→ Business action
→ DB persistence
→ Financial readback
→ Alerts
→ Reports
```

The previously observed `AppShell → Failed to load alerts` is a transient observation until reproduced. Do not add a code change solely for a non-reproducible occurrence.

## Failure protocol

```text
FIRST FAILURE
→ capture exact deployment and timestamp
→ reproduce
→ determine transient/session/network/backend/application cause
→ minimal fix only when proven
→ fresh exact-SHA evidence
→ re-promote only the newly validated deployment
```

## Rollback

Rollback must target a previously verified production deployment. Never roll back by rebuilding from source during an incident.

```bash
vercel rollback <known-good-production-deployment-id-or-url>
```

After rollback repeat production HTTP, authentication, tenant, dashboard, business readback, alerts, and runtime-error checks.
