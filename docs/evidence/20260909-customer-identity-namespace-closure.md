# Customer Identity Namespace Closure

Date: 2026-09-09
Branch: `fix/folder-sync-universal-persistence`

## Finding closed

The governed customer identity model distinguishes two namespaces:

- `customer_code:<normalized code>` when a code exists;
- `customer_name:<normalized name>` only when code is absent.

The client-side universal resolver previously returned only the normalized value. That could make a coded customer whose code matched an uncoded customer's name appear to share the same identity key during in-batch resolution.

## Fix

`src/lib/file-engine/universal-intelligence.ts` now namespaces customer identity keys exactly at the resolution boundary. This keeps the client resolver aligned with the governed server identity semantics already established for customer imports.

The existing `seenIncoming` map continues to detect duplicate/conflicting rows inside the same import batch before they reach the writer.

## Contract

`scripts/customer-identity-namespace-contract.mjs` locks the namespace, precedence, in-batch detection, and server-preview separation requirements.

The contract script is committed but a local runtime execution is not claimed in this turn because no local shell runner is available through the connected GitHub interface.

## Nonclaims

No authenticated browser E2E, live Tenant A/B adversarial test, Production Runtime certification, backup/restore certification, rollback certification, or Frozen RC mutation is claimed.
