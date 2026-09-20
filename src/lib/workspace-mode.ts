export type WorkspaceMode = 'essential' | 'advanced' | 'expert';

export type WorkspacePreset =
  | 'owner-executive'
  | 'finance'
  | 'sales'
  | 'collections'
  | 'inventory'
  | 'operations'
  | 'analyst'
  | 'data-import';

export type DashboardWidgetId = 'kpis' | 'analysis' | 'attention' | 'entities' | 'work-paths';

export interface WorkspacePreferences {
  mode: WorkspaceMode;
  preset: WorkspacePreset;
  defaultLandingPath: string;
  hiddenPaths: string[];
  favoritePaths: string[];
  sectionOrder: string[];
  dashboardWidgets: DashboardWidgetId[];
}

export const WORKSPACE_MODE_KEY = 'report-advisor.workspace-mode';
export const WORKSPACE_PREFERENCES_KEY = 'report-advisor.workspace-preferences';

export const DEFAULT_SECTION_ORDER = [
  'today',
  'operations',
  'money',
  'customers-products',
  'intelligence',
  'reports',
  'admin',
] as const;

export const WORKSPACE_ROUTE_OPTIONS = [
  { path: '/', label: 'لوحة اليوم' },
  { path: '/work-center', label: 'مركز العمل' },
  { path: '/command-center', label: 'مركز القيادة' },
  { path: '/import', label: 'الاستيراد' },
  { path: '/reports/sales', label: 'المبيعات' },
  { path: '/reports/receivables', label: 'الذمم والتحصيل' },
  { path: '/reports/profitability', label: 'الربحية' },
  { path: '/inventory', label: 'المخزون' },
  { path: '/decision-experience', label: 'قرار اليوم' },
  { path: '/reports/executive', label: 'التقرير التنفيذي' },
  { path: '/data-quality', label: 'جودة البيانات' },
  { path: '/analytics', label: 'التحليلات' },
  { path: '/metrics', label: 'تفسير المقاييس' },
] as const;

export const WORKSPACE_MODULE_GROUPS = [
  { id: 'operations', label: 'التشغيل', paths: ['/work-center', '/import', '/import/analyze', '/data-quality', '/connections'] },
  { id: 'money', label: 'المال', paths: ['/reports/sales', '/reports/purchases', '/reports/receivables', '/reports/profitability'] },
  { id: 'customers-products', label: 'العملاء والمنتجات', paths: ['/customers', '/products', '/inventory', '/alternative-groups'] },
  { id: 'intelligence', label: 'القرار والذكاء', paths: ['/intelligence/recommendations', '/intelligence/forecasts', '/intelligence/scenarios', '/analytics/rfm', '/analytics/abc', '/analytics/aging', '/metrics'] },
  { id: 'reports', label: 'التقارير والتحليلات', paths: ['/reports', '/reports/executive', '/reports/inventory', '/reports/inventory-intelligence', '/reports/demand-velocity', '/analytics'] },
  { id: 'admin', label: 'الإدارة المتقدمة', paths: ['/onboarding', '/settings', '/settings/profile', '/proposal-demo'] },
] as const;

export const DASHBOARD_WIDGET_OPTIONS: Array<{ id: DashboardWidgetId; label: string }> = [
  { id: 'kpis', label: 'بطاقات المؤشرات' },
  { id: 'analysis', label: 'لوحة الإثبات والتحليل' },
  { id: 'attention', label: 'الانتباه وطابور القرار' },
  { id: 'entities', label: 'العملاء والمنتجات وأعمار الذمم' },
  { id: 'work-paths', label: 'مسارات العمل' },
];

const ADVANCED_PATHS = new Set([
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
const EXPERT_ONLY_PATHS = new Set(['/proposal-demo']);

const normalizeList = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.filter(item => typeof item === 'string'))] : [];

const normalizeWidgetList = (value: unknown): DashboardWidgetId[] =>
  normalizeList(value).filter((item): item is DashboardWidgetId =>
    DASHBOARD_WIDGET_OPTIONS.some(option => option.id === item)
  );

export const DEFAULT_WORKSPACE_PREFERENCES: WorkspacePreferences = {
  mode: 'essential',
  preset: 'owner-executive',
  defaultLandingPath: '/',
  hiddenPaths: [],
  favoritePaths: ['/work-center', '/import', '/decision-experience', '/reports/executive'],
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  dashboardWidgets: DASHBOARD_WIDGET_OPTIONS.map(option => option.id),
};

