import { spawnSync } from 'node:child_process';
import path from 'node:path';

const script = path.join(process.cwd(), 'scripts', 'check-rpc-membership-hardening.mjs');
const result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
if (result.status !== 0) {
  console.error(result.stdout);
  console.error(result.stderr);
  process.exit(result.status ?? 1);
}
if (!/RPC membership hardening PASS:/i.test(result.stdout)) {
  throw new Error('RPC_HARDENING_GUARD_DID_NOT_ASSERT_PASS');
}
console.log('RPC membership hardening regression test PASS');
