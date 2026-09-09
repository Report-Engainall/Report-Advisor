import { describe, expect, it } from 'vitest';
import { deriveImportCounters } from './batch-folder';

describe('deriveImportCounters', () => {
  it('tracks invalid rows and committed valid rows without leaving valid_rows at zero', () => {
    expect(deriveImportCounters(100, 10, 40)).toEqual({
      processedRows: 50,
      validRows: 40,
      invalidRows: 10,
      duplicateRows: 0,
      progress: 50,
    });
  });

  it('reaches the PostgreSQL completion contract only when every row is processed', () => {
    expect(deriveImportCounters(100, 10, 90)).toEqual({
      processedRows: 100,
      validRows: 90,
      invalidRows: 10,
      duplicateRows: 0,
      progress: 100,
    });
  });

  it('rejects inconsistent counters instead of manufacturing progress', () => {
    expect(() => deriveImportCounters(100, 101, 0)).toThrow('IMPORT_COUNTER_INVALID');
    expect(() => deriveImportCounters(100, 10, -1)).toThrow('IMPORT_COUNTER_INVALID');
    expect(() => deriveImportCounters(100, 10, 95)).toThrow('IMPORT_COUNTER_INVALID');
    expect(() => deriveImportCounters(100, 10, 80, 15)).toThrow('IMPORT_COUNTER_INVALID');
  });
});
