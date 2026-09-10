import type { ReportExecutionScope } from './report-scope';

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
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

/** SHA-256 over scope identity plus deterministically ordered authoritative rows. */
export async function fingerprintReportSource(scope: ReportExecutionScope, rows: Array<Record<string, unknown>>): Promise<string> {
  if (!scope.tenantId || !scope.dataset || !scope.from || !scope.to || !scope.asOf || !scope.statusPolicy) {
    throw new Error('REPORT_SOURCE_SCOPE_INCOMPLETE');
  }
  if (!Array.isArray(rows)) throw new Error('REPORT_SOURCE_ROWS_INVALID');
  const canonicalRows = rows.map(canonicalize).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const payload = JSON.stringify(canonicalize({ scope, rows: canonicalRows }));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return `sha256:${hex(digest)}`;
}
