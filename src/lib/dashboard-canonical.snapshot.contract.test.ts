import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { isInventoryReportRow, normalizeAgingDashboard, normalizeCategoryBreakdown, normalizeMonthlyTrend } from './dashboard-canonical';
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

  it('accepts the current RPC shape where trend/category status fields are derived locally', () => {
    expect(adapter).toContain('normalizeMonthlyTrend');
    expect(adapter).toContain('normalizeCategoryBreakdown');
    expect(adapter).toContain('normalizeAgingDashboard');
    expect(adapter).not.toContain('const agingRow=');
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


describe('dashboard canonical payload compatibility', () => {
  it('normalizes the current canonical dashboard trend payload without inventing status', () => {
    expect(normalizeMonthlyTrend({
      month: '2026-09',
      label: 'Sep',
      sales: 100,
      cost: 60,
      profit: 40,
      invoices: 2,
    })).toEqual({
      month: '2026-09',
      label: 'Sep',
      sales: 100,
      cost: 60,
      profit: 40,
      invoices: 2,
      status: 'CALCULATED',
    });
    expect(normalizeMonthlyTrend({
      month: '2026-09',
      label: 'Sep',
      sales: null,
      cost: null,
      profit: null,
      invoices: 0,
    }).status).toBe('NO_DATA');
  });

  it('normalizes current category and aging payload shapes', () => {
    expect(normalizeCategoryBreakdown({
      name: null,
      sales: 10,
      profit: 4,
      quantity: 2,
    })).toMatchObject({ name: null, categoryStatus: 'UNKNOWN' });

    expect(normalizeAgingDashboard([
      { bucket: '0-30', amount: 100, count: 2 },
      { bucket: 'UNKNOWN', amount: 30, count: 1 },
      { bucket: '31-60', amount: null, count: 0 },
    ])).toMatchObject({
      unknownRows: 1,
      status: 'INSUFFICIENT_DATA',
      totalAmount: 130,
    });

    expect(normalizeAgingDashboard([
      { bucket: '0-30', amount: null, count: 0 },
    })).toMatchObject({ unknownRows: 0, status: 'NO_DATA', totalAmount: null });
  });
});


describe('inventory snapshot payload compatibility', () => {
  it('accepts canonical rows whose product or warehouse relation is unavailable', () => {
    expect(isInventoryReportRow({
      id: 'inventory-1',
      quantity: 5,
      unit_cost: 10,
      value: 50,
      product: { id: null, name: null, sku: null, reorder_point: null },
      warehouse: { id: null, name: null },
    })).toBe(true);
  });

  it('rejects malformed inventory row identity', () => {
    expect(isInventoryReportRow({
      id: '',
      quantity: 5,
      unit_cost: 10,
      value: 50,
      product: { id: null, name: null, sku: null, reorder_point: null },
      warehouse: { id: null, name: null },
    })).toBe(false);
  });
});
