import fs from 'node:fs';

const required = [
  'docs/MASTER_PRODUCT_REFERENCE.md',
  'docs/PRODUCT_INSPIRATION_MATRIX.md',
  'docs/MASTER_REQUIREMENTS_TRACEABILITY.md',
  'docs/FREE_OPEN_SOURCE_TOOLBOX.md',
  'docs/DOCUMENT_INGESTION_ACCURACY.md',
  'docs/FREE_FIRST_ARCHITECTURE.md',
  'docs/MULTI_TENANT_SECURITY.md',
  'src/lib/intelligence/truthPolicy.ts',
  'src/lib/intelligence/processingRouter.ts',
  'src/lib/intelligence/adaptiveProcessingPipeline.ts',
  'src/lib/free-toolbox/queryPlanner.ts',
  'src/lib/free-toolbox/query-executor.ts',
  'src/lib/free-toolbox/evidence-ledger.ts',
  'src/lib/free-toolbox/report-readiness.ts',
  'src/lib/free-toolbox/ocr-routing.ts',
  'services/document-intelligence/app/main.py'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing integrated foundation artifact: ${file}`);
}

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
if (!pkg.scripts?.typecheck) throw new Error('typecheck script missing');
if (!pkg.scripts?.build) throw new Error('build script missing');

const master = fs.readFileSync('docs/MASTER_PRODUCT_REFERENCE.md','utf8');
for (const token of ['AUTHORITATIVE SINGLE REFERENCE','deterministic business calculations','evidence/lineage','free-first/open-source-first']) {
  if (!master.includes(token)) throw new Error(`Master reference invariant missing: ${token}`);
}

const truth = fs.readFileSync('src/lib/intelligence/truthPolicy.ts','utf8');
for (const token of ['VERIFIED','QUALIFIED','INSUFFICIENT_DATA','BLOCKED','canDriveDecision']) {
  if (!truth.includes(token)) throw new Error(`Truth invariant missing: ${token}`);
}

const router = fs.readFileSync('src/lib/intelligence/processingRouter.ts','utf8');
for (const token of ['FAST','WORKER','DOCUMENT_AI','HEAVY_ANALYTICS','OFFLINE']) {
  if (!router.includes(token)) throw new Error(`Processing route invariant missing: ${token}`);
}

console.log(`Selective foundation integrity: PASS (${required.length} artifacts)`);
