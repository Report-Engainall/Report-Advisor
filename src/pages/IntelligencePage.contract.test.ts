import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('intelligence decision handoff contract', () => {
  const page = readFileSync(resolve(process.cwd(), 'src/pages/IntelligencePage.tsx'), 'utf8');

  it('routes acceptance into the governed decision experience', () => {
    expect(page).toContain('/decision-experience?stage=decision&recommendationId=');
    expect(page).toContain('بدء مسار القرار');
    expect(page).not.toContain("updateRecommendationStatus(recommendationId, 'accepted')");
  });

  it('keeps direct rejection as the only immediate terminal transition from the new queue', () => {
    expect(page).toContain("updateRecommendationStatus(recommendationId, 'rejected')");
  });
});
