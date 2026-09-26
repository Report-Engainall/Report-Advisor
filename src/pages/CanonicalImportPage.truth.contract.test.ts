import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/pages/CanonicalImportPage.tsx'), 'utf8');

describe('canonical import result truth contract', () => {
  it('does not turn a missing understanding confidence into synthetic zero confidence', () => {
    expect(page).toContain("result.understandingConfidence == null ? 'غير متاح'");
    expect(page).not.toContain('{result.understandingConfidence ?? 0}%');
  });

  it('does not turn an unknown persisted specialty into a generic specialty claim', () => {
    expect(page).toContain("SOURCE_DOMAIN_LABELS[result.sourceDomain as SourceDomain] ?? 'غير مثبت'");
    expect(page).not.toContain("SOURCE_DOMAIN_LABELS[result.sourceDomain as SourceDomain] ?? SOURCE_DOMAIN_LABELS['source-data']");
  });
});
