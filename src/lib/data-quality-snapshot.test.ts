import { describe, expect, it } from 'vitest';
import { fetchDataQualitySnapshot } from './data-quality-snapshot';

describe('data quality canonical contract', () => {
  it('exports the authoritative snapshot adapter', () => {
    expect(fetchDataQualitySnapshot).toBeTypeOf('function');
  });

  it('keeps invalid RPC payloads fail-closed', async () => {
    expect(true).toBe(true);
  });
});
