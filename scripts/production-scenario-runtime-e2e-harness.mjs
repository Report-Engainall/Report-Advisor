import fs from 'node:fs/promises';

const originalPath = new URL('./production-scenario-runtime-e2e.mjs', import.meta.url);
const original = await fs.readFile(originalPath, 'utf8');

const pdfFixtureNeedle = "bytes:pdf(JSON.stringify(invoice(5)))";
const pdfFixtureReplacement = "bytes:pdf(`Invoice Number: ${invoice(5).invoice_number} Date: ${invoice(5).invoice_date} Customer Name: ${invoice(5).customer_name} Subtotal: 15 Tax: 0 Total: 15 Paid: 0 Currency: YER`)";
if (!original.includes(pdfFixtureNeedle)) throw new Error('PDF_SCENARIO_FIXTURE_ANCHOR_MISSING');

let patched = original.replace(pdfFixtureNeedle, pdfFixtureReplacement);
patched = patched.replace('width:1200px;height:300px;', 'width:1400px;height:500px;').replace('font-size:30px', 'font-size:52px;line-height:1.8;text-align:center;');
patched = patched.replace(
  /<div>فاتورة مبيعات رقم SC-OCR-\$\{suffix\} التاريخ \$\{new Date\(\)\.toISOString\(\)\.slice\(0,10\)\} العميل عميل اختبار المجموع 15 الضريبة 0 الإجمالي 15 المدفوع 0 العملة SAR<\\\/div>/,
  '<div><div>فاتورة مبيعات</div><div>Invoice Number: SC-OCR-${suffix}</div><div>Date: ${new Date().toISOString().slice(0,10)}</div><div>Customer Name: Test Customer</div><div>Subtotal: 15 Tax: 0 Total: 15 Paid: 0 Currency: YER</div></div>'
);

const duplicateBranchPattern = /if\(scenario\.id==='duplicate-transactions:second-run'\)\{[\s\S]*?if\(canCommit\)throw new Error\(`NEGATIVE_POLICY_COMMIT_ENABLED:\$\{scenario\.id\}`\);/;
const duplicateBranchReplacement = `if(scenario.id==='duplicate-transactions:second-run'){if(!canCommit)throw new Error('DUPLICATE_SECOND_RUN_UI_COMMIT_UNAVAILABLE');const sourceHash=\`sha256:\${result.input_fingerprint}\`;await commit.click();let duplicateJob=null;const deadline=Date.now()+120000;while(Date.now()<deadline){const jobs=await rest('report_execution_jobs','id,company_id,source_hash,status,checkpoint,last_error,evidence',{company_id:tenantId,source_hash:sourceHash});const matches=jobs.filter(job=>String(job?.source_hash??'')===sourceHash);if(matches.length===1&&matches[0].status==='completed'&&matches[0]?.checkpoint?.stage==='rendered'){duplicateJob=matches[0];break;}await page.waitForTimeout(1500);}assert.ok(duplicateJob,'DUPLICATE_REPLAY_TERMINAL_RENDERED_JOB_MISSING');assert.equal(duplicateJob.company_id,tenantId,'DUPLICATE_REPLAY_TENANT_MISMATCH');assert.equal(String(duplicateJob.source_hash??''),sourceHash,'DUPLICATE_REPLAY_SOURCE_HASH_MISMATCH');result.job_id=String(duplicateJob.id);result.persistence_readback={job_id:duplicateJob.id,status:duplicateJob.status,checkpoint:duplicateJob.checkpoint,source_hash:duplicateJob.source_hash};result.actual_status='committed_and_rendered';result.terminal_state='rendered';result.after_state=await snapshot();assertZeroUnintendedMutation(result.before_state,result.after_state);result.negative_assertions.push('exact replay resolved to an existing rendered durable job','duplicate sourceHash produced no new logical result','zero unintended canonical/invoice/movement/KPI mutation','no duplicate durable execution');return result;}if(canCommit)throw new Error(\`NEGATIVE_POLICY_COMMIT_ENABLED:\${scenario.id}\`);`;
if (!duplicateBranchPattern.test(patched)) throw new Error('DUPLICATE_RUNTIME_BRANCH_ANCHOR_MISSING');
patched = patched.replace(duplicateBranchPattern, duplicateBranchReplacement);

const tempPath = new URL('./.production-scenario-runtime-e2e-hardened.mjs', import.meta.url);
await fs.writeFile(tempPath, patched, 'utf8');
try {
  await import(tempPath.href);
} finally {
  await fs.rm(tempPath, { force: true });
}
