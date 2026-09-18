import { type ReactNode } from 'react';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={'animate-spin ' + className} size={19}/>;
}

export function LoadingState({ message = 'جارٍ التحميل...' }: { message?: string }) {
  return <div className="flex min-h-[260px] flex-col items-center justify-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><Spinner/></span><p className="text-xs font-semibold text-ink-500">{message}</p></div>;
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message?: string; action?: ReactNode }) {
  return <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">{icon ?? <Inbox size={24} className="text-ink-300"/>}<h3 className="text-sm font-black text-ink-700">{title}</h3>{message && <p className="max-w-sm text-xs leading-6 text-ink-400">{message}</p>}{action}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-50 text-danger-600"><AlertTriangle size={20}/></div><h3 className="text-sm font-black text-ink-800">تعذر عرض هذه المساحة</h3><p className="max-w-md text-xs leading-6 text-ink-400">{message}</p>{onRetry && <button onClick={onRetry} className="btn-secondary mt-2">إعادة المحاولة</button>}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="relative mb-5 overflow-hidden rounded-[1.6rem] border border-ink-200/70 bg-white shadow-card" aria-labelledby="page-title">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary-700 via-primary-500 to-accent-500" aria-hidden="true" />
      <div className="flex flex-col gap-4 px-5 py-4 pt-5 lg:flex-row lg:items-end lg:justify-between lg:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[10px] font-black tracking-[0.16em] text-primary-700">AGHBARI WORKSPACE</div>
            <span className="badge-neutral">مصدر معتمد · مستأجر حالي</span>
            <span className="hidden text-[9px] font-bold text-ink-300 sm:inline">Evidence-first</span>
          </div>
          <h1 id="page-title" className="mt-1 text-2xl font-black tracking-tight text-ink-950 lg:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-3xl text-xs leading-6 text-ink-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-100 bg-ink-50/60 px-5 py-2 text-[10px] font-semibold text-ink-400 lg:px-6">
        <span className="inline-flex items-center gap-1.5"><span className="truth-dot" /> مصدر موثوق</span>
        <span>الحقيقة الرقمية منفصلة عن التفسير</span>
        <span>حالات النقص والمراجعة لا تُخفى</span>
        <span>الكتابة تمر عبر المسار الحاكم</span>
      </div>
    </header>
  );
}

export function TruthRail({ status = 'live', period }: { status?: 'live' | 'review' | 'limited'; period?: string }) {
  const map = {
    live: { label: 'البيانات قابلة للاستخدام', tone: 'text-success-600', text: 'المؤشرات تعرض من المصدر الكانوني الحالي.' },
    review: { label: 'المراجعة مطلوبة', tone: 'text-warning-600', text: 'هناك حالات أو فجوات يجب مراجعتها قبل اتخاذ القرار.' },
    limited: { label: 'بيانات محدودة', tone: 'text-ink-500', text: 'لن يتم تعويض النقص بقيم تقديرية غير مثبتة.' },
  } as const;
  const current = map[status];
  return <div className="truth-strip text-xs" role="status" aria-live="polite"><span className="truth-dot" /><span className={`font-black ${current.tone}`}>{current.label}</span><span className="text-ink-400">·</span><span className="text-ink-500">{current.text}</span>{period && <span className="mr-auto rounded-full bg-ink-100 px-2.5 py-1 text-[10px] font-bold text-ink-500">{period}</span>}</div>;
}

export function SkeletonCard() {
  return <div className="card p-5"><div className="skeleton mb-3 h-3 w-24"/><div className="skeleton mb-2 h-8 w-32"/><div className="skeleton h-3 w-20"/></div>;
}
