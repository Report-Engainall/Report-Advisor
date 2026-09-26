import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { isReceivablesReportRow } from './queries';

const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/queries.ts'), 'utf8');
const start = source.indexOf('export async function fetchReceivablesReportPage');
const end = source.indexOf('export type CanonicalExportRow', start);
const fn = source.slice(start, end);

describe('receivables report truth contract', () => {
  it('accepts only the canonical status values and rejects malformed metadata', () => {
    expect(fn).toContain("payload.status !== 'NO_DATA' && payload.status !== 'CALCULATED'");
    expect(fn).toContain("throw new Error('REPORT_DATA_MALFORMED: receivables.status')");
    expect(fn).toContain("throw new Error('REPORT_DATA_MALFORMED: receivables.pagination')");
    expect(fn).toContain("throw new Error('REPORT_DATA_MALFORMED: receivables.total_rows')");
    expect(fn).toContain("throw new Error('REPORT_DATA_MALFORMED: receivables.total_outstanding')");
  });

  it('does not coerce missing RPC metadata into caller defaults', () => {
    expect(fn).not.toContain("status: p.status === 'NO_DATA' ? 'NO_DATA' : 'CALCULATED'");
    expect(fn).not.toContain('page: Number(p.page ?? page)');
    expect(fn).not.toContain('page_size: Number(p.page_size ?? pageSize)');
    expect(fn).not.toContain('total_rows: Number(p.total_rows ?? 0)');
    expect(fn).not.toContain('total_outstanding: Number(p.total_outstanding ?? 0)');
  });

  it('behaviorally rejects malformed report rows', () => {
    expect(isReceivablesReportRow({
      id: 'r1',
      invoice_number: 'INV-1',
      invoice_date: '2026-09-27',
      due_date: null,
      total: 100,
      paid_amount: 20,
      balance: 80,
      status: 'open',
      customer: { id: 'c1', name: 'عميل' },
    })).toBe(true);

    expect(isReceivablesReportRow({
      id: '',
      invoice_number: 'INV-1',
      invoice_date: '2026-09-27',
      due_date: null,
      total: 100,
      paid_amount: 20,
      balance: 80,
      status: 'open',
      customer: null,
    })).toBe(false);

    expect(isReceivablesReportRow({
      id: 'r1',
      invoice_number: 'INV-1',
      invoice_date: '2026-09-27',
      due_date: null,
      total: '100',
      paid_amount: 20,
      balance: 80,
      status: 'open',
      customer: null,
    })).toBe(false);
  });
});
