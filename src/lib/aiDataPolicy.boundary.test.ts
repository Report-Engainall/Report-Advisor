import { describe, expect, it } from 'vitest';
import { evaluateAIDataPolicy, evaluateAIDataPolicyForSession } from './aiDataPolicy';

const valid = { capability: 'chat' as const, tenantId: 'tenant-a', text: 'approved context', trustedProvider: true };

describe('AI data policy tenant boundaries', () => {
  it('rejects null, undefined and non-string requested tenant ids without throwing', () => {
    for (const tenantId of [null, undefined, 123]) {
      expect(() => evaluateAIDataPolicy({ ...valid, tenantId: tenantId as never })).not.toThrow();
      expect(evaluateAIDataPolicy({ ...valid, tenantId: tenantId as never }).allowed).toBe(false);
    }
  });
  it('rejects blank requested and authenticated tenant scopes', () => {
    expect(evaluateAIDataPolicy({ ...valid, tenantId: '   ' }).allowed).toBe(false);
    expect(evaluateAIDataPolicyForSession(valid, '   ').allowed).toBe(false);
  });
  it('matches normalized session scope but denies cross-tenant access', () => {
    expect(evaluateAIDataPolicyForSession(valid, ' tenant-a ').allowed).toBe(true);
    expect(evaluateAIDataPolicyForSession(valid, ' tenant-b ').allowed).toBe(false);
  });
  it('still blocks raw business rows after tenant validation', () => {
    expect(evaluateAIDataPolicy({ ...valid, includeRawBusinessRows: true }).allowed).toBe(false);
  });
});
