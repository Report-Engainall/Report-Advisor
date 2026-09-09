import { type ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
const variants: Record<BadgeVariant, string> = {
  primary: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  success: 'bg-green-50 text-green-700 ring-green-100',
  warning: 'bg-amber-50 text-amber-800 ring-amber-100',
  danger: 'bg-red-50 text-red-700 ring-red-100',
  neutral: 'bg-stone-100 text-stone-600 ring-stone-200',
  accent: 'bg-teal-50 text-teal-700 ring-teal-100',
};

export function Badge({ children, variant = 'neutral', className = '' }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return <span className={`badge ring-1 ring-inset ${variants[variant]} ${className}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    paid: { variant: 'success', label: 'مدفوعة' }, confirmed: { variant: 'primary', label: 'مؤكدة' }, draft: { variant: 'neutral', label: 'مسودة' }, posted: { variant: 'accent', label: 'مرحّلة' },
    new: { variant: 'primary', label: 'جديدة' }, accepted: { variant: 'success', label: 'مقبولة' }, in_progress: { variant: 'warning', label: 'قيد التنفيذ' }, done: { variant: 'success', label: 'تم التنفيذ' }, rejected: { variant: 'danger', label: 'مرفوضة' }, deferred: { variant: 'neutral', label: 'مؤجلة' }, pending: { variant: 'warning', label: 'قيد المعالجة' }, completed: { variant: 'success', label: 'مكتمل' }, failed: { variant: 'danger', label: 'فشل' }, partial: { variant: 'warning', label: 'جزئي' },
  };
  const config = map[status] || { variant: 'neutral' as BadgeVariant, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = { critical: { variant: 'danger', label: 'حرج' }, warning: { variant: 'warning', label: 'تحذير' }, info: { variant: 'primary', label: 'معلومة' }, opportunity: { variant: 'success', label: 'فرصة' } };
  const config = map[severity] || { variant: 'neutral' as BadgeVariant, label: severity };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = { high: { variant: 'danger', label: 'عالية' }, medium: { variant: 'warning', label: 'متوسطة' }, low: { variant: 'neutral', label: 'منخفضة' } };
  const config = map[priority] || { variant: 'neutral' as BadgeVariant, label: priority };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ConfidenceBadge({ confidence }: { confidence: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = { CONFIRMED: { variant: 'success', label: 'مؤكد' }, CALCULATED: { variant: 'primary', label: 'محسوب' }, ESTIMATED: { variant: 'warning', label: 'تقديري' }, FORECAST: { variant: 'accent', label: 'تنبؤ' }, INSUFFICIENT_DATA: { variant: 'neutral', label: 'بيانات غير كافية' }, UNAVAILABLE: { variant: 'neutral', label: 'غير متاح' } };
  const config = map[confidence] || { variant: 'neutral' as BadgeVariant, label: confidence };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
