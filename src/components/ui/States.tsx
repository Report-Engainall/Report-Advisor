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
  return <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-[10px] font-black tracking-[0.16em] text-primary-700">AGHBARI WORKSPACE</div><h1 className="mt-1 text-2xl font-black tracking-tight text-ink-950">{title}</h1>{subtitle && <p className="mt-1 max-w-2xl text-xs leading-6 text-ink-500">{subtitle}</p>}</div>{actions && <div className="flex items-center gap-2">{actions}</div>}</header>;
}

export function SkeletonCard() {
  return <div className="card p-5"><div className="skeleton mb-3 h-3 w-24"/><div className="skeleton mb-2 h-8 w-32"/><div className="skeleton h-3 w-20"/></div>;
}
