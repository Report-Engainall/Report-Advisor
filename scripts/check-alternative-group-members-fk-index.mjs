import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = 'supabase/migrations/20260905164300_index_alternative_item_group_members_group_id.sql';
const source = readFileSync(migration, 'utf8');

assert.match(source, /create index if not exists alternative_item_group_members_group_id_idx/i);
assert.match(source, /on public\.alternative_item_group_members \(group_id\)/i);
assert.ok(!/grant\s+/i.test(source), 'index migration must not change privileges');
assert.ok(!/security\s+definer/i.test(source), 'index migration must not introduce SECURITY DEFINER');

console.log('alternative group membership FK index contract: PASS');
