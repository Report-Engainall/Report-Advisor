import type { SupabaseClient } from '@supabase/supabase-js';
import type { RowVersion } from '../production-intelligence';
import type { ReportExecutionRequest } from './report-execution-contract';
import type { DurableSourceSnapshot, DurableProductionRunInput } from './durable-production-runner';
import type { SalesSourceRow } from './sales-source-adapter';
import { resolveReportExecutionScope } from './report-scope';
import { loadSalesSourceSnapshot } from './sales-source-adapter';
import { createSupabaseSalesSourceQuery } from './sales-source-supabase';

export interface PreparedSalesDurableSource {
  scope: ReturnType<typeof resolveReportExecutionScope>;
  snapshot: DurableSourceSnapshot<SalesSourceRow>;
  loadSourceSnapshot: NonNullable<DurableProductionRunInput<SalesSourceRow>['loadSourceSnapshot']>;
}

/**
 * Binds the resolved request scope to the real sales source and the existing
 * durable runner loader contract. No queue/store/lifecycle implementation is
 * duplicated here; this module only prepares the authoritative source snapshot.
 */
export async function prepareSalesDurableSource(
  request: ReportExecutionRequest,
  client: SupabaseClient,
): Promise<PreparedSalesDurableSource> {
  if (!request.sourceSnapshotId?.trim()) throw new Error('SALES_DURABLE_SOURCE_SNAPSHOT_ID_REQUIRED');

  const scope = resolveReportExecutionScope({ tenantId: request.tenantId, parameters: request.parameters });
  const query = createSupabaseSalesSourceQuery(client);
  const snapshot = await loadSalesSourceSnapshot(scope, query);

  const loadSourceSnapshot = async (input: {
    request: ReportExecutionRequest;
    expectedSourceHash: string;
    sourceSnapshotId: string;
  }): Promise<DurableSourceSnapshot<SalesSourceRow>> => {
    if (input.request.tenantId !== request.tenantId) throw new Error('SALES_DURABLE_TENANT_MISMATCH');
    if (input.sourceSnapshotId !== request.sourceSnapshotId) throw new Error('SALES_DURABLE_SNAPSHOT_ID_MISMATCH');
    if (input.expectedSourceHash !== snapshot.sourceHash) throw new Error('SALES_DURABLE_SOURCE_HASH_MISMATCH');
    return snapshot;
  };

  return { scope, snapshot, loadSourceSnapshot };
}

export type SalesDurableCurrentRows = RowVersion<SalesSourceRow>[];
