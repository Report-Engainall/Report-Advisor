import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/queries.ts'), 'utf8');

describe('top entity query bounds contract', () => {
  it('rejects invalid top-entity limits before applying slice semantics', () => {
    expect(source).toContain("throw new Error('REPORT_QUERY_INVALID_TOP_LIMIT')");
    expect(source).toContain('fetchTopCustomers(limit = 5)');
    expect(source).toContain('fetchTopProducts(limit = 5)');
    expect(source).not.toContain('fetchTopCustomers(limit = 5): Promise<TopEntity[]> { return (await fetchDashboardSnapshot(6)).topCustomers.slice(0, limit); }');
  });
});
