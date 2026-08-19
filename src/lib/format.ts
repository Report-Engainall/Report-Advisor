const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function formatCurrency(value: number | null | undefined, currency = 'ر.س'): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  const sign = value < 0 ? '-' : '';
  return `${sign}${formatted} ${currency}`;
}

export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    calendar: 'gregory',
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'gregory',
  }).format(d);
}

export function toArabicDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => arabicDigits[parseInt(d)]);
}

export function daysBetween(from: string | Date, to: string | Date): number {
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return Math.round((t - f) / (1000 * 60 * 60 * 24));
}

export function relativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'اليوم';
  if (diff === 1) return 'أمس';
  if (diff < 7) return `منذ ${diff} أيام`;
  if (diff < 30) return `منذ ${Math.floor(diff / 7)} أسابيع`;
  if (diff < 365) return `منذ ${Math.floor(diff / 30)} أشهر`;
  return `منذ ${Math.floor(diff / 365)} سنوات`;
}
