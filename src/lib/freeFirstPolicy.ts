/**
 * Free-first / no-surprise-cost policy primitives.
 * Framework-agnostic and side-effect free: this module never calls providers.
 * Paid services are never selected implicitly.
 */

export type ProviderCost = 'free' | 'self-hosted' | 'paid' | 'unknown';
export type ProviderDecision = 'allow' | 'block' | 'require-explicit-consent';

export interface ProviderPolicyInput {
  cost: ProviderCost;
  explicitlyEnabled?: boolean;
  locallyAvailable?: boolean;
  capabilityRequired?: boolean;
}

export interface ProviderPolicyResult {
  decision: ProviderDecision;
  reason: string;
}

export function evaluateProviderPolicy(input: ProviderPolicyInput): ProviderPolicyResult {
  if (!input.capabilityRequired) {
    return { decision: 'block', reason: 'Capability is not required; no provider call is justified.' };
  }
  if (input.cost === 'free' || input.cost === 'self-hosted') {
    if (input.locallyAvailable === false) {
      return { decision: 'block', reason: 'Free/self-hosted provider is unavailable; no paid fallback is allowed.' };
    }
    return { decision: 'allow', reason: 'Provider is free or self-hosted and explicitly within the allowed policy.' };
  }
  if (input.cost === 'paid') {
    return input.explicitlyEnabled
      ? { decision: 'require-explicit-consent', reason: 'Paid provider requires explicit user/admin enablement.' }
      : { decision: 'block', reason: 'Paid provider is disabled by default; silent paid fallback is forbidden.' };
  }
  return { decision: 'block', reason: 'Unknown provider cost is unsafe and cannot be selected implicitly.' };
}
