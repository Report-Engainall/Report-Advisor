export type WorkspaceRolePreset =
  | 'owner'
  | 'finance'
  | 'sales'
  | 'collections'
  | 'inventory'
  | 'operations'
  | 'analyst'
  | 'import';

export type WorkspaceSectionId =
  | 'today'
  | 'operations'
  | 'money'
  | 'intelligence'
  | 'reports'
  | 'reference'
  | 'admin';

export type DashboardWidgetId =
  | 'signals'
  | 'kpis'
  | 'trend'
  | 'attention'
  | 'decisions'
  | 'portfolios'
  | 'workpaths';

export interface WorkspacePreferences {
  hiddenPaths: string[];
  favoritePaths: string[];
  defaultLanding: string;
  sectionOrder: WorkspaceSectionId[];
  rolePreset: WorkspaceRolePreset;
  dashboardWidgets: DashboardWidgetId[];
}

export const WORKSPACE_PREFERENCES_KEY = 'report-advisor.workspace-preferences';

export const DEFAULT_SECTION_ORDER: WorkspaceSectionId[] = [
  'today',
  'operations',
  'money',
  'intelligence',
  'reports',
  'reference',
  'admin',
];

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetId[] = [
  'signals',
  'kpis',
  'trend',
  'attention',
  'decisions',
  'portfolios',
  'workpaths',
];

export const DEFAULT_WORKSPACE_PREFERENCES: WorkspacePreferences = {
  hiddenPaths: [],
  favoritePaths: ['/reports/receivables', '/inventory', '/decision-experience'],
  defaultLanding: '/',
  sectionOrder: DEFAULT_SECTION_ORDER,
  rolePreset: 'owner',
  dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
};

const PRESET_HIDDEN_PATHS: Record<WorkspaceRolePreset, string[]> = {
  owner: [],
  finance: ['/analytics/rfm', '/analytics/abc', '/alternative-groups', '/proposal-demo'],
  sales: ['/reports/purchases', '/reports/inventory', '/reports/inventory-intelligence', '/analytics/abc'],
  collections: ['/reports/purchases', '/inventory', '/analytics/abc', '/analytics/rfm', '/proposal-demo'],
  inventory: ['/reports/receivables', '/analytics/rfm', '/analytics/aging', '/proposal-demo'],
  operations: ['/analytics/rfm', '/analytics/abc', '/proposal-demo'],
  analyst: [],
  import: ['/reports/receivables', '/reports/profitability', '/reports/purchases', '/analytics/rfm', '/analytics/abc', '/proposal-demo'],
};

const asUnique = (items: string[]) => [...new Set(items.filter(Boolean))];

function storageKey(companyId: string | null | undefined): string {
  return companyId ? `${WORKSPACE_PREFERENCES_KEY}:${companyId}` : WORKSPACE_PREFERENCES_KEY;
}

function normalize(value: unknown): WorkspacePreferences {
  if (!value || typeof value !== 'object') return { ...DEFAULT_WORKSPACE_PREFERENCES };
  const row = value as Partial<WorkspacePreferences>;
  const sectionOrder = Array.isArray(row.sectionOrder)
    ? row.sectionOrder.filter((item): item is WorkspaceSectionId => DEFAULT_SECTION_ORDER.includes(item as WorkspaceSectionId))
    : DEFAULT_SECTION_ORDER;
  const mergedOrder = [...sectionOrder, ...DEFAULT_SECTION_ORDER.filter(item => !sectionOrder.includes(item))];

  return {
    hiddenPaths: Array.isArray(row.hiddenPaths) ? asUnique(row.hiddenPaths) : [],
    favoritePaths: Array.isArray(row.favoritePaths) ? asUnique(row.favoritePaths) : DEFAULT_WORKSPACE_PREFERENCES.favoritePaths,
    defaultLanding: typeof row.defaultLanding === 'string' ? row.defaultLanding : '/',
    sectionOrder: mergedOrder,
    rolePreset: row.rolePreset && Object.prototype.hasOwnProperty.call(PRESET_HIDDEN_PATHS, row.rolePreset) ? row.rolePreset : 'owner',
    dashboardWidgets: Array.isArray(row.dashboardWidgets)
      ? asUnique(row.dashboardWidgets).filter((item): item is DashboardWidgetId => DEFAULT_DASHBOARD_WIDGETS.includes(item as DashboardWidgetId))
      : DEFAULT_DASHBOARD_WIDGETS,
  };
}

export function readWorkspacePreferences(companyId: string | null | undefined): WorkspacePreferences {
  if (typeof window === 'undefined') return { ...DEFAULT_WORKSPACE_PREFERENCES };
  try {
    const raw = window.localStorage.getItem(storageKey(companyId));
    return normalize(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_WORKSPACE_PREFERENCES };
  }
}

export function writeWorkspacePreferences(
  companyId: string | null | undefined,
  preferences: WorkspacePreferences,
): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(companyId), JSON.stringify(normalize(preferences)));
  window.dispatchEvent(new CustomEvent('report-advisor:workspace-preferences', { detail: preferences }));
}

export function resetWorkspacePreferences(companyId: string | null | undefined): WorkspacePreferences {
  const next = { ...DEFAULT_WORKSPACE_PREFERENCES, sectionOrder: [...DEFAULT_SECTION_ORDER], dashboardWidgets: [...DEFAULT_DASHBOARD_WIDGETS] };
  writeWorkspacePreferences(companyId, next);
  return next;
}

export function preferencesForRole(
  current: WorkspacePreferences,
  rolePreset: WorkspaceRolePreset,
): WorkspacePreferences {
  const hiddenPaths = PRESET_HIDDEN_PATHS[rolePreset];
  const defaultLanding =
    rolePreset === 'finance' ? '/reports/profitability'
      : rolePreset === 'sales' ? '/reports/sales'
        : rolePreset === 'collections' ? '/reports/receivables'
          : rolePreset === 'inventory' ? '/inventory'
            : rolePreset === 'operations' ? '/work-center'
              : rolePreset === 'analyst' ? '/analytics'
                : rolePreset === 'import' ? '/import'
                  : '/';

  return {
    ...current,
    rolePreset,
    hiddenPaths,
    defaultLanding,
  };
}

export function isDashboardWidgetVisible(
  id: DashboardWidgetId,
  preferences: WorkspacePreferences,
): boolean {
  return preferences.dashboardWidgets.includes(id);
}

export function moveSection(
  order: WorkspaceSectionId[],
  section: WorkspaceSectionId,
  direction: -1 | 1,
): WorkspaceSectionId[] {
  const next = [...order];
  const index = next.indexOf(section);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
