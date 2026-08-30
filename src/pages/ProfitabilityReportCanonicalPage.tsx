import { useCallback, useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { fetchProfitabilitySnapshot, type ProfitabilitySnapshot } from '@/lib/dashboard-canonical';
import { formatCurrency, formatNumber } from '@/lib/format';

function knownCount(a: number | null, b: number | null): string { if (a == null || b == null) return 'غير متاح'; return formatNumber(a + b); }

export function ProfitabilityReportCanonicalPage() {
  const [snapshot, setSnapshot] = useState<ProfitabilitySnapshot | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setSnapshot(await fetchProfitabilitySnapshot()); } catch (e: unknown) { setError(e instanceof Error ? e.message : 'تعذر تحميل الربحية'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]); if (loading) return <LoadingState />; if (error) return <ErrorState message={error} onRetry={load} />; if (!snapshot) return null;
  const calculated = snapshot.status === 'CALCULATED' && snapshot.revenue != null && snapshot.cost != null && snapshot.gross_profit != null;
  return <div className="space-y-6 animate-fade-in">
    <PageHeader title="تقرير الأرباح والربحية" subtitle="Financial Truth Contract: لا يتحول نقص الدليل المالي إلى صفر." />
    <Card><CardBody><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${calculated ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}>{calculated ? 'CALCULATED' : 'INSUFFICIENT_DATA'}</span><span className="text-xs text-ink-500">العملة: {snapshot.currency || 'غير محددة'}</span><span className="text-xs text-ink-500">حالة العملة: {snapshot.currency_status}</span><span className="text-xs text-ink-500">حتى {snapshot.as_of}</span></div></CardBody></Card>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardBody><div className="text-xs text-ink-500">الإيراد</div><div className="text-2xl font-bold text-ink-900">{calculated ? formatCurrency(snapshot.revenue) : 'غير متاح'}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">التكلفة</div><div className="text-2xl font-bold text-ink-900">{calculated ? formatCurrency(snapshot.cost) : 'غير متاح'}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500">الربح الإجمالي</div><div className="text-2xl font-bold text-ink-900">{calculated ? formatCurrency(snapshot.gross_profit) : 'غير متاح'}</div></CardBody></Card></div>
    <Card><CardBody><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div><div className="text-xs text-ink-500">الهامش</div><div className="text-lg font-semibold">{calculated && snapshot.gross_margin != null ? `${snapshot.gross_margin.toFixed(2)}%` : 'غير متاح'}</div></div><div><div className="text-xs text-ink-500">الفواتير</div><div className="text-lg font-semibold">{formatNumber(snapshot.invoice_count)}</div></div><div><div className="text-xs text-ink-500">صفوف مالية ناقصة</div><div className="text-lg font-semibold">{knownCount(snapshot.bad_invoice_rows, snapshot.bad_sale_item_rows)}</div></div><div><div className="text-xs text-ink-500">اختلاف العملة</div><div className="text-lg font-semibold">{formatNumber(snapshot.currency_mismatch_rows)}</div></div></div>{snapshot.reasons.length > 0 && <div className="mt-5 rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800"><div className="font-semibold mb-1">أسباب عدم كفاية الدليل</div><ul className="list-disc pr-5 space-y-1">{snapshot.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></div>}</CardBody></Card>
  </div>;
}
