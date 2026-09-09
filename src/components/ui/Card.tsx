import { type ReactNode } from 'react';

interface CardProps { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void; }

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return <div onClick={onClick} className={`card ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="flex items-start justify-between gap-4 p-5 pb-3"><div className="min-w-0"><h3 className="font-bold text-ink-800 text-base tracking-tight">{title}</h3>{subtitle&&<p className="text-xs text-ink-400 mt-1 leading-5">{subtitle}</p>}</div>{action&&<div className="shrink-0">{action}</div>}</div>;
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`p-5 pt-2 ${className}`}>{children}</div>; }
