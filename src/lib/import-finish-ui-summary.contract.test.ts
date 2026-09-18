import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(
  path.join(process.cwd(), 'src/pages/CanonicalImportPage.tsx'),
  'utf8',
);

describe('import finish UI summary contract', () => {
  it('sends the authoritative completion counters expected by import_finish_job', () => {
    expect(page).toContain('committed: validRows.length');
    expect(page).toContain('invalidRows: rows.length - validRows.length');
  });

  it('rejects the legacy non-authoritative counter names for terminal completion', () => {
    const weakened = page
      .replace('committed: validRows.length', 'valid_rows: validRows.length')
      .replace('invalidRows: rows.length - validRows.length', 'invalid_rows: rows.length - validRows.length');

    expect(weakened).not.toContain('committed: validRows.length');
    expect(weakened).not.toContain('invalidRows: rows.length - validRows.length');
  });
});
