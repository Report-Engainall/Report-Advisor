import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const queries = fs.readFileSync(path.join(process.cwd(), 'src/lib/queries.ts'), 'utf8');
const workCenter = fs.readFileSync(path.join(process.cwd(), 'src/pages/WorkCenterPage.tsx'), 'utf8');

describe('worker lease truth contract', () => {
  it('treats missing or malformed lease expiry as untrusted rather than healthy', () => {
    expect(queries).toContain('untrustedActive: number;');
    expect(queries).toContain('if (!row.lease_expires_at) {');
    expect(queries).toContain('if (Number.isNaN(expiresAt.getTime())) {');
    expect(queries).toContain('untrustedActive += 1;');
  });

  it('prioritizes untrusted worker state before expired leases in the UI action path', () => {
    expect(workCenter).toContain('(workerHealth?.untrustedActive ?? 0) > 0');
    expect(workCenter).toContain('بيانات العامل غير مكتملة');
    expect(workCenter).toContain('leases غير موثوقة');
  });
});
