import { type ReactNode } from 'react';

interface CardProps { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void; }

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return <div onClick={onClick} className={`card rounded-[1.35rem] border border-ink-100/80 bg-white shadow-[0_10px_35px_rgba(6,95,70,.055)] transition-all duration-300 ${hover ? 'card-hover cursor-pointer hover:-translate-y-1 hover:border-emerald-100 hover:shadow-[0_18px_45px_rgba(6,95,70,.10)]' : ''} ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="flex items-start justify-between gap-4 p-5 pb-3 sm:p-6 sm:pb-3"><div className="min-w-0"><h3 className="font-black text-ink-900 text-base tracking-tight">{title}</h3>{subtitle&&<p className="text-xs text-ink-400 mt-1 leading-5">{subtitle}</p>}</div>{action&&<div className="shrink-0">{action}</div>}</div>;
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`p-5 pt-2 sm:p-6 sm:pt-2 ${className}`}>{children}</div>; }
