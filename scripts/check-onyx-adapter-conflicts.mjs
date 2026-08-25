import { execFileSync } from 'node:child_process';

execFileSync(process.execPath, ['--experimental-strip-types', new URL('./onyx-adapter-conflict-regression.test.mjs', import.meta.url)], {
  stdio: 'inherit',
});
