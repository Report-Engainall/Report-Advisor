export interface AIDataPolicyInput {
  capability: 'chat' | 'embedding' | 'document' | 'ocr';
  tenantId: string;
  text?: string;
  includeRawBusinessRows?: boolean;
  trustedProvider?: boolean;
}

export interface AIDataPolicyDecision {
  allowed: boolean;
  reason: string;
  payloadMode: 'none' | 'redacted-context' | 'approved-context';
}

const hasTenantScope = (tenantId: unknown): tenantId is string => typeof tenantId === 'string' && tenantId.trim().length > 0;
const capabilities = new Set<AIDataPolicyInput['capability']>(['chat', 'embedding', 'document', 'ocr']);

function invalid(reason: string): AIDataPolicyDecision { return { allowed: false, reason, payloadMode: 'none' }; }

/**
 * Hosted AI is not allowed to receive arbitrary database rows. Callers must
 * first construct a minimal, approved context or use deterministic tools.
 */
export function evaluateAIDataPolicy(input: AIDataPolicyInput): AIDataPolicyDecision {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return invalid('AI policy input is required');
  if (!capabilities.has(input.capability)) return invalid('AI capability is not supported');
  if (!hasTenantScope(input.tenantId)) return invalid('Tenant scope is required');
  if (input.includeRawBusinessRows !== undefined && typeof input.includeRawBusinessRows !== 'boolean') return invalid('Raw business row flag is invalid');
  if (input.includeRawBusinessRows === true) return invalid('Raw business rows are not allowed in hosted AI context');
  if (input.trustedProvider !== undefined && typeof input.trustedProvider !== 'boolean') return invalid('Provider approval flag is invalid');
  if (input.trustedProvider !== true) return invalid('Provider is not approved for company data');
  if (input.text !== undefined && typeof input.text !== 'string') return invalid('Approved context must be text');
  if (!input.text?.trim()) return invalid('Approved context is empty');
  return { allowed: true, reason: 'Approved minimum context', payloadMode: 'approved-context' };
}

/**
 * Session-bound entry point. A caller-controlled tenant id must never be
 * sufficient to authorize AI access; the authenticated session tenant is the
 * authority and must match the requested tenant before the existing policy
 * is evaluated.
 */
export function evaluateAIDataPolicyForSession(input: AIDataPolicyInput, authenticatedTenantId: string | null | undefined): AIDataPolicyDecision {
  if (!hasTenantScope(authenticatedTenantId)) return invalid('Authenticated tenant scope is required');
  if (!input || typeof input !== 'object' || Array.isArray(input)) return invalid('AI policy input is required');
  if (!hasTenantScope(input.tenantId)) return invalid('Requested tenant scope is required');
  if (input.tenantId.trim() !== authenticatedTenantId.trim()) return invalid('Requested tenant does not match authenticated tenant');
  return evaluateAIDataPolicy(input);
}
