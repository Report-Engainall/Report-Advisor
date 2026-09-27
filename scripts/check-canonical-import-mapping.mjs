import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/file-engine/adapters.ts', import.meta.url), 'utf8');
const canonicalImportPage = readFileSync(new URL('../src/pages/CanonicalImportPage.tsx', import.meta.url), 'utf8');
const canonicalImportServerWrapper = readFileSync(new URL('../netlify/functions/canonical-import-execute.mts', import.meta.url), 'utf8');
const canonicalImportServer = readFileSync(new URL('../src/server/canonical-import-executor.ts', import.meta.url), 'utf8');
const sourceUnderstanding = readFileSync(new URL('../src/lib/import/canonical-source-understanding.ts', import.meta.url), 'utf8');
const queriesSource = readFileSync(new URL('../src/lib/queries.ts', import.meta.url), 'utf8');
const trustEvidencePage = readFileSync(new URL('../src/pages/TrustEvidencePage.tsx', import.meta.url), 'utf8');
const decisionExperiencePage = readFileSync(new URL('../src/pages/DecisionExperiencePage.tsx', import.meta.url), 'utf8');
const canonicalProductionAdapter = readFileSync(new URL('../src/lib/import/canonical-production-adapter.ts', import.meta.url), 'utf8');

const required = [
  'materializeCanonicalFields',
  'column.mappedField',
  'column.mappingConfidence < 80',
  'const canonicalRows = materializeCanonicalFields(cleanedRows, columnProfiles)',
  'rows: canonicalRows',
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Canonical import mapping contract missing: ${token}`);
}

if (!source.includes('next[field] !==') || !source.includes("value !== '' && value !== null && value !== undefined")) {
  throw new Error('Canonical mapping must preserve non-empty existing values and ignore empty source cells');
}

if (!source.includes('if (!previous || column.mappingConfidence > previous.mappingConfidence)')) {
  throw new Error('Duplicate canonical mappings must resolve deterministically by confidence');
}

const multiSourceRequired = [
  'understandCanonicalSource',
  'datasetCount',
  'specialty',
  'entityType',
  'const rows = datasets.flatMap((dataset) => dataset.rows)',
];
for (const token of multiSourceRequired) {
  if (!sourceUnderstanding.includes(token)) throw new Error(`Canonical source understanding contract missing: ${token}`);
}
if (canonicalImportPage.includes('const dataset = datasets[0]') || canonicalImportServer.includes('const authoritativeDataset = authoritativeDatasets[0]')) {
  throw new Error('Canonical import must not silently discard datasets after selecting only the first dataset');
}
if (!canonicalImportServer.includes('authoritativeDatasets') || !canonicalImportServer.includes('sourceUnderstanding.datasets.map')) {
  throw new Error('Server canonical import must persist and return all authoritative dataset summaries');
}
if (!sourceUnderstanding.includes('const mixedSpecialtySource = new Set(summaries.map((summary) => summary.specialty)).size > 1')) {
  throw new Error('Mixed-specialty sources must be detected explicitly before canonical entity selection');
}
const mixedSpecialtyEntityBoundaryTokens = [
  "const entityType = mixedSpecialtySource ? 'generic:source-data' : inferEntityType(specialty, datasets);",
  "entityType: mixedSpecialtySource ? 'generic:source-data' : inferEntityType(specialty, datasets)",
];
if (!mixedSpecialtyEntityBoundaryTokens.some((token) => sourceUnderstanding.includes(token))) {
  throw new Error('Mixed-specialty sources must fail closed to the generic canonical boundary');
}

for (const token of [
  'CANONICAL_WRITE_FIELDS',
  'missingCanonicalWriteFields',
  'for (const dataset of datasets)',
  'dataset.columns.map((column) => column.mappedField)',
  "if (missing.length > 0) return 'generic:source-data'",
  "CANONICAL_ENTITY_REQUIREMENTS_UNMET:"
]) {
  if (!sourceUnderstanding.includes(token)) {
    throw new Error('Typed canonical inference must fail closed when canonical write requirements are incomplete: ' + token);
  }
}

const schemaIntelligence = readFileSync(new URL('../src/lib/file-engine/schema-intelligence.ts', import.meta.url), 'utf8');
const specialtySchemaTokens = [
  'supplier_id','supplier_name','supplier_code','invoice_date','warehouse_id',
  'purchase_amount','subtotal','tax_amount','total','paid_amount','discount_amount',
  'due_date','currency','payment_id','payment_date','payment_amount','payment_method',
  'reference','direction','product_id','unit_cost','last_movement_date','segment',
  'credit_limit','payment_terms_days','min_stock','reorder_point','is_active',
];
for (const token of specialtySchemaTokens) {
  if (!schemaIntelligence.includes(token)) throw new Error('Specialty schema mapping missing: ' + token);
}
const specialtySourceUnderstandingTokens = [
  "purchase_invoices","suppliers","inventory_balances","payments",
  "if (specialty === 'purchases') return 'purchase_invoices'",
  "if (specialty === 'suppliers') return 'suppliers'",
  "if (specialty === 'inventory') return 'inventory_balances'",
  "if (specialty === 'payments') return 'payments'",
];
for (const token of specialtySourceUnderstandingTokens) {
  if (!sourceUnderstanding.includes(token)) throw new Error('Specialty canonical entity inference missing: ' + token);
}
const canonicalTruthBoundary = readFileSync(new URL('../src/lib/import/canonical-truth-boundary.ts', import.meta.url), 'utf8');
for (const token of ['purchase_invoices','suppliers','inventory_balances','payments','CONFLICTING_EVIDENCE_FOR_SAME_CANONICAL_IDENTITY']) {
  if (!canonicalTruthBoundary.includes(token)) throw new Error('Specialty canonical identity boundary missing: ' + token);
}
const specialtyMigration = readFileSync(new URL('../supabase/migrations/20260927213000_expand_canonical_import_specialties.sql', import.meta.url), 'utf8');
for (const token of [
  'purchase_invoices','suppliers','inventory_balances','payments',
  'canonical_import_commits_entity_type_check',
  "IMPORT_ENTITY_TYPE_UNSUPPORTED",
  'SUPPLIER_NAME_REQUIRED','PURCHASE_SUPPLIER_REQUIRED','INVENTORY_PRODUCT_REQUIRED',
  'INVENTORY_WAREHOUSE_REQUIRED','PAYMENT_DIRECTION_INVALID','PAYMENT_AMOUNT_REQUIRED',
  'AUTHORITATIVE_SOURCE_HASH_MISMATCH','AUTHORITATIVE_SOURCE_NOT_VERIFIED',
  'CREATE FUNCTION public.import_commit_batch',
  'p_import_job_id uuid',
]) {
  if (!specialtyMigration.includes(token)) throw new Error('Specialty canonical migration contract missing: ' + token);
}
if (!/canonical_import_commits[\s\S]*purchase_invoices[\s\S]*payments/.test(specialtyMigration)) {
  throw new Error('Specialty canonical commit allowlist must include all business entity types');
}
if (!/drop constraint if exists canonical_import_commits_entity_type_check/i.test(specialtyMigration)) {
  throw new Error('Specialty migration must reconcile the existing canonical entity-type check');
}

for (const requiredField of [
  'invoice_date',
  'subtotal',
  'tax_amount',
  'paid_amount',
  'status',
  'segment',
  'credit_limit',
  'payment_terms_days',
  'unit',
  'cost_price',
  'selling_price',
  'min_stock',
  'reorder_point',
  'is_active',
]) {
  if (!sourceUnderstanding.includes("'" + requiredField + "'")) {
    throw new Error('Canonical write requirement missing from source-understanding guard: ' + requiredField);
  }
}

for (const token of [
  'fetchImportEvidenceSnapshot',
  ".from('source_analysis_snapshots')",
  "import_job_id",
]) {
  if (!queriesSource.includes(token)) throw new Error(`Imported source evidence query contract missing: ${token}`);
}
for (const token of [
  'EVIDENCE PASSPORT',
  'sourceSnapshot',
  "PARTIAL / NOT PROVEN",
  'fetchImportEvidenceSnapshot(importJobId)',
]) {
  if (!trustEvidencePage.includes(token)) throw new Error(`Evidence Passport UI contract missing: ${token}`);
}
for (const token of [
  'importJobId',
  'sourceSnapshot',
  'IMPORTED SOURCE CONTEXT',
  'safeNext',
  'fetchImportEvidenceSnapshot(importJobId)',
]) {
  if (!decisionExperiencePage.includes(token)) throw new Error(`Decision source-context gate missing: ${token}`);
}
if (!canonicalImportPage.includes('Evidence Passport') || !canonicalImportPage.includes('/trust?import=') || !canonicalImportPage.includes('/data-quality') || !canonicalImportPage.includes('/decision-experience?stage=evidence&import=')) {
  throw new Error('Post-import UI must carry the import identity through Evidence Passport, Data Quality, and Decision Experience');
}
for (const token of [
  'CANONICAL RESULT',
  'PARTIAL / NOT PROVEN',
  'SOURCE FLOW',
  'authoritativeQualityScore',
  'authoritativeEntityType',
  "sourceSpecialty: typeof execution.sourceSpecialty === 'string'",
  'datasetSummaries',
  'DATASET UNDERSTANDING',
  "result.understandingConfidence == null ? 'غير متاح'",
  "result.evidenceStatus === 'VERIFIED' ? <CheckCircle2",
]) {
  if (!canonicalImportPage.includes(token)) throw new Error('Post-import truth UI closure missing: ' + token);
}
for (const token of ['postImportSignals', 'fetchDashboardIntelligence', 'WHAT HAPPENS NEXT']) {
  if (!canonicalImportPage.includes(token)) throw new Error(`Post-import signal surface contract missing: ${token}`);
}
for (const token of ['canonical_import_commits', 'reusedExistingCommit', 'CANONICAL_EXISTING_COMMIT_COUNT_MISMATCH']) {
  if (!canonicalImportServer.includes(token)) throw new Error(`Existing canonical commit recovery contract missing: ${token}`);
}
if (!canonicalImportServerWrapper.includes('executeCanonicalImport') || canonicalImportServerWrapper.includes('authoritativeDatasets') || canonicalImportServerWrapper.includes('reconcileForCanonical')) {
  throw new Error('Deployment wrapper must remain a thin adapter over the canonical server executor');
}
const queriesContractTokens = [
  'createDecisionWorkItem',
  'fetchDecisionWorkItem',
  'fetchDecisionWorkItems',
  'startDecisionWorkItem',
  'fetchRecommendationOutcome',
  'fetchRecommendationsBoundToImport',
  "create_decision_work_item",
  "start_decision_work_item",
];

for (const token of queriesContractTokens) {
  if (!queriesSource.includes(token)) throw new Error(`Decision work query contract missing: ${token}`);
}
const decisionWorkUi = decisionExperiencePage;
for (const token of ['Work Item', 'createDecisionWorkItem', 'fetchDecisionWorkItem', 'المستخدم الحالي', 'fetchRecommendationsBoundToImport']) {
  if (!decisionWorkUi.includes(token)) throw new Error(`Decision → Work Item/provenance UI contract missing: ${token}`);
}
const workCenterPage = readFileSync(new URL('../src/pages/WorkCenterPage.tsx', import.meta.url), 'utf8');
for (const token of ['fetchDecisionWorkItems', 'startDecisionWorkItem', 'DECISION WORK', 'بدء التنفيذ']) {
  if (!workCenterPage.includes(token)) throw new Error(`Work Center action contract missing: ${token}`);
}
for (const token of ['useSearchParams', 'focusedImportId', 'IMPORT CONTEXT', 'متابعة عملية الاستيراد الحالية']) {
  if (!workCenterPage.includes(token)) throw new Error('Work Center import-focus contract missing: ' + token);
}
if (!canonicalImportPage.includes('work-center?import=') || !canonicalImportPage.includes('متابعة مركز العمل')) {
  throw new Error('Canonical Import must carry the imported source into Work Center');
}
for (const token of ['key:\'actions\'', 'Evidence', 'التشغيل', 'decision-experience?stage=evidence&import=']) {
  if (!canonicalImportPage.includes(token)) throw new Error('Import history continuity contract missing: ' + token);
}
for (const token of ['fetchRecommendationOutcome', 'المتوقع مقابل الفعلي', 'لم تُثبت نتيجة تنفيذ']) {
  if (!decisionExperiencePage.includes(token)) throw new Error(`Decision outcome readback contract missing: ${token}`);
}

console.log('Canonical import mapping regression gate: PASS (canonical fields + full-source understanding + post-import evidence/decision continuity)');
const canonicalServerCore = readFileSync(new URL('../src/server/canonical-import-executor.ts', import.meta.url), 'utf8');
const vercelCanonicalImport = readFileSync(new URL('../api/canonical-import-execute.ts', import.meta.url), 'utf8');
const netlifyCanonicalImport = readFileSync(new URL('../netlify/functions/canonical-import-execute.mts', import.meta.url), 'utf8');
for (const token of ['executeCanonicalImport', 'CanonicalImportServerEnv', 'reusedExistingCommit: true', 'jobId: job.id']) {
  if (!canonicalServerCore.includes(token)) throw new Error('Canonical server execution core missing: ' + token);
}
for (const wrapper of [vercelCanonicalImport, netlifyCanonicalImport]) {
  if (!wrapper.includes('executeCanonicalImport')) throw new Error('Canonical import deployment wrapper must call the shared server executor');
  if (wrapper.includes('reconcileForCanonical') || wrapper.includes('runCanonicalImportThroughDurableRunner')) throw new Error('Canonical import wrappers must not duplicate server execution semantics');
}
if (!canonicalServerCore.includes('if (existingCommit)') || !canonicalServerCore.includes('jobId: job.id')) {
  throw new Error('Canonical idempotent reuse must return the authoritative import job id');
}

const browserBoundary = canonicalProductionAdapter.indexOf('if (isBrowserServerBoundary)');
const strictRowsValidation = canonicalProductionAdapter.indexOf("if (!input.rows.length) throw new Error('CANONICAL_IMPORT_REQUIRES_ROWS')");
if (browserBoundary < 0 || strictRowsValidation < 0 || browserBoundary > strictRowsValidation) {
  throw new Error('Canonical browser import must cross the authoritative server boundary before server-only row/quality validation');
}
if (!canonicalProductionAdapter.includes('const isBrowserServerBoundary = typeof window !== \'undefined\' && !options.serverExecution;')) {
  throw new Error('Canonical production adapter missing explicit browser/server-boundary classification');
}
