import { type ReactNode } from 'react';
import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) { return <Loader2 className={`animate-spin ${className}`} size={20} />; }

export function LoadingState({ message = 'جارٍ التحميل...' }: { message?: string }) {
  return <div className="card flex min-h-64 flex-col items-center justify-center gap-3 p-8" role="status" aria-live="polite"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"><Spinner/></span><p className="text-sm font-medium text-ink-500">{message}</p><div className="flex gap-1" aria-hidden="true"><span className="h-1 w-1 rounded-full bg-ink-300 animate-pulse"/><span className="h-1 w-1 rounded-full bg-ink-300 animate-pulse [animation-delay:120ms]"/><span className="h-1 w-1 rounded-full bg-ink-300 animate-pulse [animation-delay:240ms]"/></div></div>;
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message?: string; action?: ReactNode }) {
  return <div className="card flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-50 text-ink-300">{icon || <Inbox size={23}/>}</div><h3 className="text-base font-bold text-ink-800">{title}</h3>{message&&<p className="max-w-sm text-sm leading-6 text-ink-400">{message}</p>}{action&&<div className="mt-1">{action}</div>}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="card flex min-h-64 flex-col items-center justify-center gap-3 border-danger-100 bg-danger-50/20 p-8 text-center" role="alert"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-50 text-danger-500"><AlertTriangle size={23}/></div><h3 className="text-base font-bold text-ink-800">تعذر تحميل البيانات</h3><p className="max-w-lg text-sm leading-6 text-ink-500">{message}</p>{onRetry&&<button type="button" onClick={onRetry} className="btn-secondary mt-1"><RefreshCw size={15}/> إعادة المحاولة</button>}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return <div className="page-header flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"><div className="min-w-0"><h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-950 text-balance">{title}</h1>{subtitle&&<p className="text-sm text-ink-500 mt-1.5 leading-6">{subtitle}</p>}</div>{actions&&<div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}</div>;
}

export function SkeletonCard(){return <div className="card p-5"><div className="skeleton h-4 w-24 mb-3"/><div className="skeleton h-8 w-32 mb-2"/><div className="skeleton h-3 w-20"/></div>;}
