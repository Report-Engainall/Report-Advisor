import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, ShieldAlert, Calculator, Sparkles } from 'lucide-react';
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

const statusMeta: Record<DataStatus, { label: string; className: string; icon: typeof ShieldCheck }> = {
  CONFIRMED: { label: 'مصدر مؤكد', className: 'text-success-700 bg-success-50 ring-success-100', icon: ShieldCheck },
  CALCULATED: { label: 'محسوب من المصدر', className: 'text-primary-700 bg-primary-50 ring-primary-100', icon: Calculator },
  INSUFFICIENT_DATA: { label: 'بيانات غير كافية', className: 'text-warning-700 bg-warning-50 ring-warning-100', icon: ShieldAlert },
  FORECAST: { label: 'تنبؤ', className: 'text-accent-800 bg-accent-50 ring-accent-100', icon: Sparkles },
  ESTIMATED: { label: 'تقديري', className: 'text-warning-800 bg-warning-50 ring-warning-100', icon: ShieldAlert },
  UNAVAILABLE: { label: 'غير متاح', className: 'text-ink-500 bg-ink-50 ring-ink-100', icon: ShieldAlert },
};

export function KPICard({ label, value, format, change, changeLabel, icon, status = 'CALCULATED', hint }: KPICardProps) {
  const formatted = value === null ? '—' : format === 'currency' ? formatCurrency(value) : format === 'percent' ? formatPercent(value) : format === 'compact' ? formatCompact(value) : formatNumber(value);
  const positive = change !== undefined && change > 0;
  const negative = change !== undefined && change < 0;
  const meta = statusMeta[status];
  const StatusIcon = meta.icon;

  return (
    <div className="ag-kpi-card card group relative overflow-hidden p-4 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:border-ink-300 hover:shadow-card-hover">
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-ink-200 bg-white text-ink-500 transition group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:text-primary-700" aria-hidden="true">{icon}</span>
          <span className="truncate text-[11px] font-bold text-ink-500">{label}</span>
        </div>
        <span className={'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-black ring-1 ring-inset ' + meta.className} title={meta.label}>
          <StatusIcon size={11} aria-hidden="true" />{meta.label}
        </span>
      </div>
      <div className="relative mt-4 metric-value" aria-label={label + ': ' + formatted}>{formatted}</div>
      <div className="relative mt-2 flex min-h-4 flex-wrap items-center gap-2">
        {change !== undefined && <span className={'flex items-center gap-1 text-xs font-bold ' + (positive ? 'text-success-600' : negative ? 'text-danger-600' : 'text-ink-400')}>{positive ? <TrendingUp size={13}/> : negative ? <TrendingDown size={13}/> : <Minus size={13}/>} {formatPercent(change)}</span>}
        {changeLabel && <span className="text-[10px] text-ink-400">{changeLabel}</span>}
        {status === 'INSUFFICIENT_DATA' && <span className="badge-neutral text-[9px]">لا قيمة مؤكدة</span>}
      </div>
      {hint && <p className="relative mt-2 text-[10px] leading-4 text-ink-400">{hint}</p>}
    </div>
  );
}
