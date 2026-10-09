import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/report-value-cohort.mjs', 'utf8');
const workflow = fs.readFileSync('.github/workflows/report-value-cohort.yml', 'utf8');

assert.ok(source.includes("process.env.REPORT_ADVISOR_COHORT_COMPANY_IDS"), 'COHORT_COMPANY_SCOPE_ENV_REQUIRED');
assert.ok(source.includes("throw new Error('REPORT_VALUE_COHORT_COMPANY_SCOPE_REQUIRED')"), 'COHORT_MUST_FAIL_CLOSED_WITHOUT_TENANT_SCOPE');
assert.ok(source.includes("throw new Error('REPORT_VALUE_COHORT_COMPANY_SCOPE_INVALID')"), 'COHORT_MUST_VALIDATE_TENANT_IDS');
assert.ok(source.includes("p_company_id: companyId"), 'COHORT_RPC_CALLS_MUST_BE_TENANT_SCOPED');
assert.ok(source.includes('for (const companyId of cohortCompanyIds)'), 'COHORT_RPC_MUST_RUN_SEPARATELY_PER_TENANT');
assert.ok(source.includes('const seenSourceHashes = new Set();'), 'COHORT_MUST_DEDUPLICATE_IDENTICAL_SOURCE_HASHES_ACROSS_TENANTS');
assert.ok(workflow.includes('REPORT_ADVISOR_COHORT_COMPANY_IDS:'), 'COHORT_WORKFLOW_MUST_DECLARE_EXPLICIT_SCOPE');
assert.ok(workflow.includes('node scripts/report-value-cohort-scope-contract.test.mjs'), 'COHORT_SCOPE_CONTRACT_MUST_RUN_BEFORE_LIVE_COHORT');
console.log('REPORT_VALUE_COHORT_SCOPE_CONTRACT_PASS');
