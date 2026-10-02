import {
  listReportArchetypes,
  getReportArchetypeByNumber,
  runReportArchetype,
  REPORT_ARCHETYPE_CATALOG_ID,
  REPORT_ARCHETYPE_CATALOG_VERSION,
  REPORT_ARCHETYPE_CATALOG_SIZE,
} from '../src/lib/report-intelligence/archetype-registry.ts';

const fail = (message) => { throw new Error(message); };
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
