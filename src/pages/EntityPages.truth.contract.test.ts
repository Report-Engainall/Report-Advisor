import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/pages/EntityPages.tsx'), 'utf8');

describe('entity pagination truth contract', () => {
  it('preserves unavailable counts instead of coercing them to zero', () => {
    expect(page).toContain('const [total, setTotal] = useState<number | null>(null);');
    expect(page).toContain('setTotal(result.count);');
    expect(page).not.toContain('setTotal(result.count ?? 0);');
  });

  it('does not render a synthetic total page count when the source count is unavailable', () => {
    expect(page).toContain('const totalPages = total == null ? null');
    expect(page).toContain('total == null ? products.length < PAGE_SIZE : page+1>=totalPages');
    expect(page).toContain('total == null ? customers.length < PAGE_SIZE : page+1>=totalPages');
  });
});
