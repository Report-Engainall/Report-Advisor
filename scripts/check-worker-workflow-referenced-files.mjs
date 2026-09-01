import fs from 'node:fs';
const workflow = fs.readFileSync('.github/workflows/worker-hardening-contract.yml', 'utf8');
const files = [...workflow.matchAll(/run:\s+node(?:\s+--[^\s]+)*\s+(scripts\/[^\s]+)/g)].map((m) => m[1]);
const missing = files.filter((file) => !fs.existsSync(file));
if (missing.length) throw new Error(`WORKER_WORKFLOW_REFERENCED_FILE_MISSING:${missing.join(',')}`);
console.log(`WORKER_WORKFLOW_REFERENCED_FILES_PASS:${files.length}`);
