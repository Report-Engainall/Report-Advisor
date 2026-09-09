import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type ActionButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
export type ActionButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ActionButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/15',
  soft: 'rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10',
};

const sizeClasses: Record<ActionButtonSize, string> = {
  sm: 'min-h-9 gap-1.5 px-3 text-xs',
  md: 'min-h-11 gap-2 px-4 text-sm',
  lg: 'min-h-13 gap-2.5 px-5 text-sm sm:text-base',
};

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

export function ActionButton({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  loadingLabel = 'جارٍ التنفيذ…',
  disabled,
  className = '',
  children,
  ...props
}: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-2xl font-bold transition disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      <span>{loading ? loadingLabel : children}</span>
    </button>
  );
}

interface ActionLinkProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  className?: string;
  title?: string;
}

export function ActionLink({ to, children, icon, variant = 'primary', size = 'md', className = '', title }: ActionLinkProps) {
  return (
    <a
      href={to}
      title={title}
      className={`inline-flex items-center justify-center rounded-2xl font-bold transition ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </a>
  );
}
