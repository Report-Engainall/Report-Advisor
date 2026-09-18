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
    <header className="mb-5 overflow-hidden rounded-[1.6rem] border border-ink-200/70 bg-white shadow-card">
      <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-end lg:justify-between lg:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[10px] font-black tracking-[0.16em] text-primary-700">AGHBARI WORKSPACE</div>
            <span className="badge-neutral">مصدر معتمد · مستأجر حالي</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-ink-950 lg:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-3xl text-xs leading-6 text-ink-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-100 bg-ink-50/60 px-5 py-2 text-[10px] font-semibold text-ink-400 lg:px-6">
        <span>الحقيقة الرقمية منفصلة عن التفسير</span>
        <span>حالات النقص والمراجعة لا تُخفى</span>
        <span>الكتابة تمر عبر المسار الحاكم</span>
      </div>
    </header>
  );
}

export function SkeletonCard() {
  return <div className="card p-5"><div className="skeleton mb-3 h-3 w-24"/><div className="skeleton mb-2 h-8 w-32"/><div className="skeleton h-3 w-20"/></div>;
}
