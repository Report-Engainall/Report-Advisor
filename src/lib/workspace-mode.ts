export type WorkspaceMode = 'essential' | 'advanced' | 'expert';

export const WORKSPACE_MODE_KEY = 'report-advisor.workspace-mode';

const advancedPaths = new Set([
  '/analytics',
  '/reports/inventory-intelligence',
  '/reports/demand-velocity',
  '/reports/profitability',
  '/analytics/rfm',
  '/analytics/abc',
  '/analytics/aging',
  '/intelligence',
  '/intelligence/recommendations',
  '/intelligence/forecasts',
  '/intelligence/scenarios',
  '/metrics',
  '/alternative-groups',
]);

const expertOnlyPaths = new Set(['/proposal-demo']);

export function readWorkspaceMode(): WorkspaceMode {
  if (typeof window === 'undefined') return 'essential';
  const saved = window.localStorage.getItem(WORKSPACE_MODE_KEY);
  return saved === 'advanced' || saved === 'expert' ? saved : 'essential';
}

export function isWorkspacePathVisible(path: string, mode: WorkspaceMode): boolean {
  if (mode === 'expert') return true;
  if (expertOnlyPaths.has(path)) return false;
  if (mode === 'advanced') return true;
  return !advancedPaths.has(path);
}
