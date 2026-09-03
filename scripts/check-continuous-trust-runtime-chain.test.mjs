import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import { validateTrustRuntimePersistence } from './check-continuous-trust-runtime-chain.mjs';

const sql = fs.readFileSync('supabase/migrations/20260825090000_continuous_trust_autonomous_ops.sql', 'utf8');
assert.doesNotThrow(() => validateTrustRuntimePersistence(sql));

const weakened = sql.replace('tenant_isolation_canary_runs', 'tenant_isolation_canary_missing');
assert.throws(() => validateTrustRuntimePersistence(weakened), /Trust persistence missing/);

console.log('Continuous trust runtime-chain test-of-test: PASS (canonical table accepted; deliberately weakened table rejected).');
