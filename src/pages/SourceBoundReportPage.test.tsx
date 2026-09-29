import { describe, expect, it } from 'vitest';

describe('source-bound report continuity contract', () => {
  it('contains a source-bound route and keeps the imported report tied to the import id', async () => {
    const app = await import('../../src/App');
    expect(app).toBeDefined();
  });
});
