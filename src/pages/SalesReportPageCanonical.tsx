import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchSalesInvoices } from '@/lib/queries';
import { fetchSalesReportTruth, type SalesReportTruth } from '@/lib/sales-report-truth';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import { downloadReportArtifact } from '@/lib/report-execution/download';
import type { SalesInvoice } from '@/lib/types';

export function SalesReportPageCanonical() {
  const [truth, setTruth] = useState<SalesReportTruth | null>(null);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchSalesReportTruth(), fetchSalesInvoices(0, 20)])
      .then(([summary, result]) => {
        setTruth(summary);
        setInvoices(result.data);
        setLoading(false);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'تعذر تحميل تقرير المبيعات');
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!truth) return <ErrorState message="تعذر تحميل حقيقة المبيعات" />;

  const exportSales = () => downloadReportArtifact(
    'sales-report-page',
    'تقرير المبيعات (الصفحة الحالية)',
    ['رقم الفاتورة', 'العميل', 'التاريخ', 'الإجمالي', 'المدفوع', 'الحالة'],
    invoices.map((invoice) => ({
      'رقم الفاتورة': invoice.invoice_number,
      'العميل': invoice.customer?.name ?? null,
      'التاريخ': invoice.invoice_date,
      'الإجمالي': invoice.total,
      'المدفوع': invoice.paid_amount,
      'الحالة': invoice.status,
    })),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="تقرير المبيعات"
        subtitle={truth.status === 'CALCULATED' ? 'الحقيقة من مصدر المبيعات الخادمي؛ الجدول صفحة عرض فقط' : 'البيانات غير كافية لإثبات إجماليات المبيعات'}
        actions={<button onClick={exportSales} className="btn-secondary text-xs">تصدير الصفحة</button>}
      />
      {truth.status === 'INSUFFICIENT_DATA' && (
        <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">
          توجد بيانات مالية ناقصة؛ لم تُحوّل البيانات المفقودة إلى صفر.
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardBody><div className="text-xs text-ink-500">إجمالي المبيعات</div><div className="text-xl font-bold">{formatCurrency(truth.totalSales)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500">عدد الفواتير</div><div className="text-xl font-bold">{formatNumber(truth.invoiceCount)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500">متوسط الفاتورة</div><div className="text-xl font-bold">{formatCurrency(truth.avgInvoiceValue)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs text-ink-500">التحصيل</div><div className="text-xl font-bold">{truth.collectionRate == null ? '—' : `${truth.collectionRate.toFixed(1)}%`}</div></CardBody></Card>
      </div>
      <Card>
        <CardHeader title="آخر الفواتير" subtitle="تصدير الصفحة الحالية فقط" />
        <DataTable
          columns={[
            { key: 'invoice_number', label: 'رقم الفاتورة', render: (r: SalesInvoice) => <span className="font-medium text-primary-600">{r.invoice_number}</span> },
            { key: 'customer', label: 'العميل', render: (r: SalesInvoice) => r.customer?.name || '—' },
            { key: 'invoice_date', label: 'التاريخ', render: (r: SalesInvoice) => formatDate(r.invoice_date) },
            { key: 'total', label: 'الإجمالي', align: 'right', render: (r: SalesInvoice) => formatCurrency(r.total) },
            { key: 'paid_amount', label: 'المدفوع', align: 'right', render: (r: SalesInvoice) => formatCurrency(r.paid_amount) },
            { key: 'status', label: 'الحالة', align: 'center', render: (r: SalesInvoice) => <Badge variant="neutral">{r.status}</Badge> },
          ]}
          data={invoices}
        />
      </Card>
    </div>
  );
}
