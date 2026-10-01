import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, CreditCard, PackageCheck, ReceiptText, RefreshCw, Tags, Truck, Warehouse, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatNumber } from '@/lib/format';
import {
  createInvoiceFromOperationalOrder,
  fetchOperationalInvoices,
  fetchOperationalOrders,
  fetchOperationalPriceTruth,
  fetchOperationalSuppliers,
  fetchOperationalWarehouses,
  recordOperationalSalesPayment,
  transitionOperationalOrder,
  type OperationalInvoice,
  type OperationalOrder,
  type OperationalPriceTier,
  type OperationalSupplier,
  type OperationalWarehouse,
} from '@/lib/transactional-spine';

function nextStatusFor(order: OperationalOrder): string | null {
  if (order.status === 'pending') return 'confirmed';
  if (order.status === 'confirmed') return 'preparing';
  if (order.status === 'preparing') return 'ready';
  if (order.status === 'ready') return 'completed';
  return null;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'مسودة',
    pending: 'بانتظار التأكيد',
    confirmed: 'مؤكد',
    preparing: 'قيد التجهيز',
    ready: 'جاهز',
    completed: 'مكتمل',
    cancelled: 'ملغى',
    partially_paid: 'مدفوع جزئيًا',
    paid: 'مدفوع',
  };
  return labels[status] ?? status;
}

function money(value: number | null, currency = 'YER'): string {
  if (value == null || !Number.isFinite(value)) return 'غير متاح';
  try {
    return formatCurrency(value, currency);
  } catch {
    return new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 2 }).format(value) + ' ' + currency;
  }
}

function ErrorNote({ message }: { message: string }) {
  return <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-[11px] font-semibold text-danger-800">{message}</div>;
}

