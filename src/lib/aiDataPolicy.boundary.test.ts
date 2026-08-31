import { describe, expect, it } from 'vitest';
import { evaluateAIDataPolicy, evaluateAIDataPolicyForSession } from './aiDataPolicy';

const valid = { capability: 'chat' as const, tenantId: 'tenant-a', text: 'approved context', trustedProvider: true };

describe('AI data policy tenant boundaries', () => {
  it('rejects whitespace-only tenant ids', () => expect(evaluateAIDataPolicy({ ...valid, tenantId: '   ' }).allowed).toBe(false));
  it('rejects missing authenticated tenant scope', () => expect(evaluateAIDataPolicyForSession(valid, '   ').allowed).toBe(false));
  it('matches session tenant after trimming transport whitespace', () => expect(evaluateAIDataPolicyForSession(valid, ' tenant-a ').allowed).toBe(true));
  it('rejects tenant mismatch after trimming', () => expect(evaluateAIDataPolicyForSession(valid, ' tenant-b ').allowed).toBe(false));
  it('still rejects raw rows after tenant validation', () => expect(evaluateAIDataPolicy({ ...valid, includeRawBusinessRows: true }).allowed).toBe(false));
});
