export type WorkforceRole =
  | 'management' | 'accounting' | 'sales' | 'procurement' | 'warehouse'
  | 'finance' | 'operations' | 'branch_manager' | 'auditor' | 'it_admin';

export interface RoutingContext {
  decisionType: string;
  department: string;
  tenantRole: WorkforceRole;
  tenantConfigKey: string;
  policyVersion: string;
}

export interface RoutedWork {
  responsibleRole: WorkforceRole;
  department: string;
  requiresApproval: boolean;
  slaMinutes: number;
  reason: string;
}

const ROLE_BY_DEPARTMENT: Record<string, WorkforceRole> = {
  management: 'management',
  accounting: 'accounting',
  sales: 'sales',
  procurement: 'procurement',
  warehouse: 'warehouse',
  finance: 'finance',
  operations: 'operations',
  branch: 'branch_manager',
  audit: 'auditor',
  it: 'it_admin',
};

const APPROVAL_REQUIRED = new Set([
  'purchase',
  'pricing_change',
  'credit_override',
  'writeoff',
  'policy_change',
]);

/** Deterministic routing only. AI may explain/rank but never invent authorization. */
export function routeRecommendation(ctx: RoutingContext): RoutedWork {
  const role = ROLE_BY_DEPARTMENT[ctx.department.toLowerCase()];
  if (!role) throw new Error('no deterministic workforce owner for department');
  if (!ctx.policyVersion || !ctx.tenantConfigKey) throw new Error('routing policy provenance required');

  const requiresApproval = APPROVAL_REQUIRED.has(ctx.decisionType);
  return {
    responsibleRole: role,
    department: ctx.department,
    requiresApproval,
    slaMinutes: requiresApproval ? 1440 : 480,
    reason: 'decision=' + ctx.decisionType + '; department=' + ctx.department + '; policy=' + ctx.policyVersion,
  };
}
