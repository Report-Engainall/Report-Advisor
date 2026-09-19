import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { normalizeBusinessKey } from '../src/lib/file-engine/business-key.ts';

const url = process.env.REPORT_ADVISOR_SUPABASE_URL;
const anon = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY;
const email = process.env.TEST_USER_A_EMAIL;
const password = process.env.TEST_USER_A_PASSWORD;

for (const [name, value] of Object.entries({ url, anon, email, password })) {
  if (!value) throw new Error(`BUSINESS_KEY_RUNTIME_SECRET_MISSING:${name}`);
}

const client = createClient(url, anon, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: authData, error: authError } = await client.auth.signInWithPassword({ email, password });
if (authError || !authData.session) throw new Error(`BUSINESS_KEY_RUNTIME_AUTH_FAILED:${authError?.message ?? 'session_missing'}`);

const samples = [
  ['AB 123', 'AB123'],
  ['AB123', 'AB123'],
  ['ab 123', 'AB123'],
  ['ＡＢ１２３', 'AB123'],
  ['أب ١٢٣', 'اب123'],
];

for (const [raw, expected] of samples) {
  const clientValue = normalizeBusinessKey(raw);
  assert.equal(clientValue, expected, `client normalizer mismatch for ${raw}`);
  const { data: dbValue, error } = await client.rpc('normalize_import_key', { input: raw });
  if (error) throw new Error(`BUSINESS_KEY_DB_RPC_FAILED:${raw}:${error.message}`);
  assert.equal(dbValue, expected, `DB normalizer mismatch for ${raw}`);
  assert.equal(dbValue, clientValue, `CLIENT_DB_NORMALIZER_DIVERGENCE:${raw}`);
}

console.log(JSON.stringify({
  exactHead: process.env.EXACT_HEAD || null,
  status: 'PASS',
  cases: samples.map(([raw, expected]) => ({ raw, expected })),
}, null, 2));
