export type AIRuntimeMode = 'hosted' | 'browser' | 'local' | 'auto';

export interface AIRuntimePolicy {
  mode: AIRuntimeMode;
  allowHosted: boolean;
  allowBrowserModels: boolean;
  allowLocalOllama: boolean;
  requireConsentForExternalData: boolean;
  neverSendBusinessDataToUntrustedProvider: boolean;
}

/**
 * Default product policy: hosted inference is the primary path, browser/local
 * inference is optional, and business facts remain deterministic regardless of
 * which language model is selected.
 */
export const DEFAULT_AI_RUNTIME_POLICY: AIRuntimePolicy = {
  mode: 'auto',
  allowHosted: true,
  allowBrowserModels: true,
  allowLocalOllama: false,
  requireConsentForExternalData: true,
  neverSendBusinessDataToUntrustedProvider: true,
};

export function shouldUseLocalAI(policy: AIRuntimePolicy): boolean {
  return policy.allowLocalOllama && (policy.mode === 'local' || policy.mode === 'auto');
}

export function shouldUseHostedAI(policy: AIRuntimePolicy): boolean {
  return policy.allowHosted && (policy.mode === 'hosted' || policy.mode === 'auto');
}
