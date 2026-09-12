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
 * durable runner loader contract. The supplied snapshot identity must also
 * exist in the persistent source-version ledger for the same tenant, and its
 * persisted scope/hash must agree with the request and the authoritative
 * source re-load. No queue/store/lifecycle implementation is duplicated here.
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

    const { data, error } = await client
      .from('report_source_versions')
      .select('id, company_id, source_hash, metadata')
      .eq('id', input.sourceSnapshotId)
      .eq('company_id', input.request.tenantId)
      .maybeSingle();

    if (error) throw new Error(`SALES_DURABLE_SNAPSHOT_LOOKUP_FAILED:${error.message}`);
    if (!data) throw new Error('SALES_DURABLE_SNAPSHOT_NOT_FOUND');
    if (data.company_id !== input.request.tenantId) throw new Error('SALES_DURABLE_PERSISTED_TENANT_MISMATCH');
    if (data.source_hash !== input.expectedSourceHash) throw new Error('SALES_DURABLE_PERSISTED_SOURCE_HASH_MISMATCH');

    const metadata = data.metadata as Record<string, unknown> | null;
    if (
      metadata?.dataset !== scope.dataset ||
      metadata?.from !== scope.from ||
      metadata?.to !== scope.to ||
      metadata?.asOf !== scope.asOf ||
      metadata?.statusPolicy !== scope.statusPolicy
    ) {
      throw new Error('SALES_DURABLE_PERSISTED_SCOPE_MISMATCH');
    }

    const authoritativeSnapshot = await loadSalesSourceSnapshot(scope, query);
    if (authoritativeSnapshot.sourceHash !== data.source_hash) {
      throw new Error('SALES_DURABLE_PERSISTED_SOURCE_CHANGED');
    }
    return authoritativeSnapshot;
  };

  return { scope, snapshot, loadSourceSnapshot };
}

export type SalesDurableCurrentRows = RowVersion<SalesSourceRow>[];