const PRESETS: Record<WorkspacePreset, WorkspacePreferences> = {
  'owner-executive': { ...DEFAULT_WORKSPACE_PREFERENCES, preset: 'owner-executive', defaultLandingPath: '/command-center', favoritePaths: ['/', '/command-center', '/decision-experience', '/reports/executive'] },
  finance: { ...DEFAULT_WORKSPACE_PREFERENCES, mode: 'advanced', preset: 'finance', defaultLandingPath: '/reports/profitability', favoritePaths: ['/reports/profitability', '/reports/receivables', '/reports/sales', '/metrics'] },
  sales: { ...DEFAULT_WORKSPACE_PREFERENCES, mode: 'advanced', preset: 'sales', defaultLandingPath: '/reports/sales', favoritePaths: ['/reports/sales', '/customers', '/products', '/analytics/rfm'] },
  collections: { ...DEFAULT_WORKSPACE_PREFERENCES, mode: 'advanced', preset: 'collections', defaultLandingPath: '/reports/receivables', favoritePaths: ['/reports/receivables', '/work-center', '/customers', '/reports/executive'] },
  inventory: { ...DEFAULT_WORKSPACE_PREFERENCES, mode: 'advanced', preset: 'inventory', defaultLandingPath: '/inventory', favoritePaths: ['/inventory', '/reports/inventory-intelligence', '/reports/demand-velocity', '/products'] },
  operations: { ...DEFAULT_WORKSPACE_PREFERENCES, mode: 'advanced', preset: 'operations', defaultLandingPath: '/work-center', favoritePaths: ['/work-center', '/import', '/data-quality', '/connections'] },
  analyst: { ...DEFAULT_WORKSPACE_PREFERENCES, mode: 'advanced', preset: 'analyst', defaultLandingPath: '/analytics', favoritePaths: ['/analytics', '/metrics', '/intelligence/scenarios', '/data-quality'] },
  'data-import': { ...DEFAULT_WORKSPACE_PREFERENCES, mode: 'expert', preset: 'data-import', defaultLandingPath: '/import', favoritePaths: ['/import', '/import/analyze', '/data-quality', '/connections'] },
};

const isPreset = (value: unknown): value is WorkspacePreset => Object.prototype.hasOwnProperty.call(PRESETS, value);
const isMode = (value: unknown): value is WorkspaceMode => value === 'essential' || value === 'advanced' || value === 'expert';

function coercePreferences(input: Partial<WorkspacePreferences> | null | undefined): WorkspacePreferences {
  const sections = normalizeList(input?.sectionOrder).filter(item => DEFAULT_SECTION_ORDER.includes(item as typeof DEFAULT_SECTION_ORDER[number]));
  const sectionOrder = [...sections, ...DEFAULT_SECTION_ORDER.filter(item => !sections.includes(item))];
  const widgets = normalizeWidgetList(input?.dashboardWidgets);
  return {
    ...DEFAULT_WORKSPACE_PREFERENCES,
    ...input,
    mode: isMode(input?.mode) ? input.mode : DEFAULT_WORKSPACE_PREFERENCES.mode,
    preset: isPreset(input?.preset) ? input.preset : DEFAULT_WORKSPACE_PREFERENCES.preset,
    defaultLandingPath: typeof input?.defaultLandingPath === 'string' ? input.defaultLandingPath : DEFAULT_WORKSPACE_PREFERENCES.defaultLandingPath,
    hiddenPaths: normalizeList(input?.hiddenPaths),
    favoritePaths: normalizeList(input?.favoritePaths),
    sectionOrder,
    dashboardWidgets: widgets.length ? widgets : DEFAULT_WORKSPACE_PREFERENCES.dashboardWidgets,
  };
}

export function readWorkspacePreferences(): WorkspacePreferences {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACE_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(WORKSPACE_PREFERENCES_KEY);
    return raw ? coercePreferences(JSON.parse(raw) as Partial<WorkspacePreferences>) : DEFAULT_WORKSPACE_PREFERENCES;
  } catch {
    return DEFAULT_WORKSPACE_PREFERENCES;
  }
}

export function writeWorkspacePreferences(next: Partial<WorkspacePreferences>): WorkspacePreferences {
  const merged = coercePreferences({ ...readWorkspacePreferences(), ...next });
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(WORKSPACE_PREFERENCES_KEY, JSON.stringify(merged));
    window.localStorage.setItem(WORKSPACE_MODE_KEY, merged.mode);
    window.dispatchEvent(new Event('report-advisor:workspace-preferences'));
    window.dispatchEvent(new Event('report-advisor:workspace-mode'));
  }
  return merged;
}

export function resetWorkspacePreferences(): WorkspacePreferences {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(WORKSPACE_PREFERENCES_KEY);
    window.localStorage.removeItem(WORKSPACE_MODE_KEY);
  }
  return writeWorkspacePreferences(DEFAULT_WORKSPACE_PREFERENCES);
}

export function applyWorkspacePreset(preset: WorkspacePreset): WorkspacePreferences {
  return writeWorkspacePreferences(PRESETS[preset]);
}

export function readWorkspaceMode(): WorkspaceMode {
  return readWorkspacePreferences().mode;
}

export function isWorkspacePathVisible(path: string, mode: WorkspaceMode, preferences: WorkspacePreferences = readWorkspacePreferences()): boolean {
  if (preferences.hiddenPaths.includes(path)) return false;
  if (mode === 'expert') return true;
  if (EXPERT_ONLY_PATHS.has(path)) return false;
  if (mode === 'advanced') return true;
  return !ADVANCED_PATHS.has(path);
}