export function OperationsPage() {
  const [orders, setOrders] = useState<OperationalOrder[]>([]);
  const [invoices, setInvoices] = useState<OperationalInvoice[]>([]);
  const [prices, setPrices] = useState<OperationalPriceTier[]>([]);
  const [suppliers, setSuppliers] = useState<OperationalSupplier[]>([]);
  const [warehouses, setWarehouses] = useState<OperationalWarehouse[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    const results = await Promise.allSettled([
      fetchOperationalOrders(),
      fetchOperationalInvoices(),
      fetchOperationalPriceTruth(),
      fetchOperationalSuppliers(),
      fetchOperationalWarehouses(),
    ]);
    const nextErrors: Record<string, string | null> = {};
    if (results[0].status === 'fulfilled') setOrders(results[0].value); else nextErrors.orders = results[0].reason instanceof Error ? results[0].reason.message : 'تعذر قراءة الطلبات';
    if (results[1].status === 'fulfilled') setInvoices(results[1].value); else nextErrors.invoices = results[1].reason instanceof Error ? results[1].reason.message : 'تعذر قراءة الفواتير';
    if (results[2].status === 'fulfilled') setPrices(results[2].value); else nextErrors.prices = results[2].reason instanceof Error ? results[2].reason.message : 'تعذر قراءة التسعير';
    if (results[3].status === 'fulfilled') setSuppliers(results[3].value); else nextErrors.suppliers = results[3].reason instanceof Error ? results[3].reason.message : 'تعذر قراءة الموردين';
    if (results[4].status === 'fulfilled') setWarehouses(results[4].value); else nextErrors.warehouses = results[4].reason instanceof Error ? results[4].reason.message : 'تعذر قراءة المستودعات';
    setErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selectedInvoice = useMemo(() => invoices.find(item => item.id === selectedInvoiceId) ?? null, [invoices, selectedInvoiceId]);

  const runOrderTransition = async (order: OperationalOrder) => {
    const next = nextStatusFor(order);
    if (!next) return;
    setBusy('order:' + order.id);
    setFeedback(null);
    try {
      await transitionOperationalOrder(order.id, next);
      setFeedback('تم حفظ انتقال الطلب وإعادة قراءة الحالة من المصدر.');
      await load();
    } catch (cause) {
      setFeedback(cause instanceof Error ? cause.message : 'تعذر تنفيذ انتقال الطلب');
    } finally {
      setBusy(null);
    }
  };

  const createInvoice = async (order: OperationalOrder) => {
    setBusy('invoice:' + order.id);
    setFeedback(null);
    try {
      await createInvoiceFromOperationalOrder(order.id);
      setFeedback('تم تثبيت/قراءة الفاتورة المرتبطة بالطلب من المصدر.');
      await load();
    } catch (cause) {
      setFeedback(cause instanceof Error ? cause.message : 'تعذر تثبيت الفاتورة');
    } finally {
      setBusy(null);
    }
  };

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedInvoice) return;
    const amount = Number(paymentAmount);
    setBusy('payment');
    setFeedback(null);
    try {
      await recordOperationalSalesPayment({
        invoiceId: selectedInvoice.id,
        amount,
        method: paymentMethod,
        reference: paymentReference,
        paymentDate,
      });
      setPaymentAmount('');
      setPaymentReference('');
      setFeedback('تم تسجيل الدفعة وإعادة قراءة الفاتورة والرصيد من المصدر.');
      await load();
    } catch (cause) {
      setFeedback(cause instanceof Error ? cause.message : 'تعذر تسجيل الدفعة');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <div dir="rtl"><PageHeader title="مركز العمليات" subtitle="تشغيل المعاملات الفعلية المرتبطة بالحقيقة الكانونية." /><div className="py-20 text-center text-sm text-ink-500">جارٍ قراءة الطلبات والفواتير والتسعير والموردين والمستودعات...</div></div>;
  }

  return (
    <div dir="rtl" className="space-y-5 animate-fade-in pb-10">
      <PageHeader
        title="مركز العمليات"
        subtitle="طلب → تنفيذ/مستودع → فاتورة → تحصيل، مع قراءة التسعير والموردين من المصدر."
        actions={<button type="button" onClick={() => void load()} disabled={busy !== null} className="btn-secondary inline-flex items-center gap-2 text-xs"><RefreshCw size={14}/> تحديث</button>}
      />
      {feedback && <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-xs font-bold text-primary-900" role="status">{feedback}</div>}

      <section className="grid gap-3 md:grid-cols-5">
        {([
          { label: 'الطلبات', value: orders.length, Icon: PackageCheck },
          { label: 'الفواتير', value: invoices.length, Icon: ReceiptText },
          { label: 'التسعير', value: prices.length, Icon: Tags },
          { label: 'الموردون', value: suppliers.length, Icon: Truck },
          { label: 'المستودعات', value: warehouses.length, Icon: Warehouse },
        ] satisfies Array<{ label: string; value: number; Icon: LucideIcon }>).map(({ label, value, Icon }) => (
          <article key={label} className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
            <div className="flex items-center gap-2 text-[10px] font-black text-ink-500"><Icon size={14}/>{label}</div>
            <div className="mt-2 text-2xl font-black text-ink-950">{formatNumber(value)}</div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 p-4">
            <div><div className="section-kicker">ORDER → FULFILLMENT</div><h2 className="mt-1 text-lg font-black text-ink-950">سير الطلبات</h2></div>
            <Badge variant="neutral">{orders.length} سجل</Badge>
          </div>
          {errors.orders && <div className="p-4"><ErrorNote message={errors.orders}/></div>}
          {!errors.orders && !orders.length && <div className="p-6 text-center text-xs text-ink-500">لا توجد طلبات تشغيلية متاحة في tenant الحالي.</div>}
          {!errors.orders && orders.length > 0 && <div className="divide-y divide-ink-100">
            {orders.map(order => {
              const next = nextStatusFor(order);
              return <div key={order.id} className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-black">#{order.order_number}</span><Badge variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>{statusLabel(order.status)}</Badge></div>
                    <div className="mt-1 text-sm font-black text-ink-900">{order.customer?.name ?? 'عميل غير متاح'} · {order.warehouse?.name ?? 'مستودع غير متاح'}</div>
                    <div className="mt-1 text-[10px] text-ink-500">{money(order.total, order.currency)} · {new Date(order.created_at).toLocaleString('ar-YE')}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {next && <button type="button" onClick={() => void runOrderTransition(order)} disabled={busy !== null} className="btn-primary text-[11px]" data-testid={'advance-order-' + order.id}>{busy === 'order:' + order.id ? 'جارٍ الحفظ...' : 'تقدم إلى ' + statusLabel(next)} <ChevronLeft size={13}/></button>}
                    {order.status === 'completed' && <button type="button" onClick={() => void createInvoice(order)} disabled={busy !== null} className="btn-secondary text-[11px]" data-testid={'create-invoice-' + order.id}>{busy === 'invoice:' + order.id ? 'جارٍ التثبيت...' : 'تثبيت/قراءة الفاتورة'} <ReceiptText size={13}/></button>}
                  </div>
                </div>
              </div>;
            })}
          </div>}
        </article>

        <article className="rounded-2xl border border-ink-200 bg-white shadow-card p-4">
          <div className="section-kicker">INVOICE → PAYMENT</div>
          <h2 className="mt-1 text-lg font-black text-ink-950">الفواتير والتحصيل</h2>
          <p className="mt-1 text-[11px] text-ink-500">الدفعة تمر عبر RPC المحمي، ثم تعاد قراءة حالة الفاتورة والرصيد.</p>
          {errors.invoices && <div className="mt-4"><ErrorNote message={errors.invoices}/></div>}
          {!errors.invoices && <div className="mt-4 space-y-2">
            {invoices.slice(0, 8).map(invoice => {
              const balance = Math.max(0, invoice.total - invoice.paid_amount);
              return <button key={invoice.id} type="button" onClick={() => setSelectedInvoiceId(invoice.id)} className={'w-full rounded-xl border p-3 text-right ' + (selectedInvoiceId === invoice.id ? 'border-primary-300 bg-primary-50' : 'border-ink-100 bg-ink-50/40 hover:border-primary-200')} data-testid={'invoice-' + invoice.id}>
                <div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{invoice.invoice_number}</span><Badge variant={balance <= 0 ? 'success' : 'warning'}>{statusLabel(invoice.status)}</Badge></div>
                <div className="mt-1 text-[10px] text-ink-500">{invoice.customer?.name ?? 'عميل غير متاح'} · متبقّي {money(balance, invoice.currency)}</div>
              </button>;
            })}
            {!invoices.length && <div className="rounded-xl border border-dashed border-ink-200 p-4 text-center text-xs text-ink-500">لا توجد فواتير متاحة.</div>}
          </div>}
          {selectedInvoice && <form onSubmit={submitPayment} className="mt-4 space-y-3 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
            <div className="text-xs font-black text-primary-900">تسجيل دفعة · {selectedInvoice.invoice_number}</div>
            <label className="block text-[10px] font-bold text-ink-600">المبلغ<input value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} type="number" min="0.01" step="0.01" required className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"/></label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-[10px] font-bold text-ink-600">الطريقة<select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"><option value="cash">نقد</option><option value="bank">تحويل بنكي</option><option value="card">بطاقة</option></select></label>
              <label className="block text-[10px] font-bold text-ink-600">التاريخ<input value={paymentDate} onChange={e => setPaymentDate(e.target.value)} type="date" required className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"/></label>
            </div>
            <label className="block text-[10px] font-bold text-ink-600">المرجع<input value={paymentReference} onChange={e => setPaymentReference(e.target.value)} placeholder="مرجع اختياري" className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"/></label>
            <button type="submit" disabled={busy !== null} className="btn-primary w-full justify-center text-xs">{busy === 'payment' ? 'جارٍ التسجيل...' : 'تسجيل الدفعة وإعادة القراءة'} <CreditCard size={14}/></button>
          </form>}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
          <div className="section-kicker">PRICING TRUTH</div><h2 className="mt-1 text-lg font-black">التسعير المرتبط بالعميل</h2>
          {errors.prices ? <div className="mt-3"><ErrorNote message={errors.prices}/></div> : <div className="mt-3 space-y-2">{prices.slice(0,8).map(price => <div key={price.id} className="rounded-xl bg-ink-50 p-3 text-[10px]"><div className="font-black">{price.product?.name ?? 'صنف غير متاح'} · {price.customer?.name ?? 'عميل غير متاح'}</div><div className="mt-1 text-ink-500">من {formatNumber(price.min_quantity)} وحدة · {money(price.unit_price, price.currency)}</div></div>)}{!prices.length&&<div className="text-xs text-ink-500">لا توجد شرائح سعر متاحة.</div>}</div>}
        </article>

        <article className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
          <div className="section-kicker">SUPPLIER OPERATIONS</div><h2 className="mt-1 text-lg font-black">سياق الموردين</h2>
          {errors.suppliers ? <div className="mt-3"><ErrorNote message={errors.suppliers}/></div> : <div className="mt-3 space-y-2">{suppliers.slice(0,8).map(supplier => <div key={supplier.id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-50 p-3"><div><div className="text-xs font-black">{supplier.name}</div><div className="mt-1 text-[10px] text-ink-500">{supplier.code ?? 'بدون كود'}</div></div><span className="text-[10px] font-bold text-ink-500">{supplier.payment_terms_days == null ? 'شروط الدفع غير متاحة' : formatNumber(supplier.payment_terms_days) + ' يوم'}</span></div>)}{!suppliers.length&&<div className="text-xs text-ink-500">لا يوجد موردون في tenant الحالي.</div>}</div>}
        </article>

        <article className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
          <div className="section-kicker">FULFILLMENT / WAREHOUSE</div><h2 className="mt-1 text-lg font-black">المستودعات</h2>
          {errors.warehouses ? <div className="mt-3"><ErrorNote message={errors.warehouses}/></div> : <div className="mt-3 space-y-2">{warehouses.map(warehouse => <div key={warehouse.id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-50 p-3"><div><div className="text-xs font-black">{warehouse.name}</div><div className="mt-1 text-[10px] text-ink-500">{warehouse.code ?? 'بدون كود'}</div></div><Badge variant={warehouse.is_active ? 'success' : 'neutral'}>{warehouse.is_active ? 'نشط' : 'متوقف'}</Badge></div>)}{!warehouses.length&&<div className="text-xs text-ink-500">لا توجد مستودعات متاحة.</div>}</div>}
        </article>
      </section>
    </div>
  );
}
