# Deep Closure Runtime Test Plans

These are executable evidence plans, not certifications. Until executed against a real environment, each remains **LIVE REQUIRED**.

## Inventory

1. Load a dataset larger than the configured page size.
2. Traverse multiple pages.
3. Compare displayed total/count against the canonical server response.
4. Verify browser-side pagination never becomes business truth.

## Receivables

1. Load more than one page of receivables.
2. Apply aging/date/status filters.
3. Compare report totals with the canonical source.
4. Include NULL/UNKNOWN/INSUFFICIENT_DATA cases.

## Tenant boundary

1. Authenticate as Tenant A.
2. Request a Tenant B resource by URL/body/query/job/cache identifiers.
3. Verify the request is rejected or returns no Tenant B data.
4. Repeat for read, write, aggregation, export, cache, event, and retrieval paths.

## Storage

1. Create an object owned by Tenant A.
2. Attempt direct access, signed URL use, replacement, metadata read, and deletion as Tenant B.
3. Verify every unauthorized operation fails.
4. Verify stale object references cannot cross tenant scope.

## Realtime

1. Subscribe Tenant A and Tenant B clients to the relevant channel/event.
2. Publish a Tenant A event.
3. Verify Tenant B receives no Tenant A payload.
4. Repeat after reconnect and with stale subscriptions.

## AI / Vector

1. Create and embed a Tenant A document.
2. Query as Tenant B with semantic similarity and metadata filters.
3. Verify Tenant A content is never retrieved.
4. Delete the document and verify stale embeddings/cache entries cannot be retrieved.

## Worker recovery

1. Start a job.
2. Execute its side effect.
3. Induce worker termination before checkpoint/completion.
4. Restart or redeliver.
5. Verify no duplicate durable effect and correct terminal/reconciliation state.
6. Repeat for lease expiration and duplicate delivery.

## Export

1. Create a dataset larger than page size.
2. Classify export as CURRENT_VIEW, FILTERED_FULL_DATASET, or FULL_DATASET.
3. Execute export.
4. Verify FULL_DATASET is not truncated to the current page.
5. Compare exported record population and totals with canonical source.

## Production evidence boundary

Passing CI or local runtime tests does not equal production certification. Production certification remains **NOT PRODUCTION CERTIFIED** until the same claims have evidence from the deployed production environment.
