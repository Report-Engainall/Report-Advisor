export type GoldenCase = { id: string; class: 'ARABIC_ENGLISH' | 'SCANNED' | 'RANDOM_SCHEMA' | 'NO_HEADER' | 'COMPLEX_TABLE' | 'INVOICE' | 'ONYX' | 'WIDE_30_PLUS'; expectedHeader?: number; expectedFields: string[]; minConfidence: number };
export type GoldenScore = { cases: number; passed: number; failed: number; accuracy: number; ready: boolean };

export const GOLDEN_CASES: GoldenCase[] = [
  { id: 'ar-en-basic', class: 'ARABIC_ENGLISH', expectedHeader: 1, expectedFields: ['sku', 'product_name', 'quantity', 'unit_price'], minConfidence: 0.8 },
  { id: 'scanned-invoice', class: 'SCANNED', expectedFields: ['invoice_number', 'invoice_date', 'total_amount'], minConfidence: 0.7 },
  { id: 'random-schema', class: 'RANDOM_SCHEMA', expectedFields: ['sku', 'quantity'], minConfidence: 0.75 },
  { id: 'headerless-stock', class: 'NO_HEADER', expectedFields: ['sku', 'quantity'], minConfidence: 0.65 },
  { id: 'complex-table', class: 'COMPLEX_TABLE', expectedFields: ['sku', 'quantity', 'unit_price'], minConfidence: 0.75 },
  { id: 'invoice-reconciliation', class: 'INVOICE', expectedFields: ['invoice_number', 'quantity', 'unit_price', 'total_amount'], minConfidence: 0.85 },
  { id: 'onyx-stock', class: 'ONYX', expectedFields: ['sku', 'product_name', 'warehouse', 'quantity', 'unit_price'], minConfidence: 0.9 },
  { id: 'wide-report', class: 'WIDE_30_PLUS', expectedFields: ['sku', 'product_name', 'quantity'], minConfidence: 0.75 },
];

export function scoreGoldenCases(results: Array<{ id: string; passed: boolean }>): GoldenScore {
  const expected = new Set(GOLDEN_CASES.map(c => c.id));
  const valid = results.filter(r => expected.has(r.id));
  const passed = valid.filter(r => r.passed).length;
  const cases = expected.size;
  const accuracy = cases ? passed / cases : 0;
  return { cases, passed, failed: cases - passed, accuracy, ready: valid.length === cases && accuracy >= 0.95 };
}
