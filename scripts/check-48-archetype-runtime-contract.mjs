import fs from 'node:fs';

import {
  listReportArchetypes,
  getReportArchetypeByNumber,
  runReportArchetype,
  REPORT_ARCHETYPE_CATALOG_ID,
  REPORT_ARCHETYPE_CATALOG_VERSION,
  REPORT_ARCHETYPE_CATALOG_SIZE,
} from '../src/lib/report-intelligence/archetype-registry.ts';

const fail = (message) => { throw new Error(message); };
const evaluatorSource = fs.readFileSync(new URL('../src/lib/report-intelligence/archetype-evaluator.ts', import.meta.url), 'utf8');
const insightsSource = fs.readFileSync(new URL('../src/lib/report-intelligence/report-smart-insights.ts', import.meta.url), 'utf8');
if (evaluatorSource.includes('Date.now()')) fail('RFM/archetype runtime must not use wall-clock time for source-derived recency');
if (!insightsSource.includes('date.getUTCFullYear()') || !insightsSource.includes('date.getUTCMonth()')) fail('Forecast month bucketing must be UTC/source deterministic');

const archetypes = listReportArchetypes();

if (REPORT_ARCHETYPE_CATALOG_ID !== 'report-intelligence.48') fail('Canonical catalog id mismatch');
if (REPORT_ARCHETYPE_CATALOG_VERSION !== '1.0.0') fail('Canonical catalog version mismatch');
if (REPORT_ARCHETYPE_CATALOG_SIZE !== 48) fail('Canonical catalog size mismatch');
if (archetypes.length !== REPORT_ARCHETYPE_CATALOG_SIZE) fail('Expected exactly 48 canonical report archetypes, got ' + archetypes.length);

const numbers = new Set(archetypes.map((item) => item.number));
const ids = new Set(archetypes.map((item) => item.id));
if (numbers.size !== 48 || [...numbers].some((value, index) => value !== index + 1)) fail('Archetype numbering is not exactly 01..48');
if (ids.size !== 48) fail('Archetype IDs must be unique');

for (const profile of archetypes) {
  if (!profile.title.trim()) fail('Missing title for #' + profile.number);
  if (!profile.id.trim()) fail('Missing id for #' + profile.number);
  if (!profile.grain.trim()) fail('Missing grain for #' + profile.id);
  if (!Array.isArray(profile.requiredFields)) fail('Missing requiredFields for ' + profile.id);
  if (!Array.isArray(profile.optionalFields)) fail('Missing optionalFields for ' + profile.id);
  if (!Number.isInteger(profile.minimumSample) || profile.minimumSample < 1) fail('Invalid minimumSample for ' + profile.id);
  if (!profile.capabilities.length) fail('No runtime capabilities for ' + profile.id);
  if (!profile.recommendationFocus.length) fail('No recommendation focus for ' + profile.id);
  if (!Array.isArray(profile.recommendationRules) || !profile.recommendationRules.length) fail('No recommendation rules for ' + profile.id);
  if (!Array.isArray(profile.evidenceRequirements) || profile.evidenceRequirements.length < 4) fail('Evidence requirements missing for ' + profile.id);
  if (profile.evaluatorId !== 'archetype.evaluator.' + profile.id) fail('Evaluator id mismatch for ' + profile.id);
  if (profile.provenanceRequirements.join('|').indexOf('sourceHash') < 0) fail('Source provenance missing for ' + profile.id);
  if (getReportArchetypeByNumber(profile.number)?.id !== profile.id) fail('Number lookup mismatch for ' + profile.id);
}

const sampleRows = [{ data: { netAmount: 100, documentDate: '2026-01-01', productCode: 'SKU-1', customerCode: 'C-1', supplierCode: 'S-1', currentStock: 10, salesQty: 4, cost: 60 } }];

