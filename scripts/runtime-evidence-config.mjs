export const RUNTIME_EVIDENCE_CONFIG = Object.freeze({
  requiredEnvironment: ['staging', 'test'],
  tenants: Object.freeze({
    a: 'TENANT_A_RUNTIME_SENTINEL_2026',
    b: 'TENANT_B_RUNTIME_SENTINEL_2026',
  }),
  users: Object.freeze({ a: 'RUNTIME_EVIDENCE_USER_A', b: 'RUNTIME_EVIDENCE_USER_B' }),
  requiredComponents: ['supabase_project', 'database', 'auth', 'rpc', 'seed_data'],
  optionalComponents: ['storage', 'realtime', 'workers'],
});

export function requireSafeRuntimeEnvironment(env = process.env) {
  const environment = String(env.RUNTIME_EVIDENCE_ENV ?? '').trim().toLowerCase();
  if (!RUNTIME_EVIDENCE_CONFIG.requiredEnvironment.includes(environment)) {
    throw new Error(
      `ABORT: RUNTIME_EVIDENCE_ENV must be staging or test; received ${environment || 'unset'}. ` +
      'No runtime evidence operation may run against an unknown or production environment.',
    );
  }
  if (['production', 'prod'].includes(environment)) {
    throw new Error('ABORT: destructive runtime evidence tests are forbidden in production.');
  }
  return environment;
}

export function requireAuthenticatedContext(context) {
  const required = ['actor', 'authorizedTenant', 'targetTenant', 'environment', 'release', 'commitSha'];
  const missing = required.filter((key) => !context?.[key]);
  if (missing.length) throw new Error(`NOT VERIFIED: missing runtime context: ${missing.join(', ')}`);
  if (!RUNTIME_EVIDENCE_CONFIG.requiredEnvironment.includes(String(context.environment).toLowerCase())) {
    throw new Error('NOT VERIFIED: runtime environment is not staging/test.');
  }
  return context;
}
