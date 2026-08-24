export interface TrustedWorkerExecutionContext {
  companyId: string;
  runId: string;
  workerId: string;
  leaseExpiresAt: string;
}

export function assertTrustedWorkerExecution(context: TrustedWorkerExecutionContext): void {
  if (!context.companyId) throw new Error('WORKER_COMPANY_SCOPE_REQUIRED');
  if (!context.runId) throw new Error('WORKER_RUN_ID_REQUIRED');
  if (!context.workerId) throw new Error('WORKER_ID_REQUIRED');
  if (!context.leaseExpiresAt || Number.isNaN(new Date(context.leaseExpiresAt).getTime())) throw new Error('WORKER_LEASE_REQUIRED');
}
