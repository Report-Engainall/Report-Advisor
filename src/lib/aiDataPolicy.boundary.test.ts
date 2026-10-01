import { describe, expect, it } from 'vitest';
import { evaluateAIDataPolicy, evaluateAIDataPolicyForSession } from './aiDataPolicy';

const valid = { capability: 'chat' as const, tenantId: 'tenant-a', text: 'approved context', trustedProvider: true };

describe('AI data policy tenant boundaries', () => {
  it('rejects null tenant ids without throwing', () => expect(() => evaluateAIDataPolicy({ ...valid, tenantId: null as never })).not.toThrow());
  it('rejects undefined tenant ids without throwing', () => expect(() => evaluateAIDataPolicy({ ...valid, tenantId: undefined as never })).not.toThrow());
  it('rejects non-string tenant ids without throwing', () => expect(() => evaluateAIDataPolicy({ ...valid, tenantId: 123 as never })).not.toThrow());
  it('rejects empty tenant ids', () => expect(evaluateAIDataPolicy({ ...valid, tenantId: '' }).allowed).toBe(false));
  it('rejects whitespace-only tenant ids', () => expect(evaluateAIDataPolicy({ ...valid, tenantId: '   ' }).allowed).toBe(false));
  it('rejects missing authenticated tenant scope', () => expect(evaluateAIDataPolicyForSession(valid, '   ').allowed).toBe(false));
  it('rejects null authenticated tenant scope without throwing', () => expect(() => evaluateAIDataPolicyForSession(valid, null)).not.toThrow());
  it('rejects non-string authenticated tenant scope without throwing', () => expect(() => evaluateAIDataPolicyForSession(valid, 123 as never)).not.toThrow());
  it('matches session tenant after trimming transport whitespace', () => expect(evaluateAIDataPolicyForSession(valid, ' tenant-a ').allowed).toBe(true));
  it('rejects tenant mismatch after trimming', () => expect(evaluateAIDataPolicyForSession(valid, ' tenant-b ').allowed).toBe(false));
  it('rejects requested tenant before trim when non-string', () => expect(evaluateAIDataPolicyForSession({ ...valid, tenantId: null as never }, 'tenant-a').allowed).toBe(false));
  it('still rejects raw rows after tenant validation', () => expect(evaluateAIDataPolicy({ ...valid, includeRawBusinessRows: true }).allowed).toBe(false));
});
