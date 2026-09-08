import fs from 'node:fs';

const panel = fs.readFileSync(new URL('../src/components/ImportResolutionReviewPanel.tsx', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../src/pages/CanonicalImportPage.tsx', import.meta.url), 'utf8');
const canonical = fs.readFileSync(new URL('../src/lib/import/canonical-commit.ts', import.meta.url), 'utf8');

const assertions = [
  ['panel exposes new state', panel.includes("outcome === 'new'")],
  ['panel exposes exact-match state', panel.includes("outcome === 'skip_exact'")],
  ['panel exposes candidate-duplicate state', panel.includes("outcome === 'candidate_duplicate'")],
  ['panel exposes conflict state', panel.includes("outcome === 'conflict'")],
  ['page does not authorize blocked outcomes', page.includes("resolutions.some(r => r.outcome !== 'new')")],
  ['canonical boundary rejects blocked outcomes', canonical.includes("resolution.outcome !== 'new'")],
  ['canonical boundary requires write_new', canonical.includes("action !== 'write_new'")],
];

const failures = assertions.filter(([, ok]) => !ok).map(([name]) => name);
if (failures.length) {
  console.error('Import resolution decision contract: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Import resolution decision contract: PASS (${assertions.length} assertions)`);
