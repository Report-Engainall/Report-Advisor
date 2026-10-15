export type GenericSourceRowsOrigin = 'canonical' | 'source-analysis-snapshot' | 'unavailable';

type RowObject = Record<string, unknown>;

function isRowObject(value: unknown): value is RowObject {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

/**
 * Selects rows for the general intelligence layer without silently promoting
 * an incomplete extraction preview to a full source. The snapshot passed here
 * must already have been queried by tenant + source hash + import job ID.
 */
export function selectGenericSourceRows(input: {
  canonicalRows: readonly unknown[];
  sourceDataset: unknown;
  sourceDatasetCount: number;
  sourceAnalysisRowCount?: number | null;
  /** False when the canonical read ended early, hit its ceiling, or failed. */
  canonicalRowsComplete?: boolean;
  /** Expected count from the source-bound report metadata, when known. */
  expectedCanonicalRowCount?: number | null;
}): { rows: RowObject[]; origin: GenericSourceRowsOrigin } {
  const canonical = input.canonicalRows.filter(isRowObject);
  const expectedCanonicalRowCount = input.expectedCanonicalRowCount;
  const canonicalCountMatchesExpected = expectedCanonicalRowCount == null
    || (Number.isSafeInteger(expectedCanonicalRowCount)
      && expectedCanonicalRowCount >= 0
      && canonical.length === expectedCanonicalRowCount);
  if (
    canonical.length > 0
    && input.canonicalRowsComplete !== false
    && canonicalCountMatchesExpected
  ) {
    return { rows: canonical, origin: 'canonical' };
  }

  if (!isRowObject(input.sourceDataset)) return { rows: [], origin: 'unavailable' };
  const rawRows = Array.isArray(input.sourceDataset.rows) ? input.sourceDataset.rows : [];
  const snapshotRows = rawRows.filter(isRowObject);
  const declaredRows = Number(input.sourceDataset.rowCount);

  const snapshotIsComplete = snapshotRows.length > 0
    && Number.isSafeInteger(declaredRows)
    && declaredRows > 0
    && snapshotRows.length === declaredRows
    && (input.sourceDatasetCount !== 1
      || input.sourceAnalysisRowCount == null
      || Number(input.sourceAnalysisRowCount) === declaredRows);

  return snapshotIsComplete
    ? { rows: snapshotRows, origin: 'source-analysis-snapshot' }
    : { rows: [], origin: 'unavailable' };
}
