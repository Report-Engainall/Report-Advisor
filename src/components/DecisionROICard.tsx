import { ArrowDownRight, ArrowUpRight, Minus, TimerReset } from 'lucide-react';
import { evaluateDecisionRoi, DECISION_ROI_LABELS, type DecisionRoiResult } from '@/lib/decision-roi';

export interface DecisionROICardProps {
  expected: number | null;
  actual: number | null;
  currency?: string | null;
  actualAvailable?: boolean;
  compact?: boolean;
}

export function DecisionROICard({ expected, actual, currency, actualAvailable, compact = false }: DecisionROICardProps) {
  const roi: DecisionRoiResult = evaluateDecisionRoi({ expected, actual, actualAvailable });
  const icon = roi.state === 'POSITIVE' ? ArrowUpRight : roi.state === 'NEGATIVE' ? ArrowDownRight : roi.state === 'NEUTRAL' ? Minus : TimerReset;
  const Icon = icon;
  const tone = roi.state === 'POSITIVE' ? 'border-success-200 bg-success-50'
    : roi.state === 'NEGATIVE' ? 'border-danger-200 bg-danger-50'
    : roi.state === 'AWAITING_OUTCOME' ? 'border-warning-200 bg-warning-50'
    : 'border-ink-200 bg-ink-50';

  const number = (value: number | null) => value == null ? 'غير متاح' : `${new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 2 }).format(value)}${currency ? ` ${currency}` : ''}`;

  return <section className={`rounded-2xl border p-4 ${tone}`} aria-label="العائد الفعلي من القرار">
    <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-black text-ink-900"><Icon size={16}/> عائد القرار</div><span className="text-[10px] font-bold text-ink-500">{DECISION_ROI_LABELS[roi.state]}</span></div>
    <div className={`mt-3 grid gap-2 ${compact ? 'grid-cols-3' : 'sm:grid-cols-3'}`}>
      <div className="rounded-xl bg-white/75 p-3"><div className="text-[10px] text-ink-400">المتوقع</div><div className="mt-1 text-sm font-black">{number(roi.expected)}</div></div>
      <div className="rounded-xl bg-white/75 p-3"><div className="text-[10px] text-ink-400">الفعلي</div><div className="mt-1 text-sm font-black">{number(roi.actual)}</div></div>
      <div className="rounded-xl bg-white/75 p-3"><div className="text-[10px] text-ink-400">الفارق</div><div className="mt-1 text-sm font-black">{number(roi.delta)}</div></div>
    </div>
    <div className="mt-2 text-[10px] text-ink-500">{roi.deltaPercent == null ? 'لا يمكن حساب نسبة الفارق قبل توفر أساس صالح.' : `الفارق النسبي: ${roi.deltaPercent.toFixed(1)}%`}</div>
  </section>;
}
