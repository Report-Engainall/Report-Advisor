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

export function KPICard({ label, value, format, change, changeLabel, icon, status = 'CALCULATED', hint }: KPICardProps) {
  const formatted = value === null ? '—' : format === 'currency' ? formatCurrency(value) : format === 'percent' ? formatPercent(value) : format === 'compact' ? formatCompact(value) : formatNumber(value);
  const positive = change !== undefined && change > 0;
  const negative = change !== undefined && change < 0;
  const statusLabel = status === 'INSUFFICIENT_DATA' ? 'غير مكتمل' : status === 'FORECAST' ? 'تنبؤ' : status === 'ESTIMATED' ? 'تقديري' : 'محسوب';

  return (
    <div className="card group relative overflow-hidden p-4 transition-[border-color,box-shadow] duration-150 hover:border-ink-300 hover:shadow-card-hover">
      
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-ink-200 bg-white text-ink-500 transition group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:text-primary-700">{icon}</span>
          <span className="text-[11px] font-bold text-ink-500">{label}</span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-wide text-ink-400">{statusLabel}</span>
      </div>
      <div className="relative mt-4 metric-value">{formatted}</div>
      <div className="relative mt-2 flex min-h-4 items-center gap-2">
        {change !== undefined && <span className={'flex items-center gap-1 text-xs font-bold ' + (positive ? 'text-success-600' : negative ? 'text-danger-600' : 'text-ink-400')}>{positive ? <TrendingUp size={13}/> : negative ? <TrendingDown size={13}/> : <Minus size={13}/>} {formatPercent(change)}</span>}
        {changeLabel && <span className="text-[10px] text-ink-400">{changeLabel}</span>}
        {status === 'INSUFFICIENT_DATA' && <span className="badge-neutral text-[9px]">لا قيمة مؤكدة</span>}
      </div>
      {hint && <p className="relative mt-2 text-[10px] leading-4 text-ink-400">{hint}</p>}
    </div>
  );
}
