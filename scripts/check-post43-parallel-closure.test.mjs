import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('post-43 canonical closure', () => {
  it('passes the repository boundary guard', () => {
    const output = execFileSync(process.execPath, ['scripts/check-post43-parallel-closure.mjs'], { encoding: 'utf8' });
    expect(output).toContain('POST43_CANONICAL_CLOSURE_PASS');
  });
});
