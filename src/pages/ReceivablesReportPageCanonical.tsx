import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchReceivablesReportSnapshot, type ReceivablesReportRow, type ReceivablesReportSnapshot } from '@/lib/receivables-truth';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';

const PAGE_SIZE = 25;

export function ReceivablesReportPageCanonical() {
  const [page, setPage] = useState(0);
  const [retryNonce, setRetryNonce] = useState(0);
  const [snapshot, setSnapshot] = useState<ReceivablesReportSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchReceivablesReportSnapshot(page, PAGE_SIZE)
      .then((value) => { if (!cancelled) { setSnapshot(value); setError(null); } })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : 'تعذر تحميل الذمم'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, retryNonce]);

  if (loading) return <LoadingState message="جارٍ تحميل الذمم من المصدر القانوني..." />;
  if (error) return <ErrorState message={error} onRetry={() => { setError(null); setRetryNonce((value) => value + 1); }} />;
  if (!snapshot) return <ErrorState message="تعذر إثبات لقطة الذمم" />;

  const lastPage = Math.max(0, Math.ceil(snapshot.totalRows / PAGE_SIZE) - 1);
  const bucketCards: Array<[string, number]> = [['0-30', snapshot.buckets['0-30']], ['31-60', snapshot.buckets['31-60']], ['61-90', snapshot.buckets['61-90']], ['90+', snapshot.buckets['90+']]];

  return <div className="space-y-6 animate-fade-in">
    <PageHeader title="تقرير الذمم والتحصيل" subtitle="الإجمالي وأعمار الذمم من تجميع خادمي؛ الجدول صفحة عرض فقط" />
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي الذمم</div><div className="text-xl font-bold text-ink-900">{formatCurrency(snapshot.totalOutstanding)}</div></CardBody></Card>
      {bucketCards.map(([bucket, amount]) => <Card key={bucket}><CardBody><div className="text-xs text-ink-500 mb-1">{bucket} يوم</div><div className="text-lg font-bold text-ink-900">{formatCurrency(amount)}</div></CardBody></Card>)}
    </div>
    {snapshot.undatedRows > 0 && <div role="alert" className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">هناك {formatNumber(snapshot.undatedRows)} ذمم بلا تاريخ استحقاق؛ بقيت في فئة UNDATED ولم تُحوّل إلى عمر مصطنع.</div>}
    {snapshot.incompleteRows > 0 && <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">هناك {formatNumber(snapshot.incompleteRows)} سجلات ذمم ناقصة ماليًا؛ لم تُحوّل القيم المفقودة إلى صفر، ولذلك الحالة INSUFFICIENT_DATA.</div>}
    <Card>
      <CardHeader title="الفواتير المستحقة" subtitle={`صفحة ${page + 1} من ${Math.max(1, lastPage + 1)} — ${formatNumber(snapshot.rows.length)} من ${formatNumber(snapshot.totalRows)}`} />
      <DataTable columns={[
        { key: 'invoice_number', label: 'رقم الفاتورة', render: (r: ReceivablesReportRow) => <span className="font-medium text-primary-600">{r.invoice_number}</span> },
        { key: 'invoice_date', label: 'تاريخ الفاتورة', render: (r: ReceivablesReportRow) => formatDate(r.invoice_date) },
        { key: 'due_date', label: 'الاستحقاق', render: (r: ReceivablesReportRow) => r.due_date ? formatDate(r.due_date) : <Badge variant="neutral">UNDATED</Badge> },
        { key: 'total', label: 'الإجمالي', align: 'right', render: (r: ReceivablesReportRow) => formatCurrency(r.total) },
        { key: 'paid_amount', label: 'المدفوع', align: 'right', render: (r: ReceivablesReportRow) => formatCurrency(r.paid_amount) },
        { key: 'outstanding', label: 'المتبقي', align: 'right', render: (r: ReceivablesReportRow) => formatCurrency(r.outstanding) },
        { key: 'bucket', label: 'الفئة', align: 'center', render: (r: ReceivablesReportRow) => <Badge variant={r.bucket === '90+' ? 'danger' : r.bucket === 'INCOMPLETE' ? 'danger' : r.bucket === 'UNDATED' ? 'neutral' : 'warning'}>{r.bucket}</Badge> },
      ]} data={snapshot.rows} />
      <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-xs text-ink-500"><span>Business Truth مستقل عن pagination.</span><div className="flex gap-2"><button type="button" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} className="btn-secondary text-xs disabled:opacity-50">السابق</button><button type="button" disabled={page >= lastPage} onClick={() => setPage((value) => Math.min(lastPage, value + 1))} className="btn-secondary text-xs disabled:opacity-50">التالي</button></div></div>
    </Card>
  </div>;
}
