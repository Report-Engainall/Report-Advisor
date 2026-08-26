import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchInventoryReportSnapshot, type InventoryReportSnapshot, type InventoryReportRow } from '@/lib/report-truth';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';

const PAGE_SIZE = 25;

export function InventoryPageCanonical() {
  const [page, setPage] = useState(0);
  const [snapshot, setSnapshot] = useState<InventoryReportSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(targetPage = page) {
    try {
      setLoading(true);
      setError(null);
      setSnapshot(await fetchInventoryReportSnapshot(targetPage, PAGE_SIZE));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل المخزون');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(page); }, [page]);

  if (loading) return <LoadingState message="جارٍ تحميل المخزون من المصدر القانوني..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load(page)} />;
  if (!snapshot) return <ErrorState message="تعذر إثبات لقطة المخزون" onRetry={() => void load(page)} />;

  const lastPage = Math.max(0, Math.ceil(snapshot.totalRows / PAGE_SIZE) - 1);
  const canPrev = page > 0;
  const canNext = page < lastPage;

  const exportRows = snapshot.rows.map((row: InventoryReportRow) => ({
    المنتج: row.product?.name ?? null,
    المستودع: row.warehouse?.name ?? null,
    الكمية: row.quantity,
    التكلفة: row.unit_cost,
    القيمة: row.quantity == null || row.unit_cost == null ? null : row.quantity * row.unit_cost,
    آخر_حركة: row.last_movement_date ? formatDate(row.last_movement_date) : null,
  }));

  return <div className="space-y-6 animate-fade-in">
    <PageHeader title="المخزون" subtitle="القيم التجارية والتعدادات من التجميع الخادمي؛ الجدول صفحة عرض فقط" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card><CardBody><div className="text-xs text-ink-500 mb-1">قيمة المخزون</div><div className="text-xl font-bold text-ink-900">{formatCurrency(snapshot.totalValue)}</div></CardBody></Card>
      <Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي الصفوف</div><div className="text-xl font-bold text-ink-900">{formatNumber(snapshot.totalRows)}</div></CardBody></Card>
      <Card><CardBody><div className="text-xs text-ink-500 mb-1">مخزون منخفض</div><div className="text-xl font-bold text-warning-600">{formatNumber(snapshot.lowStockRows)}</div></CardBody></Card>
      <Card><CardBody><div className="text-xs text-ink-500 mb-1">نفد المخزون</div><div className="text-xl font-bold text-danger-600">{formatNumber(snapshot.outOfStockRows)}</div></CardBody></Card>
    </div>
    {snapshot.incompleteRows > 0 && <div role="alert" className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">لا يمكن اعتبار قيمة المخزون مكتملة: {formatNumber(snapshot.incompleteRows)} صفوف تفتقد كمية أو تكلفة. لم يتم تحويلها إلى صفر.</div>}
    <Card>
      <CardHeader title="تفاصيل المخزون" subtitle={`صفحة ${page + 1} من ${Math.max(1, lastPage + 1)} — ${formatNumber(snapshot.rows.length)} صفوف معروضة من ${formatNumber(snapshot.totalRows)}`} />
      <DataTable columns={[
        { key: 'product', label: 'المنتج', render: (r: InventoryReportRow) => r.product?.name || '—' },
        { key: 'warehouse', label: 'المستودع', render: (r: InventoryReportRow) => r.warehouse?.name || '—' },
        { key: 'quantity', label: 'الكمية', align: 'right', render: (r: InventoryReportRow) => formatNumber(r.quantity) },
        { key: 'unit_cost', label: 'التكلفة', align: 'right', render: (r: InventoryReportRow) => formatCurrency(r.unit_cost) },
        { key: 'value', label: 'القيمة', align: 'right', render: (r: InventoryReportRow) => formatCurrency(r.quantity == null || r.unit_cost == null ? null : r.quantity * r.unit_cost) },
        { key: 'status', label: 'الحالة', align: 'center', render: (r: InventoryReportRow) => r.quantity == null ? <Badge variant="neutral">غير مكتمل</Badge> : r.quantity <= 0 ? <Badge variant="danger">نفد</Badge> : r.product?.reorder_point != null && r.quantity <= r.product.reorder_point ? <Badge variant="warning">منخفض</Badge> : <Badge variant="success">متاح</Badge> },
      ]} data={snapshot.rows} emptyMessage="لا توجد بيانات مخزون" />
      <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-4 py-3 text-xs text-ink-500">
        <span>التجميع التجاري مستقل عن pagination.</span>
        <div className="flex gap-2">
          <button type="button" disabled={!canPrev} onClick={() => setPage(value => Math.max(0, value - 1))} className="btn-secondary text-xs disabled:opacity-50">السابق</button>
          <button type="button" disabled={!canNext} onClick={() => setPage(value => Math.min(lastPage, value + 1))} className="btn-secondary text-xs disabled:opacity-50">التالي</button>
        </div>
      </div>
    </Card>
  </div>;
}
