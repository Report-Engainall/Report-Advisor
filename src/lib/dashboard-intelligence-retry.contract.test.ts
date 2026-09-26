import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/dashboard-canonical.ts'), 'utf8');

describe('dashboard intelligence retry boundary contract', () => {
  const start = source.indexOf('export async function fetchDashboardIntelligence');
  const block = source.slice(start);

  it('retries transport/RPC failures before payload validation', () => {
    expect(block).toContain('payload = data;');
    expect(block).toContain('if (payload === null)');
    expect(block).toContain("REPORT_DATA_UNAVAILABLE: dashboard intelligence malformed");
    expect(block).not.toContain('requiredArray<Recommendation>(row.recommendations');
    expect(block).toContain('return {');
  });
});
