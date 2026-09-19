import { useCallback, useEffect, useState } from 'react';
import { ArrowUpLeft, Banknote, CircleAlert, ShieldCheck, Target } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { BusinessInvestigationDrawer, type InvestigationTarget } from '@/components/BusinessInvestigationDrawer';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { fetchReceivablesReportPage, fetchReceivablesExportRows, type ReceivablesReportPage, type ReceivablesReportRow } from '@/lib/queries';
import { downloadReportArtifact } from '@/lib/report-execution/download';

export function ReceivablesReportCanonicalPage() {
  const [snapshot, setSnapshot] = useState<ReceivablesReportPage | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 25;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [investigation, setInvestigation] = useState<InvestigationTarget | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setSnapshot(await fetchReceivablesReportPage(page, pageSize)); } catch (e: unknown) { setError(e instanceof Error ? e.message : 'تعذر تحميل الذمم'); } finally { setLoading(false); } }, [page]);
  useEffect(() => { void load(); }, [load]);
  if (loading && !snapshot) return <LoadingState />;
  if (error && !snapshot) return <ErrorState message={error} onRetry={load} />;
  if (!snapshot) return null;
  const totalPages = Math.max(1, Math.ceil(snapshot.total_rows / pageSize));
  const exportRows = async () => { const rows = await fetchReceivablesExportRows(); downloadReportArtifact('receivables-report', 'تقرير الذمم والتحصيل', ['رقم الفاتورة','العميل','تاريخ الفاتورة','تاريخ الاستحقاق','الإجمالي','المدفوع','المتبقي'], rows.map(r => ({ 'رقم الفاتورة': r.invoice_number, 'العميل': r.customer, 'تاريخ الفاتورة': r.invoice_date, 'تاريخ الاستحقاق': r.due_date, 'الإجمالي': r.total, 'المدفوع': r.paid_amount, 'المتبقي': r.balance })) ); };

  const openMoneyContext = () => setInvestigation({
    title: 'التعرض المالي والتحصيل', eyebrow: 'Money Lens · التحصيل', severity: snapshot.total_outstanding > 0 ? 'warning' : 'info',
    summary: 'هذه اللقطة تجيب عن حجم التعرض المالي الحالي. لا تستنتج منها وحدها سبب التأخر أو أولوية العميل؛ ذلك يحتاج إلى تفاصيل الفاتورة والسياق التشغيلي.',
    facts: [
      { label: 'إجمالي الذمم', value: formatCurrency(snapshot.total_outstanding) },
      { label: 'الفواتير المتاحة', value: formatNumber(snapshot.total_rows) },
      { label: 'صفحة العرض', value: String(snapshot.page + 1) + ' / ' + String(totalPages) },
      { label: 'عدد الصفوف المعروضة', value: formatNumber(snapshot.rows.length) },
    ],
    confirmedReasons: ['الإجمالي مشتق من المسار المالي المعتمد على الخادم.'],
    missingEvidence: ['سبب التأخر لكل تعرض.', 'أولوية التحصيل على مستوى العميل.', 'أثر أي إجراء تحصيلي فعلي بعد التنفيذ.'],
    actions: [
      { label: 'افتح مركز العمل', path: '/work-center', hint: 'انتقل للاستثناءات والإجراءات التشغيلية الموثقة.' },
      { label: 'افتح ذكاء العملاء', path: '/analytics/rfm', hint: 'ضع التعرض المالي داخل سياق سلوك العميل عندما تتوفر البيانات.' },
      { label: 'افتح تجربة القرار', path: '/decision-experience?stage=evidence', hint: 'راجع الدليل قبل اعتماد أي إجراء.' },
    ],
    evidence: { source: 'fetchReceivablesReportPage', asOf: 'current tenant snapshot', status: 'CANONICAL', formula: 'الإجمالي المستحق من السجل المالي المعتمد' },
  });

  const inspectInvoice = (row: ReceivablesReportRow) => setInvestigation({
    title: row.invoice_number, eyebrow: 'تعرض مالي · فاتورة', severity: row.balance > 0 ? 'warning' : 'info',
    summary: 'سياق الفاتورة من السجل الحالي. ظهورها هنا لا يعني أن التحصيل تأخر بسبب محدد لم يثبت في المصدر.',
    facts: [
      { label: 'العميل', value: row.customer?.name || 'غير متاح' },
      { label: 'الإجمالي', value: formatCurrency(row.total) },
      { label: 'المدفوع', value: formatCurrency(row.paid_amount) },
      { label: 'المتبقي', value: formatCurrency(row.balance) },
      { label: 'الاستحقاق', value: row.due_date ? formatDate(row.due_date) : 'غير متاح' },
      { label: 'الحالة', value: row.status || 'غير محددة' },
    ],
    confirmedReasons: [],
    missingEvidence: ['سبب عدم السداد.', 'التواصل التحصيلي والنتيجة الفعلية، إن وجدت.'],
    actions: [
      { label: 'افتح مركز العمل', path: '/work-center', hint: 'راجع ما هو قابل للإجراء من المسار التشغيلي.' },
      { label: 'افتح القرار', path: '/decision-experience?stage=decision', hint: 'لا تعتمد إجراءً قبل مراجعة الدليل.' },
    ],
    evidence: { source: 'fetchReceivablesReportPage', asOf: row.invoice_date, status: row.status || 'UNSPECIFIED', formula: 'المتبقي = الإجمالي − المدفوع' },
  });

  return <div dir="rtl" className="report-page space-y-5 animate-fade-in">
    <PageHeader title="التحصيل والنقد" subtitle="Money Lens: من حجم التعرض إلى السؤال التجاري: ماذا يحتاج انتباهًا، وما الدليل، وما الخطوة التالية؟" actions={<div className="flex items-center gap-2"><button onClick={() => void exportRows()} className="btn-secondary text-xs">تصدير XLSX</button><button type="button" onClick={() => window.print()} className="btn-primary print-hide text-xs">طباعة</button></div>} />
    {error && <div role="alert" className="danger-callout text-xs font-semibold text-danger-800">{error}</div>}
    <section className="rounded-[18px] border border-[#15372f] bg-[#0d2a24] p-4 text-white sm:p-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-[10px] font-black tracking-[0.14em] text-white/40">MONEY → TRUST → ACTION</div><h2 className="mt-1 text-lg font-black">ما حجم التعرض؟ وما الذي نستطيع إثباته الآن؟</h2><p className="mt-1 max-w-2xl text-[11px] leading-5 text-white/55">النظام يعرض التعرض المالي من المصدر أولًا، ثم يفتح التحقيق قبل أن يدعي أن هناك سببًا أو إجراءً مكتملًا.</p></div><button type="button" onClick={openMoneyContext} className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15"><ShieldCheck size={15}/> افحص سلسلة الإثبات</button></div><div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-xl border border-white/10 bg-white/[.045] p-3"><div className="text-[10px] text-white/40">التعرض</div><div className="mt-1 text-xl font-black">{formatCurrency(snapshot.total_outstanding)}</div></div><div className="rounded-xl border border-white/10 bg-white/[.045] p-3"><div className="text-[10px] text-white/40">الحالة</div><div className="mt-1 text-sm font-black">مصدر مالي معتمد</div></div><div className="rounded-xl border border-white/10 bg-white/[.045] p-3"><div className="text-[10px] text-white/40">القرار التالي</div><div className="mt-1 text-sm font-black">تحقق من التعرض قبل التدخل</div></div></div></section>
    <section className="grid gap-3 md:grid-cols-2"><Card className="hero-surface" hover onClick={openMoneyContext}><CardBody><div className="flex items-center gap-2"><Banknote size={16} className="text-primary-600"/><div className="surface-label">إجمالي الذمم</div></div><div className="display-number mt-1">{formatCurrency(snapshot.total_outstanding)}</div><div className="mt-1 text-[11px] text-ink-400">المتبقي المستخرج من السجلات المعتمدة · انقر للتحقيق</div></CardBody></Card><Card hover onClick={openMoneyContext}><CardBody><div className="surface-label">الفواتير المتاحة</div><div className="display-number mt-1">{formatNumber(snapshot.total_rows)}</div><div className="mt-1 text-[11px] text-ink-400">لا تعني كثرة الصفوف وحدها أن الخطر أعلى</div></CardBody></Card></section>
    <div className="report-meta"><span>صفحة {snapshot.page + 1} من {totalPages}</span><span>المصدر: المسار المالي المعتمد</span><span>العملة والسياق حسب بيانات المستأجر</span></div>
    <Card><CardHeader title="خريطة التعرض" subtitle="الفاتورة هنا نقطة دخول للتحقيق، لا مجرد صف جدول."/><DataTable columns={[{key:'invoice_number',label:'رقم الفاتورة',render:(r:ReceivablesReportRow)=><button type="button" onClick={() => inspectInvoice(r)} className="font-medium text-primary-700 hover:underline">{r.invoice_number}</button>},{key:'customer',label:'العميل',render:(r:ReceivablesReportRow)=>r.customer?.name||'—'},{key:'invoice_date',label:'تاريخ الفاتورة',render:(r:ReceivablesReportRow)=>formatDate(r.invoice_date)},{key:'due_date',label:'تاريخ الاستحقاق',render:(r:ReceivablesReportRow)=>r.due_date?formatDate(r.due_date):'—'},{key:'total',label:'الإجمالي',align:'right',render:(r:ReceivablesReportRow)=>formatCurrency(r.total)},{key:'paid_amount',label:'المدفوع',align:'right',render:(r:ReceivablesReportRow)=>formatCurrency(r.paid_amount)},{key:'balance',label:'المتبقي',align:'right',render:(r:ReceivablesReportRow)=><button type="button" onClick={() => inspectInvoice(r)} className="font-semibold text-ink-900 hover:text-primary-700">{formatCurrency(r.balance)}</button>},{key:'status',label:'الحالة',align:'center',render:(r:ReceivablesReportRow)=><Badge variant={r.status==='paid'?'success':'warning'}>{r.status||'غير محدد'}</Badge>}]} data={snapshot.rows} emptyMessage="لا توجد ذمم مستحقة" /></Card>
    <div className="flex items-center justify-between"><span className="text-xs text-ink-500">عرض {snapshot.rows.length} من {formatNumber(snapshot.total_rows)}</span><div className="flex gap-2"><button disabled={page===0} onClick={() => setPage(p => Math.max(0,p-1))} className="px-3 py-1.5 rounded-lg border border-ink-200 text-xs disabled:opacity-40">السابق</button><button disabled={page+1>=totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1.5 rounded-lg border border-ink-200 text-xs disabled:opacity-40">التالي</button></div></div>
    <div className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-[11px] text-ink-500"><CircleAlert size={15} className="text-warning-600"/><span>التعرض المالي لا يساوي سببًا. التحقيق هو الذي يحدد ما يمكن فعله، والدليل هو الذي يحدد ما يمكن الوثوق به.</span><Target size={15} className="ms-auto text-primary-600"/></div>
    <BusinessInvestigationDrawer target={investigation} onClose={() => setInvestigation(null)} />
  </div>;
}
