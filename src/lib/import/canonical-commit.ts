import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import type { ReconciledCanonicalImportRow } from '@/lib/import/canonical-truth-boundary';
import { commitImportBatchWithClient, type CanonicalCommitResult } from './canonical-commit-core';

export type { CanonicalCommitResult } from './canonical-commit-core';

export async function commitImportBatch(
  entityType: 'products' | 'customers' | 'sales_invoices',
  rows: ReconciledCanonicalImportRow[],
  sourceHash: string,
): Promise<CanonicalCommitResult> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('No authenticated tenant context is available for canonical import');
  return commitImportBatchWithClient(supabase, companyId, entityType, rows, sourceHash);
}
