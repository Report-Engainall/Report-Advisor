import fs from 'node:fs';

const page = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
const panel = fs.readFileSync('src/components/ImportResolutionReviewPanel.tsx', 'utf8');
const writer = fs.readFileSync('src/lib/import/canonical-commit.mjs', 'utf8');

const required = [
  ['panel exposes decision callback', panel.includes('onDecision?:')],
  ['panel only offers exclusion for non-new outcomes', panel.includes("row.outcome !== 'new'") && panel.includes("'exclude'")],
  ['page stores row decisions', page.includes("useState<Record<string, Decision>>({})")],
  ['page requires explicit exclusion for blocked rows', page.includes("decisions[r.fingerprint] !== 'exclude'")],
  ['page writes only rows resolved as new', page.includes("resolutions[index]?.outcome === 'new'")],
  ['page passes decisions to review panel', page.includes('decisions={decisions} onDecision={setDecision}')],
  ['writer remains final server-authority boundary', writer.includes('resolveRows') && writer.includes('allowedToWrite')],
  ['page finalizes zero-write all-excluded imports', page.includes("p_status: 'completed'") && page.includes('committed: 0, excluded')],
  ['partial failures are represented when writes already happened', page.includes("p_status: committed > 0 ? 'partial' : 'failed'")],
];

const failures = required.filter(([, ok]) => !ok).map(([name]) => name);
if (failures.length) {
  console.error('Import resolution exclusion contract FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Import resolution exclusion contract: PASS (${required.length}/${required.length})`);
