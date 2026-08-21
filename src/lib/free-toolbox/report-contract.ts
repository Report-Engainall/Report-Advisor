import type { KPIResult } from './kpi-registry';
import type { AdaptiveAlert } from './adaptive-alerts';
import type { DecisionLogEntry } from './decision-log';
export interface ReportSnapshot { schemaVersion: 1; generatedAt: string; kpis: KPIResult[]; alerts: AdaptiveAlert[]; decisions: DecisionLogEntry[]; quality: { overall: number; grade: string; blocking: boolean } }
export interface ReportMetric { id: string; label: string; value: number; unit?: string; confidence?: number; }
export interface ReportAction { id: string; title: string; reason: string; priority?: number; }
export interface ExecutiveReport { generatedAt: string; metrics: ReportMetric[]; actions: ReportAction[]; summary?: string; }
export function createReport(input: { metrics: ReportMetric[]; actions?: ReportAction[]; summary?: string }): ExecutiveReport { return { generatedAt: new Date().toISOString(), metrics: input.metrics, actions: input.actions ?? [], summary: input.summary }; }
export function createReportSnapshot(input: Omit<ReportSnapshot, 'schemaVersion' | 'generatedAt'>): ReportSnapshot { return { schemaVersion: 1, generatedAt: new Date().toISOString(), ...input }; }
export function validateReportSnapshot(s: ReportSnapshot): string[] { const errors: string[] = []; if (s.schemaVersion !== 1) errors.push('Unsupported report schema'); if (!Number.isFinite(s.quality.overall) || s.quality.overall < 0 || s.quality.overall > 100) errors.push('Invalid quality score'); for (const k of s.kpis) if (!Number.isFinite(k.value)) errors.push(`Invalid KPI value: ${k.id}`); for (const a of s.alerts) if (!Number.isFinite(a.value)) errors.push(`Invalid alert value: ${a.signalId}`); return errors; }
