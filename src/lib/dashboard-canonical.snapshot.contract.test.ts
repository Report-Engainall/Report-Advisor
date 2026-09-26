import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const adapter = fs.readFileSync(path.join(root, 'src/lib/dashboard-canonical.ts'), 'utf8');

describe('dashboard snapshot RPC contract', () => {
  it('uses the canonical snapshot for top entities instead of an unbound secondary RPC', () => {
    expect(adapter).toContain("supabase.rpc('get_dashboard_snapshot'");
    expect(adapter).toContain("topCustomers: requiredArray<TopEntity>(row.topCustomers, 'topCustomers')");
    expect(adapter).toContain("topProducts: requiredArray<TopEntity>(row.topProducts, 'topProducts')");
    expect(adapter).not.toContain("supabase.rpc('get_dashboard_top_entities'");
  });
});


describe('dashboard snapshot fail-closed truth', () => {
  it('rejects malformed authoritative arrays and missing as-of values', () => {
    expect(adapter).toContain('function requiredArray<T>(value: unknown, field: string)');
    expect(adapter).toContain('REPORT_DATA_MALFORMED:asOf');
    expect(adapter).toContain('REPORT_DATA_MALFORMED:${field}');
  });
});


describe('dashboard canonical row-shape validation', () => {
  it('guards trend/top-entity/category/aging row semantics', () => {
    expect(adapter).toContain('isMonthlyTrend');
    expect(adapter).toContain('isTopEntity');
    expect(adapter).toContain('isCategoryBreakdown');
    expect(adapter).toContain('isAgingBucket');
  });

  it('fails closed on malformed snapshot metadata instead of defaulting to current input values', () => {
    expect(adapter).toContain('function requiredInteger');
    expect(adapter).toContain('function requiredAsOf');
    expect(adapter).toContain('function requiredEnum');
    expect(adapter).toContain('REPORT_DATA_MALFORMED:inventory.filter_mismatch');
    expect(adapter).toContain("requiredAsOf(row.as_of, 'profitability.as_of')");
    expect(adapter).toContain("requiredAsOf(row.asOf, 'rfm.asOf')");
    expect(adapter).toContain("requiredAsOf(row.asOf, 'aging.asOf')");
  });

  it('does not silently coerce authoritative inventory rows or statuses', () => {
    expect(adapter).toContain("requiredArray<InventoryReportRow>(row.rows, 'inventory.rows', isInventoryReportRow)");
    expect(adapter).toContain("requiredEnum(row.dataStatus, 'inventory.dataStatus'");
    expect(adapter).toContain("requiredInteger(row.unknownRows, 'inventory.unknownRows')");
  });
});
