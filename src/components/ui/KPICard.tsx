import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, Database, Clock3, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatCompact, relativeTime } from '@/lib/format';
import type { DataStatus } from '@/lib/types';

interface KPICardProps {
  label: string;
  value: number | null;
  format: 'currency' | 'number' | 'percent' | 'compact';
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  status?: DataStatus;
  hint?: string;
  period?: string;
  asOf?: string;
  source?: string;
  formula?: string;
  freshness?: string;
  evidence?: string;
  confidence?: 'CONFIRMED' | 'CALCULATED' | 'ESTIMATED' | 'FORECAST' | 'INSUFFICIENT_DATA' | 'UNAVAILABLE';
}

export function KPICard({ label, value, format, change, changeLabel, icon, status = 'CALCULATED', hint, period, asOf, source, formula, freshness, evidence, confidence }: KPICardProps) {
  const formatted = value === null
    ? '—'
    : format === 'currency' ? formatCurrency(value)
      : format === 'percent' ? `${value.toFixed(1)}%`
      : format === 'compact' ? formatCompact(value)
      : formatNumber(value);

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;
  const evidenceStatus = confidence ?? status;
  const statusLabels: Record<string, string> = {
    CONFIRMED: 'موثق', CALCULATED: 'محسوب', ESTIMATED: 'تقديري', FORECAST: 'تنبؤ',
    INSUFFICIENT_DATA: 'بيانات غير كافية', UNAVAILABLE: 'غير متاح',
  };
  const statusColors: Record<string, string> = {
    CONFIRMED: 'text-success-600 bg-success-50', CALCULATED: 'text-primary-600 bg-primary-50',
    ESTIMATED: 'text-warning-600 bg-warning-50', FORECAST: 'text-accent-600 bg-accent-50',
    INSUFFICIENT_DATA: 'text-ink-500 bg-ink-50', UNAVAILABLE: 'text-ink-500 bg-ink-50',
  };
  const hasSource = typeof source === 'string' && source.trim().length > 0;
  const hasEvidence = typeof evidence === 'string' && evidence.trim().length > 0;
  const hasFormula = typeof formula === 'string' && formula.trim().length > 0;
  const evidenceComplete = hasSource && hasEvidence;

  return (
    <article className="card card-hover p-5 group" aria-label={label}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <div className="shrink-0 text-ink-400 group-hover:text-primary-500 transition-colors">{icon}</div>}
          <span className="text-sm font-medium text-ink-500 truncate">{label}</span>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${statusColors[evidenceStatus] ?? statusColors.UNAVAILABLE}`}>
          {evidenceStatus === 'CONFIRMED' ? <ShieldCheck size={11} /> : <Database size={11} />}
          {statusLabels[evidenceStatus] ?? evidenceStatus}
        </span>
      </div>
      <div className="mt-4 text-2xl font-bold text-ink-900 tabular-nums tracking-tight">{formatted}</div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        {change !== undefined && <span className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-success-600' : isNegative ? 'text-danger-600' : 'text-ink-400'}`}>
          {isPositive && <TrendingUp size={14} />}{isNegative && <TrendingDown size={14} />}{isNeutral && <Minus size={14} />}{formatPercent(change)}
        </span>}
        {changeLabel && <span className="text-xs text-ink-400">{changeLabel}</span>}
      </div>
      {hint && <p className="mt-2 text-[11px] leading-5 text-ink-400">{hint}</p>}
      {(period || asOf || source || formula || freshness || evidence) && <div className="mt-4 border-t border-ink-100 pt-3 text-[10px] text-ink-400 space-y-1">
        {period && <div className="flex items-center gap-1.5"><Clock3 size={11} /> الفترة: {period}</div>}
        {asOf && <div className="flex items-center gap-1.5"><Clock3 size={11} /> حتى: {asOf}{!asOf.includes('منذ') && (() => { try { return <span className="mr-1">({relativeTime(asOf)})</span>; } catch { return null; } })()}</div>}
        {freshness && <div className="flex items-center gap-1.5"><Clock3 size={11} /> الحداثة: {freshness}</div>}
        {source && <div className="flex items-center gap-1.5"><Database size={11} /> المصدر: {source}</div>}
        {formula && <div className="flex items-center gap-1.5"><Database size={11} /> الصيغة: {formula}</div>}
        {evidence && <div className="flex items-center gap-1.5"><ShieldCheck size={11} /> الدليل: {evidence}</div>}
        {!evidenceComplete && <div className="flex items-center gap-1.5 font-semibold text-warning-600"><AlertTriangle size={11} /> INSUFFICIENT_EVIDENCE</div>}
        {hasFormula && !hasEvidence && <div className="text-warning-600">الصيغة معروضة لكن الدليل التشغيلي غير متاح.</div>}
      </div>}
    </article>
  );
}
