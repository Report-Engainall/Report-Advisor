export type SurfaceState = 'LIVE' | 'UNKNOWN' | 'NOT_CONFIGURED' | 'BLOCKED' | 'ERROR' | 'EMPTY';

export interface SavedViewDefinition {
  id: string;
  tenantId?: string;
  name: string;
  surface: 'dashboard' | 'report' | 'analytics' | 'inventory' | 'customers' | 'products';
  filters: Record<string, string | number | boolean | null>;
  grouping: string[];
  columns: string[];
  sorting: Array<{ field: string; direction: 'asc' | 'desc' }>;
  state?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExplainabilityModel {
  state: SurfaceState;
  summary: string;
  details?: string;
  evidenceIds: string[];
  calculation?: string;
  assumptions: string[];
  uncertainty?: string;
  alternatives: string[];
  blockedReason?: string;
}

export interface AlternativeRecommendation {
  id: string;
  label: string;
  expectedBenefit?: number;
  cost?: number;
  risk?: number;
  confidence?: number;
  evidenceIds: string[];
  state: SurfaceState;
}

export interface DecisionSafetySummary {
  state: SurfaceState;
  confidence?: number;
  evidenceCompleteness?: number;
  freshness?: string;
  requiredApproval?: string;
  blockedReason?: string;
}

export function sanitizeSavedView(view: SavedViewDefinition): SavedViewDefinition {
  return {
    ...view,
    filters: { ...view.filters },
    grouping: [...view.grouping],
    columns: [...view.columns],
    sorting: view.sorting.map(item => ({ ...item })),
    state: view.state ? { ...view.state } : undefined,
  };
}

export function explainable(model: ExplainabilityModel): boolean {
  if (model.state === 'BLOCKED' || model.state === 'UNKNOWN' || model.state === 'ERROR') {
    return Boolean(model.blockedReason || model.details);
  }
  if (model.state === 'LIVE') return Boolean(model.summary && model.evidenceIds.length > 0);
  return Boolean(model.summary);
}

export function isActionable(alternative: AlternativeRecommendation): boolean {
  return alternative.state === 'LIVE' && alternative.evidenceIds.length > 0;
}
