import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/pages/DataQualitySnapshotPage.tsx'), 'utf8');

describe('data quality entity score truth contract', () => {
  it('does not clamp an invalid entity score into a plausible percentage', () => {
    expect(page).toContain("const validScore=typeof e.score==='number'&&Number.isFinite(e.score)&&e.score>=0&&e.score<=100");
    expect(page).toContain("'غير موثوق'");
    expect(page).not.toContain('Math.max(0,Math.min(100,e.score))');
  });
});
