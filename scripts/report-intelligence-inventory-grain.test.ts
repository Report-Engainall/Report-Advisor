import assert from 'node:assert/strict';
import { deriveReportIntelligence } from '../src/lib/report-intelligence/report-smart-insights.ts';

const columns = [
  { name: 'رقم الصنف', mappedField: 'sku', nullCount: 0 },
  { name: 'السعر', mappedField: 'price', nullCount: 1 },
  { name: 'المخزن', mappedField: 'warehouse', nullCount: 0 },
  { name: 'اسم الصنف', mappedField: 'name', nullCount: 1 },
  { name: 'المستوي', mappedField: null, nullCount: 0 },
].map((item) => ({
  ...item,
  mappingConfidence: item.mappedField ? 98 : 0,
  statistics: {},
}));

const canonicalRows = [
  { row_number: 1, data: { sku: '101', price: 100, warehouse: 1, name: 'A' } },
  { row_number: 2, data: { sku: '101', price: 120, warehouse: 2, name: 'A' } },
  { row_number: 3, data: { sku: '101', price: 120, warehouse: 2, name: 'A' } },
  { row_number: 4, data: { sku: '102', price: null, warehouse: 1, name: null } },
];

const report = deriveReportIntelligence({
  specialty: 'inventory',
  rowCount: canonicalRows.length,
  sourceAnalysis: { datasets: [{ columns }] },
  renderedOutput: {
    sourceMetrics: {
      inventory: {
        missingPriceRows: 1,
        missingNameRows: 1,
        uniqueSkuCount: 2,
        warehouseCount: 2,
        unmappedFields: ['المستوي'],
      },
    },
  },
  canonicalRows,
});

assert.ok(report.signals.some((signal) => signal.id === 'inventory:missing-price'));
assert.ok(report.signals.some((signal) => signal.id === 'inventory:price-variation'));
assert.ok(report.signals.some((signal) => signal.id === 'source:duplicate-key'));
assert.ok(report.recommendations.some((item) => item.id === 'rec:inventory:price-variation'));
console.log('REPORT_INTELLIGENCE_INVENTORY_GRAIN_PASS');
