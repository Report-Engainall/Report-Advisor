import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const scripts = pkg.scripts ?? {};
const missing = [];
const malformed = [];

for (const [name, command] of Object.entries(scripts)) {
  if (typeof command !== 'string') {
    malformed.push(name);
    continue;
  }
  const matches = [...command.matchAll(/(?:^|\s)(?:node|tsx|ts-node)\s+(scripts\/[^\s&;]+)/g)];
  for (const match of matches) {
    const file = match[1].replace(/["'`),]+$/, '');
    if (!fs.existsSync(file)) missing.push(`${name} -> ${file}`);
  }
}

if (malformed.length || missing.length) {
  if (malformed.length) console.error(`Malformed package scripts: ${malformed.join(', ')}`);
  if (missing.length) console.error(`Missing script targets:\n${missing.join('\n')}`);
  process.exit(1);
}

const workflowDir = '.github/workflows';
const workflows = fs.existsSync(workflowDir) ? fs.readdirSync(workflowDir).filter(f => /\.(yml|yaml)$/.test(f)) : [];
if (!workflows.includes('quality.yml')) throw new Error('Canonical quality workflow is missing');

const quality = fs.readFileSync(`${workflowDir}/quality.yml`, 'utf8');
const referencedScripts = [];
for (const line of quality.split(/\r?\n/)) {
  const npmMatch = line.match(/npm\s+run\s+([\w:-]+)/);
  if (npmMatch) referencedScripts.push(npmMatch[1]);

  const nodeMatch = line.match(/\bnode(?:\s+--[^\s]+)*\s+(scripts\/[^\s&;]+)/);
  if (nodeMatch) referencedScripts.push(nodeMatch[1]);
}

const unknownPackageScripts = referencedScripts.filter(name => !name.startsWith('scripts/') && !scripts[name]);
if (unknownPackageScripts.length) {
  throw new Error(`Workflow references unknown package scripts: ${[...new Set(unknownPackageScripts)].join(', ')}`);
}

console.log(`Execution registry integrity: PASS (${Object.keys(scripts).length} package scripts, ${workflows.length} workflows)`);
