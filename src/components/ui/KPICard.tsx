import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatCompact } from '@/lib/format';
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
}

const statusMeta: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: 'مؤكد', className: 'bg-success-50 text-success-700 ring-success-100' },
  CALCULATED: { label: 'محسوب', className: 'bg-primary-50 text-primary-700 ring-primary-100' },
  ESTIMATED: { label: 'تقديري', className: 'bg-warning-50 text-warning-700 ring-warning-100' },
  FORECAST: { label: 'تنبؤ', className: 'bg-accent-50 text-accent-700 ring-accent-100' },
  INSUFFICIENT_DATA: { label: 'بانتظار البيانات', className: 'bg-ink-50 text-ink-500 ring-ink-100' },
  UNAVAILABLE: { label: 'غير متاح', className: 'bg-ink-50 text-ink-500 ring-ink-100' },
};

export function KPICard({ label, value, format, change, changeLabel, icon, status = 'CALCULATED', hint }: KPICardProps) {
  const formatted = value === null
    ? '—'
    : format === 'currency' ? formatCurrency(value)
      : format === 'percent' ? `${value.toFixed(1)}%`
      : format === 'compact' ? formatCompact(value)
      : formatNumber(value);

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;
  const meta = statusMeta[status] ?? statusMeta.CALCULATED;

  return (
    <article className="card card-hover group relative overflow-hidden p-5" aria-label={label}>
      <div className="absolute inset-x-0 top-0 h-0.5 bg-primary-500/0 transition-colors group-hover:bg-primary-500/40" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-500 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">{icon}</span>}
          <span className="truncate text-sm font-medium text-ink-500">{label}</span>
        </div>
        <span title={`حالة المؤشر: ${meta.label}`} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ${meta.className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {meta.label}
        </span>
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="text-[1.7rem] font-bold leading-none tracking-tight text-ink-950 tabular-nums">{formatted}</div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
            isPositive ? 'bg-success-50 text-success-700' : isNegative ? 'bg-danger-50 text-danger-700' : 'bg-ink-50 text-ink-500'
          }`}>
            {isPositive && <TrendingUp size={13} />}
            {isNegative && <TrendingDown size={13} />}
            {isNeutral && <Minus size={13} />}
            {formatPercent(change)}
          </span>
        )}
      </div>
      {(hint || changeLabel) && <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-ink-400">
        <span className="truncate">{hint ?? changeLabel}</span>
        {hint && changeLabel && <span className="shrink-0">{changeLabel}</span>}
      </div>}
    </article>
  );
}
