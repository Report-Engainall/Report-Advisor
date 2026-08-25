export type SavedViewState = {
  version: 1;
  filters: Record<string, string | number | boolean | null>;
  grouping: string[];
  columns: string[];
  sorting: Array<{ id: string; direction: 'asc' | 'desc' }>;
  scope?: string;
};

export type CrossFilterEvent = {
  source: 'chart' | 'table' | 'kpi' | 'filter';
  dimension: string;
  value: string | number | boolean | null;
  scope?: string;
};

export type AlertPresentation = {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  priority: number;
  title: string;
  reason?: string;
  evidenceId?: string | null;
  status: 'open' | 'snoozed' | 'assigned' | 'resolved' | 'unknown';
  assignedTo?: string | null;
  snoozedUntil?: string | null;
};

export function normalizeSavedViewState(input: Partial<SavedViewState>): SavedViewState {
  return {
    version: 1,
    filters: { ...(input.filters ?? {}) },
    grouping: [...(input.grouping ?? [])],
    columns: [...(input.columns ?? [])],
    sorting: [...(input.sorting ?? [])],
    scope: input.scope,
  };
}

export function applyCrossFilter(
  state: SavedViewState,
  event: CrossFilterEvent,
): SavedViewState {
  const next = normalizeSavedViewState(state);
  next.filters[event.dimension] = event.value;
  return next;
}

export function canShowEvidence(alert: AlertPresentation): boolean {
  return Boolean(alert.evidenceId);
}

export function classifyAlertStatus(input: Pick<AlertPresentation, 'status' | 'evidenceId'>): AlertPresentation['status'] {
  if (!input.evidenceId && input.status === 'open') return 'unknown';
  return input.status;
}
