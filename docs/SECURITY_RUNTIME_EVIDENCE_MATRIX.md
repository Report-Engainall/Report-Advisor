# Security Runtime Evidence Matrix

| Surface | Required adversarial proof | Status |
|---|---|---|
| Tenant A → Tenant B rows | Authenticated session, direct table/query attempt | PENDING LIVE |
| Tenant B → Tenant A rows | Authenticated session, direct table/query attempt | PENDING LIVE |
| company_id tampering | Client-supplied alternate tenant id | PENDING LIVE |
| Tenant-scoped RPC | Direct RPC with foreign tenant object/id | PENDING LIVE |
| Storage | Foreign tenant object/path read/write attempt | PENDING LIVE |
| Realtime | Foreign tenant channel/event subscription attempt | PENDING LIVE |
| Internal route | Direct URL to another tenant resource | PENDING LIVE |
| Session refresh | Expiry/refresh and post-refresh tenant context | PENDING LIVE |
| Role boundary | Unauthorized role attempts privileged operation | PENDING LIVE |

## Acceptance rule
A structural RLS policy check is not a live certification. PASS requires authenticated A/B evidence against the deployed target environment and direct RPC/storage/realtime attempts where those surfaces are enabled.

## Data truth rule
Security evidence must never be manufactured by inserting fake business facts. Test-only identities and isolated test fixtures are acceptable only when explicitly marked as such and never represented as production business data.
