import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return <section onClick={onClick} className={'card ' + (hover ? 'card-hover cursor-pointer ' : '') + className}>{children}</section>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-ink-100/80 px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-sm font-black text-ink-900">{title}</h3>
        {subtitle && <p className="mt-1 text-[11px] leading-5 text-ink-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={'p-5 ' + className}>{children}</div>;
}
