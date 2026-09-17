import { resolveReportExecutionScope } from '../src/lib/report-execution/report-scope';
import { loadSalesSourceSnapshot, type SalesSourceRow } from '../src/lib/report-execution/sales-source-adapter';

const scope = resolveReportExecutionScope({
  tenantId: 'tenant-a',
  parameters: {
    dataset: 'sales',
    from: '2026-08-01',
    to: '2026-08-30',
    asOf: '2026-08-30',
    statusPolicy: 'exclude_cancelled_void',
  },
});

const row = (invoice_number: string, line_number: number, line_total: number): SalesSourceRow => ({
  invoice_number,
  invoice_date: '2026-08-30',
  status: 'posted',
  currency: 'YER',
  customer_code: 'C-001',
  customer_name: 'Customer',
  product_sku: 'P-001',
  product_name: 'Product',
  quantity: 2,
  unit_price: line_total / 2,
  discount_amount: 0,
  tax_amount: 0,
  line_total,
  cost_price: 5,
  line_number,
});

const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(`FAIL: ${message}`); };

const calls: Array<{ tenantId: string; from: string; to: string; excludedStatuses: readonly string[] }> = [];
const query = async (input: (typeof calls)[number]) => {
  calls.push(input);
  return [row('INV-001', 0, 100), row('INV-002', 0, 50)];
};

const first = await loadSalesSourceSnapshot(scope, query);
assert(first.rows.length === 2, 'snapshot row count');
assert(first.currentRows.length === 2, 'authoritative row count');
assert(first.sourceHash.startsWith('sha256:'), 'source hash format');
assert(first.currentRows[0].hash.startsWith('sha256:'), 'row hash format');
assert(calls.length === 1, 'single authoritative query');
assert(calls[0].tenantId === 'tenant-a', 'tenant passed to source');
assert(calls[0].from === '2026-08-01' && calls[0].to === '2026-08-30', 'period passed to source');
assert(calls[0].excludedStatuses.join(',') === 'cancelled,void', 'status policy passed to source');

const reordered = await loadSalesSourceSnapshot(scope, async () => [row('INV-002', 0, 50), row('INV-001', 0, 100)]);
assert(first.sourceHash === reordered.sourceHash, 'source hash is order independent');
assert(first.currentRows[0].hash === reordered.currentRows[0].hash, 'row hash is scope independent and stable');

let rejected = false;
try {
  await loadSalesSourceSnapshot({ ...scope, dataset: 'inventory' }, query);
} catch (error) {
  rejected = error instanceof Error && error.message === 'SALES_SOURCE_DATASET_UNSUPPORTED';
}
assert(rejected, 'unsupported dataset rejected');

rejected = false;
try {
  await loadSalesSourceSnapshot({ ...scope, statusPolicy: 'all' }, query);
} catch (error) {
  rejected = error instanceof Error && error.message === 'SALES_SOURCE_STATUS_POLICY_UNSUPPORTED';
}
assert(rejected, 'unsupported status policy rejected');

rejected = false;
try {
  await loadSalesSourceSnapshot(scope, async () => [row('INV-001', 0, 100), row('INV-001', 0, 100)]);
} catch (error) {
  rejected = error instanceof Error && error.message.startsWith('SALES_SOURCE_DUPLICATE_BUSINESS_KEY:');
}
assert(rejected, 'duplicate business key rejected');

console.log('SALES_SOURCE_ADAPTER_TEST PASS');
