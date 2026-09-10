import type { ReportExecutionScope } from './report-scope';
import { fingerprintReportRow, fingerprintReportSource } from './source-fingerprint';
import type { RowVersion } from '../production-intelligence';

export interface SalesSourceRow {
  invoice_number: string;
  invoice_date: string;
  status: string;
  currency: string | null;
  customer_code: string | null;
  customer_name: string | null;
  product_sku: string | null;
  product_name: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  cost_price: number;
  line_number: number;
}

export interface SalesSourceSnapshot {
  sourceHash: string;
  rows: Array<Record<string, unknown>>;
  currentRows: RowVersion<SalesSourceRow>[];
}

export interface SalesSourceQuery {
  (input: {
    tenantId: string;
    from: string;
    to: string;
    excludedStatuses: readonly string[];
  }): Promise<SalesSourceRow[]>;
}

const KPI_STATUS_POLICY = 'exclude_cancelled_void';
const EXCLUDED_STATUSES = ['cancelled', 'void'] as const;

function finite(value: number, field: string): number {
  if (!Number.isFinite(value)) throw new Error(`SALES_SOURCE_${field.toUpperCase()}_NON_FINITE`);
  return Object.is(value, -0) ? 0 : value;
}

function normalizeRow(row: SalesSourceRow): SalesSourceRow {
  if (!row.invoice_number.trim()) throw new Error('SALES_SOURCE_INVOICE_NUMBER_REQUIRED');
  if (!row.invoice_date.trim()) throw new Error('SALES_SOURCE_INVOICE_DATE_REQUIRED');
  if (!row.status.trim()) throw new Error('SALES_SOURCE_STATUS_REQUIRED');
  if (!Number.isInteger(row.line_number) || row.line_number < 0) throw new Error('SALES_SOURCE_LINE_NUMBER_INVALID');
  return {
    ...row,
    invoice_number: row.invoice_number.trim(),
    invoice_date: row.invoice_date.trim(),
    status: row.status.trim().toLowerCase(),
    customer_code: row.customer_code?.trim() || null,
    customer_name: row.customer_name?.trim() || null,
    product_sku: row.product_sku?.trim() || null,
    product_name: row.product_name?.trim() || null,
    currency: row.currency?.trim() || null,
    quantity: finite(row.quantity, 'quantity'),
    unit_price: finite(row.unit_price, 'unit_price'),
    discount_amount: finite(row.discount_amount, 'discount_amount'),
    tax_amount: finite(row.tax_amount, 'tax_amount'),
    line_total: finite(row.line_total, 'line_total'),
    cost_price: finite(row.cost_price, 'cost_price'),
  };
}

function businessKey(row: SalesSourceRow): string {
  return `${row.invoice_number}::line-${row.line_number}`;
}

/**
 * Read the authoritative sales rows for one resolved scope and turn them into the
 * existing durable snapshot contract. Persistence remains outside this adapter.
 */
export async function loadSalesSourceSnapshot(scope: ReportExecutionScope, query: SalesSourceQuery): Promise<SalesSourceSnapshot> {
  if (scope.dataset !== 'sales') throw new Error('SALES_SOURCE_DATASET_UNSUPPORTED');
  if (scope.statusPolicy !== KPI_STATUS_POLICY) throw new Error('SALES_SOURCE_STATUS_POLICY_UNSUPPORTED');

  const rawRows = await query({
    tenantId: scope.tenantId,
    from: scope.from,
    to: scope.to,
    excludedStatuses: EXCLUDED_STATUSES,
  });
  if (!Array.isArray(rawRows)) throw new Error('SALES_SOURCE_ROWS_INVALID');

  const normalized = rawRows.map(normalizeRow).sort((a, b) => businessKey(a).localeCompare(businessKey(b)));
  const duplicateKeys = new Set<string>();
  for (const row of normalized) {
    const key = businessKey(row);
    if (duplicateKeys.has(key)) throw new Error(`SALES_SOURCE_DUPLICATE_BUSINESS_KEY:${key}`);
    duplicateKeys.add(key);
  }

  const rows = normalized.map((row) => ({ ...row } as Record<string, unknown>));
  const sourceHash = await fingerprintReportSource(scope, rows);
  const currentRows = await Promise.all(
    normalized.map(async (row) => ({
      key: businessKey(row),
      hash: await fingerprintReportRow({ ...row } as Record<string, unknown>),
      value: row,
    })),
  );

  return { sourceHash, rows, currentRows };
}
