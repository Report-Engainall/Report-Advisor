import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/certification-evidence-boundary.yml', 'utf8');
const referenced = [...workflow.matchAll(/run:\s+node(?:\s+--[^\s]+)*\s+(scripts\/[^\s]+)/g)].map((match) => match[1]);
const missing = referenced.filter((file) => !fs.existsSync(file));

if (missing.length) {
  throw new Error(`CERTIFICATION_WORKFLOW_REFERENCED_FILE_MISSING:${missing.join(',')}`);
}

console.log(`CERTIFICATION_WORKFLOW_REFERENCED_FILES_PASS:${referenced.length}`);
