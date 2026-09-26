import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/dashboard-canonical.ts'), 'utf8');

describe('analytics snapshot status consistency contract', () => {
  it('rejects CALCULATED RFM/ABC/Aging snapshots with no rows', () => {
    expect(source).toContain("REPORT_DATA_MALFORMED:rfm.status_rows_mismatch");
    expect(source).toContain("REPORT_DATA_MALFORMED:abc.status_rows_mismatch");
    expect(source).toContain("REPORT_DATA_MALFORMED:aging.status_rows_mismatch");
    expect(source).toContain("status === 'CALCULATED' && rows.length === 0");
  });
});
