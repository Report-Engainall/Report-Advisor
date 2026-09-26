import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/queries.ts'), 'utf8');
const start = source.indexOf('export async function updateImportRecord');
const end = source.indexOf('\nconst MAX_IMPORT_RECORD_ROWS', start);
const updateImport = source.slice(start, end);

describe('import progress fail-closed contract', () => {
  it('rejects malformed progress instead of clamping it', () => {
    expect(updateImport).toContain("throw new Error('IMPORT_PROGRESS_INVALID')");
    expect(updateImport).toContain("typeof patch.progress !== 'number'");
    expect(updateImport).not.toContain('Math.min(100, Math.max(0, Number(patch.progress)))');
  });

  it('rejects malformed counters instead of coercing them', () => {
    expect(updateImport).toContain('IMPORT_COUNTER_INVALID');
    expect(updateImport).toContain('!Number.isInteger(value)');
    expect(updateImport).not.toContain('Math.trunc(patch.processed_rows)');
    expect(updateImport).not.toContain('Math.trunc(patch.valid_rows)');
    expect(updateImport).not.toContain('Math.trunc(patch.invalid_rows)');
    expect(updateImport).not.toContain('Math.trunc(patch.duplicate_rows)');
  });

  it('rejects monotonic counter regression rather than hiding it through clamping', () => {
    expect(updateImport).toContain("throw new Error('IMPORT_PROGRESS_COUNTER_REGRESSION')");
    expect(updateImport).toContain('processedRows < current.processed_rows');
    expect(updateImport).toContain('validRows < current.valid_rows');
    expect(updateImport).toContain('invalidRows < current.invalid_rows');
    expect(updateImport).toContain('duplicateRows < current.duplicate_rows');
    expect(updateImport).not.toContain('Math.max(current.processed_rows');
  });
});
