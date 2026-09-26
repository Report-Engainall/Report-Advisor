import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/dashboard-canonical.ts'), 'utf8');

describe('dashboard period truth contract', () => {
  it('rejects an RPC response period that does not match the requested period', () => {
    expect(source).toContain("throw new Error('REPORT_DATA_MALFORMED:months_mismatch')");
    expect(source).toContain('responseMonths !== months');
  });
});
