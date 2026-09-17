import type { ReportExecutionScope } from './report-scope';

function canonicalKeyCompare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function canonicalize(value: unknown): unknown {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('REPORT_SOURCE_NON_FINITE_NUMBER');
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([a], [b]) => canonicalKeyCompare(a, b))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

async function digest(value: unknown): Promise<string> {
  const payload = JSON.stringify(canonicalize(value));
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return `sha256:${hex(hash)}`;
}

/** SHA-256 over scope identity plus deterministically ordered authoritative rows. */
export async function fingerprintReportSource(scope: ReportExecutionScope, rows: Array<Record<string, unknown>>): Promise<string> {
  if (!scope.tenantId || !scope.dataset || !scope.from || !scope.to || !scope.asOf || !scope.statusPolicy) {
    throw new Error('REPORT_SOURCE_SCOPE_INCOMPLETE');
  }
  if (!Array.isArray(rows)) throw new Error('REPORT_SOURCE_ROWS_INVALID');
  const canonicalRows = rows
    .map(canonicalize)
    .sort((a, b) => canonicalKeyCompare(JSON.stringify(a), JSON.stringify(b)));
  return digest({ scope, rows: canonicalRows });
}

/** Stable row fingerprint for RowVersion hashing; intentionally independent of report scope. */
export async function fingerprintReportRow(row: Record<string, unknown>): Promise<string> {
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('REPORT_SOURCE_ROW_INVALID');
  return digest(row);
}
