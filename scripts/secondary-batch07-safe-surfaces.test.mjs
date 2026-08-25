import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const contract = readFileSync('src/lib/secondary-batch07-safe-surfaces.ts', 'utf8');
const palette = readFileSync('src/components/CommandPalette.tsx', 'utf8');

assert.match(contract, /SavedViewDefinition/);
assert.match(contract, /ExplainabilityModel/);
assert.match(contract, /AlternativeRecommendation/);
assert.match(contract, /DecisionSafetySummary/);
assert.match(contract, /UNKNOWN/);
assert.match(contract, /BLOCKED/);
assert.match(contract, /evidenceIds/);
assert.match(contract, /model\.state === 'LIVE'.*model\.evidenceIds\.length > 0/s);
assert.match(contract, /alternative\.state === 'LIVE' && alternative\.evidenceIds\.length > 0/);
assert.match(palette, /الأدلة/);
assert.match(palette, /إعادة تشغيل القرار/);
assert.match(palette, /مركز التحكم/);
assert.match(palette, /aria-activedescendant/);
assert.match(palette, /Home/);

console.log('secondary-batch07-safe-surfaces: PASS — static safety/accessibility contract checks');