for (const profile of archetypes) {
  const availableFields = [...new Set(['productCode','productName','category','brand','unit','warehouse','fromWarehouse','toWarehouse','openingBalance','openingStock','inbound','outbound','salesQty','purchaseQty','currentStock','adjustmentQty','returnQty','requestedQty','fulfilledQty','orderedQty','receivedQty','customerCode','customerName','supplierCode','supplierName','salesRep','documentNo','documentDate','transactionType','accountCode','accountName','quantity','unitPrice','sellingPrice','grossAmount','discount','netAmount','cost','profit','currency','paymentMethod','paymentTerms','paidAmount','targetAmount','dueDate','leadTimeDays','debit','credit','asset','liability','equity', ...profile.requiredFields])];
  const result = runReportArchetype({
    archetypeId: profile.id,
    report: {
      specialty: profile.adapterSpecialty,
      rowCount: 12,
      canonicalRows: sampleRows,
      sourceAnalysis: { datasets: [{ columns: availableFields.map((mappedField) => ({ name: mappedField, mappedField })) }] },
    },
    availableFields,
    sampleSize: 12,
    provenance: {
      tenantId: 'runtime-contract-tenant',
      sourceHash: 'sha256:runtime-contract',
      reportExecutionJobId: 'runtime-contract-job',
      evidenceSnapshotId: 'runtime-contract-snapshot',
      evidencePassportId: 'runtime-contract-passport',
    },
  });

  if (result.profile.id !== profile.id) fail('Runtime resolved wrong profile for ' + profile.id);
  if (result.advisory.questions.length === 0) fail('No advisory questions emitted for ' + profile.id);
  const archetypeQuestion = result.advisory.questions.find((question) => question.id === 'archetype:' + profile.id + ':primary-question');
  if (!archetypeQuestion || archetypeQuestion.state !== 'ANSWERED') fail('Archetype-specific advisory question must be answered for ' + profile.id);
  if (!result.advisory.claims.length) fail('No claims emitted for ' + profile.id);
  if (!result.intelligence.signals.some((signal) => signal.id === 'model:' + profile.id)) fail('Archetype-specific model signal missing for ' + profile.id);
  if (!result.intelligence.recommendations.some((recommendation) => recommendation.id === 'rec:archetype:' + profile.id)) fail('Archetype-specific recommendation missing for ' + profile.id);
  if (result.advisory.proofState !== 'VERIFIED') fail('Runtime lost evidence state for ' + profile.id);
  if (result.advisory.claims.some((claim) => claim.archetypeId !== profile.id)) fail('Claim lineage lost archetype ID for ' + profile.id);
}

const legacyInventory = runReportArchetype({
  archetypeId: 'inventory.stockout-reorder',
  report: {
    specialty: 'inventory',
    rowCount: 12,
    canonicalRows: Array.from({ length: 12 }, (_, index) => ({ data: { productCode: 'SKU-' + index, balance: 2 + index, net_sales: 4 + index } })),
    sourceAnalysis: {
      datasets: [{
        columns: [
          { name: 'رقم الصنف', mappedField: 'sku' },
          { name: 'الرصيد', mappedField: 'balance' },
          { name: 'صافي المبيعات', mappedField: 'net_sales' },
        ],
      }],
    },
  },
  availableFields: ['sku', 'balance', 'net_sales'],
  sampleSize: 12,
  provenance: {
    tenantId: 'semantic-legacy-tenant',
    sourceHash: 'sha256:semantic-legacy',
    reportExecutionJobId: 'semantic-legacy-job',
    evidenceSnapshotId: 'semantic-legacy-snapshot',
    evidencePassportId: 'semantic-legacy-passport',
  },
});
if (legacyInventory.state !== 'SUPPORTED') fail('Legacy semantic inventory mapping must remain SUPPORTED, got ' + legacyInventory.state);
if (!legacyInventory.intelligence.signals.some((signal) => signal.id === 'model:inventory.stockout-reorder')) fail('Legacy semantic inventory mapping lost stockout model signal');
if (!legacyInventory.intelligence.recommendations.some((recommendation) => recommendation.id === 'rec:archetype:inventory.stockout-reorder')) fail('Legacy semantic inventory mapping lost stockout recommendation');

const missingEvidence = runReportArchetype({
  archetypeId: archetypes[0].id,
  report: { specialty: archetypes[0].adapterSpecialty, rowCount: 12, canonicalRows: sampleRows, sourceAnalysis: { datasets: [{ columns: [] }] } },
  availableFields: archetypes[0].requiredFields,
  sampleSize: 12,
  provenance: { tenantId: 'runtime-contract-tenant', sourceHash: 'sha256:runtime-contract', reportExecutionJobId: 'runtime-contract-job' },
});
if (missingEvidence.state !== 'REVIEW_REQUIRED') fail('Missing evidence must remain REVIEW_REQUIRED');

const insufficient = runReportArchetype({
  archetypeId: archetypes[0].id,
  report: { specialty: archetypes[0].adapterSpecialty, rowCount: 1, canonicalRows: sampleRows, sourceAnalysis: { datasets: [{ columns: [] }] } },
  availableFields: archetypes[0].requiredFields,
  sampleSize: 1,
  provenance: { tenantId: 'runtime-contract-tenant', sourceHash: 'sha256:runtime-contract', reportExecutionJobId: 'runtime-contract-job', evidenceSnapshotId: 'runtime-contract-snapshot' },
});
if (insufficient.state !== 'INSUFFICIENT_SAMPLE') fail('Insufficient sample must be explicit');

console.log('48-archetype-runtime-contract: PASS');
