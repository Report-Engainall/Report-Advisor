import { type ReactNode } from 'react';
import { Loader2, AlertTriangle, Ban, CircleHelp, Inbox, ShieldAlert } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={'animate-spin ' + className} size={17} />;
}

export function LoadingState({ message = 'جارٍ التحميل...' }: { message?: string }) {
  return <div role="status" aria-live="polite" aria-busy="true" className="ag-state ag-state-loading flex min-h-[220px] flex-col items-center justify-center gap-3 p-7 text-center" data-state="loading" data-surface-state="loading"><div className="ag-state-icon"><Spinner className="h-[18px] w-[18px]" /></div><div><div className="ag-state-title">جارٍ تجهيز المساحة</div><p className="ag-state-copy mt-1">{message}</p></div><div className="flex items-center gap-1.5" aria-hidden="true"><span className="h-1.5 w-1.5 rounded-full bg-primary-500" /><span className="h-1.5 w-1.5 rounded-full bg-primary-300" /><span className="h-1.5 w-1.5 rounded-full bg-ink-200" /></div></div>;
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message?: string; action?: ReactNode }) {
  return <div role="status" aria-live="polite" className="ag-state ag-state-empty flex min-h-[190px] flex-col items-center justify-center gap-3 p-7 text-center" data-state="empty" data-surface-state="empty">{icon ?? <Inbox size={22} className="text-ink-300" />}<h3 className="text-[13px] font-bold text-ink-700">{title}</h3>{message && <p className="max-w-sm text-[11px] leading-5 text-ink-400">{message}</p>}{action}</div>;
}

export function DataUnavailableState({ title = 'البيانات غير متاحة بعد', message = 'لم تصل صورة بيانات موثوقة تكفي لعرض هذه المساحة. ابدأ من مصدر موحد أو راجع الثقة قبل المتابعة.', action }: { title?: string; message?: string; action?: ReactNode }) {
  return <div className="ag-state ag-state-empty flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-warning-200 bg-warning-50/50 p-7 text-center" data-state="unavailable" data-surface-state="unavailable"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-100 text-warning-700"><Inbox size={18} /></div><h3 className="text-[13px] font-black text-ink-800">{title}</h3><p className="max-w-md text-[11px] leading-5 text-ink-500">{message}</p>{action}</div>;
}

export function ReviewState({ title = 'مراجعة مطلوبة', message = 'الحالة قابلة للعرض، لكنها تحتاج مراجعة قبل تحويلها إلى قرار أو كتابة.', action }: { title?: string; message?: string; action?: ReactNode }) {
  return <div role="status" aria-live="polite" className="ag-state ag-state-review flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-2xl border border-warning-200 bg-warning-50/60 p-7 text-center" data-state="review" data-surface-state="review"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-100 text-warning-700"><CircleHelp size={18} /></div><h3 className="text-[13px] font-black text-ink-900">{title}</h3><p className="max-w-md text-[11px] leading-5 text-ink-600">{message}</p>{action}</div>;
}

export function BlockedState({ title = 'الحالة محجوبة', message = 'لا يمكن استخدام هذه النتيجة قبل إزالة سبب الحجب أو اكتمال شرط الثقة.', action }: { title?: string; message?: string; action?: ReactNode }) {
  return <div role="alert" aria-live="assertive" className="ag-state ag-state-blocked flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-2xl border border-danger-200 bg-danger-50/55 p-7 text-center" data-state="blocked" data-surface-state="blocked"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-100 text-danger-700"><Ban size={18} /></div><h3 className="text-[13px] font-black text-ink-900">{title}</h3><p className="max-w-md text-[11px] leading-5 text-ink-600">{message}</p>{action}</div>;
}

export function InsufficientDataState({ title = 'بيانات غير كافية', message = 'المصدر الحالي لا يحتوي على صورة موثوقة تكفي لإنتاج نتيجة مسؤولة.', action }: { title?: string; message?: string; action?: ReactNode }) {
  return <div role="status" aria-live="polite" className="ag-state ag-state-insufficient flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-2xl border border-warning-200 bg-warning-50/50 p-7 text-center" data-state="insufficient" data-surface-state="insufficient"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-100 text-warning-700"><ShieldAlert size={18} /></div><h3 className="text-[13px] font-black text-ink-900">{title}</h3><p className="max-w-md text-[11px] leading-5 text-ink-600">{message}</p>{action}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" aria-live="assertive" className="ag-state ag-state-error flex min-h-[220px] flex-col items-center justify-center gap-3 p-7 text-center" data-state="error" data-surface-state="error"><div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-danger-50 text-danger-600"><AlertTriangle size={18} /></div><h3 className="text-[13px] font-bold text-ink-800">تعذر عرض هذه المساحة</h3><p className="max-w-md text-[11px] leading-5 text-ink-400">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="btn-secondary mt-1" aria-label="إعادة تحميل هذه المساحة">إعادة المحاولة</button>}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return <header className="ag-page-header mb-5 flex flex-col gap-4 rounded-[16px] border px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="ag-page-kicker"><span className="ag-page-kicker-dot" />الأغبري · مساحة العمل</div><h1 className="mt-1.5 text-[24px] font-black tracking-tight text-ink-950">{title}</h1>{subtitle && <p className="mt-1 max-w-3xl text-[11px] leading-5 text-ink-500">{subtitle}</p>}</div>{actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}</header>;
}

export function SkeletonCard() {
  return <div className="card p-4"><div className="skeleton mb-3 h-3 w-24" /><div className="skeleton mb-2 h-7 w-28" /><div className="skeleton h-3 w-20" /></div>;
}
