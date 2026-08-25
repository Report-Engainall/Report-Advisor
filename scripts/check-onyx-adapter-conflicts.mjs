import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const regressionTest = fileURLToPath(new URL('./onyx-adapter-conflict-regression.test.mjs', import.meta.url));

execFileSync(process.execPath, ['--experimental-strip-types', regressionTest], {
  stdio: 'inherit',
});
