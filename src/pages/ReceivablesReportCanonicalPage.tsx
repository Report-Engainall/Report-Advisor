import { useCallback, useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { fetchReceivablesReportPage, type ReceivablesReportPage, type ReceivablesReportRow, fetchReceivablesExportRows } from '@/lib/queries';
import { downloadReportArtifact } from '@/lib/report-execution/download';

export function ReceivablesReportCanonicalPage() {
  const [snapshot, setSnapshot] = useState<ReceivablesReportPage | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 25;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setSnapshot(await fetchReceivablesReportPage(page, pageSize)); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'تعذر تحميل الذمم'); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { void load(); }, [load]);
  if (loading && !snapshot) return <LoadingState />;
  if (error && !snapshot) return <ErrorState message={error} onRetry={load} />;
  if (!snapshot) return null;
  const totalPages = Math.max(1, Math.ceil(snapshot.total_rows / pageSize));
  const exportRows = async () => {
    const rows = await fetchReceivablesExportRows();
    downloadReportArtifact('receivables-report', 'تقرير الذمم والتحصيل', ['رقم الفاتورة','العميل','تاريخ الفاتورة','تاريخ الاستحقاق','الإجمالي','المدفوع','المتبقي'], rows.map(r => ({ 'رقم الفاتورة': r.invoice_number, 'العميل': r.customer, 'تاريخ الفاتورة': r.invoice_date, 'تاريخ الاستحقاق': r.due_date, 'الإجمالي': r.total, 'المدفوع': r.paid_amount, 'المتبقي': r.balance })));
  };
  return <div className="space-y-6 animate-fade-in">
    <PageHeader title="تقرير الذمم والتحصيل" subtitle="الإجماليات والصفحات مشتقة من نفس الحقيقة المعتمدة على الخادم." actions={<button onClick={() => void exportRows()} className="btn-secondary text-xs">تصدير XLSX</button>} />
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <Card><CardBody><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><div className="text-xs text-ink-500">إجمالي الذمم</div><div className="text-2xl font-bold text-ink-900">{formatCurrency(snapshot.total_outstanding)}</div></div><div><div className="text-xs text-ink-500">عدد الفواتير المستحقة</div><div className="text-2xl font-bold text-ink-900">{formatNumber(snapshot.total_rows)}</div></div></div></CardBody></Card>
    <Card><CardHeader title="الفواتير المستحقة" subtitle={`صفحة ${snapshot.page + 1} من ${totalPages}`} /><DataTable columns={[{key:'invoice_number',label:'رقم الفاتورة',render:(r:ReceivablesReportRow)=><span className="font-medium text-primary-600">{r.invoice_number}</span>},{key:'customer',label:'العميل',render:(r:ReceivablesReportRow)=>r.customer?.name||'—'},{key:'invoice_date',label:'تاريخ الفاتورة',render:(r:ReceivablesReportRow)=>formatDate(r.invoice_date)},{key:'due_date',label:'تاريخ الاستحقاق',render:(r:ReceivablesReportRow)=>r.due_date?formatDate(r.due_date):'—'},{key:'total',label:'الإجمالي',align:'right',render:(r:ReceivablesReportRow)=>formatCurrency(r.total)},{key:'paid_amount',label:'المدفوع',align:'right',render:(r:ReceivablesReportRow)=>formatCurrency(r.paid_amount)},{key:'balance',label:'المتبقي',align:'right',render:(r:ReceivablesReportRow)=>formatCurrency(r.balance)},{key:'status',label:'الحالة',align:'center',render:(r:ReceivablesReportRow)=><Badge variant={r.status==='paid'?'success':'warning'}>{r.status||'غير محدد'}</Badge>}]} data={snapshot.rows} emptyMessage="لا توجد ذمم مستحقة" /></Card>
    <div className="flex items-center justify-between"><span className="text-xs text-ink-500">عرض {snapshot.rows.length} من {formatNumber(snapshot.total_rows)}</span><div className="flex gap-2"><button disabled={page===0} onClick={() => setPage(p => Math.max(0,p-1))} className="px-3 py-1.5 rounded-lg border border-ink-200 text-xs disabled:opacity-40">السابق</button><button disabled={page+1>=totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1.5 rounded-lg border border-ink-200 text-xs disabled:opacity-40">التالي</button></div></div>
  </div>;
}
