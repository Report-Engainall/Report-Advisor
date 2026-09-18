import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(
  path.join(process.cwd(), 'src/pages/CanonicalImportPage.tsx'),
  'utf8',
);

describe('import finish UI terminal-writer contract', () => {
  it('delegates terminal completion to the canonical durable boundary', () => {
    expect(page).toContain('runCanonicalImportThroughDurableRunner');
    expect(page).not.toContain("supabase.rpc('import_finish_job'");
  });

  it('allows only pre-boundary reconciliation failures to use the failure helper', () => {
    expect(page).toContain('finishCanonicalImportFailure');
    expect(page).toContain('!canonicalBoundaryStarted');
  });

  it('does not restore the legacy direct import-row update writer', () => {
    expect(page).not.toContain('updateImportRecord');
  });
});
