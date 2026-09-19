import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'src/pages/AlternativeGroupsPage.tsx'), 'utf8');
const helper = fs.readFileSync(path.join(root, 'src/lib/free-toolbox/alternative-group-security.ts'), 'utf8');

for (const token of ['create_alternative_item_group','add_alternative_item_group_member','remove_alternative_item_group_member']) {
  assert.ok(page.includes(token), `Alternative group UI contract missing: ${token}`);
}
for (const token of ['validateAlternativeGroupIsolation','filterTenantMembers','SKU_MULTIPLE_GROUPS']) {
  assert.ok(helper.includes(token), `Alternative group isolation contract missing: ${token}`);
}

console.log('alternative-schema contract: PASS (UI RPC surface + tenant isolation guard present)');
