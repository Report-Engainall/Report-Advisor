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
  it('rejects unsupported capability values at runtime', () => {
    expect(evaluateAIDataPolicy({ ...valid, capability: 'sql' } as never).reason).toBe('AI capability is not supported');
  });
  it('rejects malformed policy records and coercible security flags', () => {
    expect(evaluateAIDataPolicy(null as never).allowed).toBe(false);
    expect(evaluateAIDataPolicy([] as never).allowed).toBe(false);
    expect(evaluateAIDataPolicy({ ...valid, includeRawBusinessRows: 'false' } as never).reason).toBe('Raw business row flag is invalid');
    expect(evaluateAIDataPolicy({ ...valid, trustedProvider: 'true' } as never).reason).toBe('Provider approval flag is invalid');
  });
  it('rejects non-text context instead of relying on optional chaining coercion', () => {
    expect(evaluateAIDataPolicy({ ...valid, text: 123 } as never).reason).toBe('Approved context must be text');
  });
  it('requires an authenticated tenant for session-bound authorization', () => {
    expect(evaluateAIDataPolicyForSession(valid, null).reason).toBe('Authenticated tenant scope is required');
    expect(evaluateAIDataPolicyForSession(valid, undefined).reason).toBe('Authenticated tenant scope is required');
  });
});
