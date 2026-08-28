import assert from 'node:assert/strict';
import { buildProductVerticalSlice, productVerticalSliceCapabilities } from '../src/lib/productVerticalSlice.ts';
import { productVerticalSliceFixture } from './product-vertical-slice-fixture.mjs';

const slice = buildProductVerticalSlice(productVerticalSliceFixture);
assert.equal(slice.validation.passed, true);
assert.equal(slice.reconciliation.unresolved, 0);
assert.equal(slice.metrics.net_sales.value, 15000);
assert.equal(slice.metrics.gross_profit.value, 6000);
assert.equal(slice.metrics.inventory_value.value, 12505);
assert.ok((slice.metrics.stockout_risk.value ?? 0) >= 70);
assert.equal(slice.insight.metricKey, 'stockout_risk');
assert.ok(slice.recommendation.evidence.includes(slice.evidence.id));
assert.equal(slice.decision.recommendationId, slice.recommendation.id);
assert.equal(slice.decision.approval, 'AUTO_APPROVED');
assert.equal(slice.task.owner, 'UNRESOLVED');
assert.equal(slice.task.decisionId, slice.decision.id);
assert.ok(slice.report.actionRegister.includes(slice.task.id));
assert.ok(slice.report.pdfHtml.includes('dir="rtl"'));
assert.ok(slice.report.pdfHtml.includes(slice.report.reportId));
assert.equal(slice.report.actualOutcome, null);

const capabilities = productVerticalSliceCapabilities(slice);
for (const [name, status] of Object.entries(capabilities)) {
  if (name === 'outcome_linkage') assert.equal(status, 'BLOCKED');
  else assert.equal(status, 'IMPLEMENTED', name);
}

console.log('PRODUCT_VERTICAL_SLICE: PASS');
console.log('CAPABILITIES:', JSON.stringify(capabilities));
