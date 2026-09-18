import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
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
  to?: string;
  actionLabel?: string;
  evidenceTo?: string;

}

export function KPICard({ label, value, format, change, changeLabel, icon, status = 'CALCULATED', hint, to, actionLabel = 'فتح التفاصيل', evidenceTo }: KPICardProps) {
  const formatted = value === null ? '—' : format === 'currency' ? formatCurrency(value) : format === 'percent' ? formatPercent(value) : format === 'compact' ? formatCompact(value) : formatNumber(value);
  const positive = change !== undefined && change > 0;
  const negative = change !== undefined && change < 0;
  const statusLabel = status === 'INSUFFICIENT_DATA' ? 'بيانات محدودة' : status === 'FORECAST' ? 'تنبؤ' : status === 'ESTIMATED' ? 'تقديري' : 'محسوب';
  const statusTone = status === 'INSUFFICIENT_DATA' ? 'badge-warning' : status === 'FORECAST' ? 'badge-primary' : status === 'ESTIMATED' ? 'badge-neutral' : 'badge-success';

  const content = (
    <div className="card card-hover group relative overflow-hidden p-5">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-primary-50 blur-2xl opacity-70" aria-hidden="true"/>
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-50 text-ink-500 transition group-hover:bg-primary-50 group-hover:text-primary-700">{icon}</span>
          <span className="text-[11px] font-bold text-ink-500">{label}</span>
        </div>
        <span className={statusTone + ' text-[9px]'}>{statusLabel}</span>
      </div>
      <div className="relative mt-5 flex items-baseline gap-2"><div className="metric-value" dir="auto">{formatted}</div></div>
      <div className="relative mt-2 flex min-h-4 items-center gap-2">
        {change !== undefined && <span className={'flex items-center gap-1 text-xs font-bold ' + (positive ? 'text-success-600' : negative ? 'text-danger-600' : 'text-ink-400')}>{positive ? <TrendingUp size={13}/> : negative ? <TrendingDown size={13}/> : <Minus size={13}/>} {formatPercent(change)}</span>}
        {changeLabel && <span className="text-[10px] text-ink-400">{changeLabel}</span>}
        {status === 'INSUFFICIENT_DATA' && <span className="badge-neutral text-[9px]">لا قيمة مؤكدة</span>}
      </div>
      {hint && <p className="relative mt-2 text-[10px] leading-4 text-ink-400">{hint}</p>}
      {(to || evidenceTo) && <div className="relative mt-3 flex flex-wrap items-center gap-3 text-[10px] font-bold opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">{to && <span className="text-primary-600">{actionLabel} ←</span>}{evidenceTo && <Link to={evidenceTo} className="text-ink-500 hover:text-primary-600" onClick={event => event.stopPropagation()}>فحص التعريف والدليل ↗</Link>}</div>}
    </div>
  );
  return to ? <Link to={to} className="block rounded-[1.35rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">{content}</Link> : content;
}
