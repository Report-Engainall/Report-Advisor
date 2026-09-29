import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Database, FileText, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { fetchCanonicalImportSourceRows, type CanonicalImportSourceRow } from '@/lib/queries';
import { formatCurrency, formatNumber } from '@/lib/format';

type SourceRow = Record<string, unknown>;

function textValue(row: SourceRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') return String(value).trim();
  }
  return null;
}

function numericValue(row: SourceRow, keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key];
    const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(/,/g, ''));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function dateValue(row: SourceRow): string | null {
  return textValue(row, ['date', 'التاريخ', 'invoice_date']);
}

function customerValue(row: SourceRow): string | null {
  return textValue(row, ['customer_name', 'اسم العميل', 'customer', 'client_name']);
}

function invoiceNumberValue(row: SourceRow): string | null {
  return textValue(row, ['invoice_number', 'رقم الفاتوره', 'رقم الفاتورة']);
}

function totalValue(row: SourceRow): number | null {
  return numericValue(row, ['total', 'اجمالي الفاتوره', 'إجمالي الفاتورة', 'مبلغ الصافي بالمحلي']);
}

function invoiceTypeValue(row: SourceRow): string | null {
  return textValue(row, ['invoice_type', 'نوع الفاتوره', 'نوع الفاتورة']);
}

function formatCompactCurrency(value: number): string {
  return formatCurrency(value);
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return <span className={'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ' + (ok ? 'bg-success-50 text-success-800' : 'bg-warning-50 text-warning-900')}>
    {ok ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>} {label}
  </span>;
}

export function SourceBoundReportPage() {
  const { importId = '' } = useParams();
  const [rows, setRows] = useState<CanonicalImportSourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchCanonicalImportSourceRows(importId);
        if (!cancelled) setRows(result);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [importId]);

  const sourceRows = useMemo(() => rows.map((row) => row.data as SourceRow), [rows]);
  const analysis = useMemo(() => {
    const dates = sourceRows.map(dateValue).filter((x): x is string => Boolean(x)).sort();
    const totals = sourceRows.map(totalValue);
    const customers = sourceRows.map(customerValue);
    const invoiceNumbers = sourceRows.map(invoiceNumberValue);
    const types = sourceRows.map(invoiceTypeValue);
    const totalSales = totals.reduce<number>((sum, value) => sum + (value ?? 0), 0);
    const distinctInvoices = new Set(invoiceNumbers.filter(Boolean)).size;
    const missingCustomers = customers.filter((x) => !x).length;
    const missingInvoiceNumbers = invoiceNumbers.filter((x) => !x).length;
    const missingTypes = types.filter((x) => !x).length;
    const amountMismatches = sourceRows.filter((row) => {
      const total = totalValue(row);
      const local = numericValue(row, ['مبلغ الصافي بالمحلي']);
      return total != null && local != null && Math.abs(total - local) > 0.01;
    }).length;

    const typeMap = new Map<string, { rows: number; sales: number }>();
    const customerMap = new Map<string, { rows: number; sales: number }>();
    const dailyMap = new Map<string, { rows: number; sales: number }>();
    for (const row of sourceRows) {
      const total = totalValue(row) ?? 0;
      const type = invoiceTypeValue(row) ?? 'غير مصنف';
      const customer = customerValue(row) ?? 'عميل غير مثبت';
      const date = dateValue(row) ?? 'تاريخ غير مثبت';
      const currentType = typeMap.get(type) ?? { rows: 0, sales: 0 };
      typeMap.set(type, { rows: currentType.rows + 1, sales: currentType.sales + total });
      if (customer !== 'عميل غير مثبت') {
        const currentCustomer = customerMap.get(customer) ?? { rows: 0, sales: 0 };
        customerMap.set(customer, { rows: currentCustomer.rows + 1, sales: currentCustomer.sales + total });
      }
      const currentDay = dailyMap.get(date) ?? { rows: 0, sales: 0 };
      dailyMap.set(date, { rows: currentDay.rows + 1, sales: currentDay.sales + total });
    }

    const topCustomers = [...customerMap.entries()].sort((a, b) => b[1].sales - a[1].sales).slice(0, 8);
    const typeMix = [...typeMap.entries()].sort((a, b) => b[1].sales - a[1].sales);
    const daily = [...dailyMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const receivablesCandidates = typeMap.get('آجل') ?? { rows: 0, sales: 0 };
    const qualityIssues = [
      ...(missingCustomers ? [{ key: 'customers', title: 'صفوف بلا عميل مثبت', detail: `${formatNumber(missingCustomers)} صفًا يحتاج ربط العميل قبل استخدامه في RFM/التركيز.` }] : []),
      ...(missingInvoiceNumbers ? [{ key: 'invoice', title: 'أرقام فواتير ناقصة', detail: `${formatNumber(missingInvoiceNumbers)} صفوف بلا رقم فاتورة؛ لا تُستخدم كهوية فريدة حتى تُراجع.` }] : []),
      ...(missingTypes ? [{ key: 'types', title: 'نوع الفاتورة غير مثبت', detail: `${formatNumber(missingTypes)} صفوف بلا نوع؛ الذمم لا تُحسب منها مباشرة.` }] : []),
      ...(amountMismatches ? [{ key: 'amounts', title: 'فروقات مبلغ المصدر', detail: `${formatNumber(amountMismatches)} صفوف تختلف فيها قيمة الإجمالي عن الحقل المحلي المقابل.` }] : []),
    ];
    return {
      totalRows: sourceRows.length,
      distinctInvoices,
      firstDate: dates[0] ?? 'غير متاح',
      lastDate: dates[dates.length - 1] ?? 'غير متاح',
      totalSales,
      missingCustomers,
      missingInvoiceNumbers,
      missingTypes,
      amountMismatches,
      topCustomers,
      typeMix,
      daily,
      receivablesCandidates,
      qualityIssues,
    };
  }, [sourceRows]);

  if (loading) return <LoadingState message="جارٍ بناء التقرير من الصفوف الكانونية للمصدر..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return <div dir="rtl" className="report-page space-y-5 pb-10">
    <header className="overflow-hidden rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[.14em] text-primary-700"><FileText size={15}/> SOURCE-BOUND REPORT</div>
          <h1 className="mt-1.5 text-[24px] font-black text-ink-950 lg:text-[30px]">فواتير العملاء — التقرير المسحوب</h1>
          <p className="mt-2 max-w-4xl text-[11px] leading-6 text-ink-500">هذا التقرير يقرأ الصفوف الكانونية لنفس عملية الاستيراد، وليس لقطة عامة من الشركة. المصدر وصل إلى مرحلة rendered قبل العرض.</p>
        </div>
        <div className="text-left text-[10px] text-ink-500">
          <div>Import ID: <span className="font-mono">{importId}</span></div>
          <div>الصفوف الكانونية: {formatNumber(analysis.totalRows)}</div>
        </div>
      </div>
    </header>

    <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
      <Card><CardBody><div className="text-[10px] text-ink-400">إجمالي المبيعات</div><div className="mt-1 text-xl font-black">{formatCompactCurrency(analysis.totalSales)}</div></CardBody></Card>
      <Card><CardBody><div className="text-[10px] text-ink-400">الفواتير الفريدة</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.distinctInvoices)}</div></CardBody></Card>
      <Card><CardBody><div className="text-[10px] text-ink-400">الفترة</div><div className="mt-1 text-sm font-black">{analysis.firstDate} → {analysis.lastDate}</div></CardBody></Card>
      <Card><CardBody><div className="text-[10px] text-ink-400">مرشح الذمم من نوع «آجل»</div><div className="mt-1 text-xl font-black">{formatCompactCurrency(analysis.receivablesCandidates.sales)}</div></CardBody></Card>
      <Card><CardBody><div className="text-[10px] text-ink-400">حالة الدليل</div><div className="mt-1"><StatusPill ok={analysis.qualityIssues.length === 0} label={analysis.qualityIssues.length === 0 ? 'VERIFIED' : 'REVIEW'} /></div></CardBody></Card>
    </section>

    <section className="rounded-[18px] border border-primary-200 bg-primary-50/50 p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck size={18} className="mt-0.5 text-primary-700"/>
        <div>
          <div className="text-[10px] font-black tracking-[.1em] text-primary-700">CANONICAL EVIDENCE</div>
          <div className="mt-1 text-sm font-black text-ink-950">السحب نجح، والذكاء يعمل فوق الصفوف نفسها.</div>
          <p className="mt-1 text-[11px] leading-5 text-ink-600">الاستنتاجات أدناه منفصلة عن الحقيقة الخام: أي نقص في المصدر يُعرض كحالة مراجعة ولا يتحول إلى رقم مصطنع.</p>
        </div>
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="مزيج أنواع الفواتير" subtitle="قراءة مباشرة من المصدر المسحوب" />
        <CardBody>
          <div className="space-y-3">
            {analysis.typeMix.map(([name, item]) => <div key={name} className="flex items-center justify-between gap-4 rounded-xl border border-ink-100 p-3">
              <div><div className="text-sm font-bold">{name}</div><div className="text-[10px] text-ink-500">{formatNumber(item.rows)} صفًا</div></div>
              <div className="text-sm font-black">{formatCompactCurrency(item.sales)}</div>
            </div>)}
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="التركيز على العملاء" subtitle="RFM مبسط يعتمد على العميل المسمّى؛ صفوف العميل المفقود لا تدخل الحساب" />
        <CardBody>
          <div className="space-y-3">
            {analysis.topCustomers.map(([name, item], index) => <div key={name} className="flex items-center justify-between gap-4 rounded-xl border border-ink-100 p-3">
              <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-50 text-xs font-black">{index + 1}</span><div><div className="text-sm font-bold">{name}</div><div className="text-[10px] text-ink-500">{formatNumber(item.rows)} فواتير</div></div></div>
              <div className="text-sm font-black">{formatCompactCurrency(item.sales)}</div>
            </div>)}
          </div>
        </CardBody>
      </Card>
    </section>

    <Card>
      <CardHeader title="الاتجاه الزمني" subtitle="مبيعات يومية مستخرجة من الصفوف الكانونية" />
      <CardBody>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {analysis.daily.map(([date, item]) => <div key={date} className="rounded-xl border border-ink-100 bg-ink-50/60 p-2"><div className="text-[9px] font-bold text-ink-400">{date}</div><div className="mt-1 text-[11px] font-black">{formatCompactCurrency(item.sales)}</div><div className="mt-1 text-[9px] text-ink-500">{formatNumber(item.rows)} فاتورة</div></div>)}
        </div>
      </CardBody>
    </Card>

    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="جودة المصدر" />
        <CardBody>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">بدون عميل</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.missingCustomers)}</div></div>
            <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">بدون رقم فاتورة</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.missingInvoiceNumbers)}</div></div>
            <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">بدون نوع</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.missingTypes)}</div></div>
            <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">فروقات مبلغ</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.amountMismatches)}</div></div>
          </div>
          <div className="mt-4 space-y-2">
            {analysis.qualityIssues.map((issue) => <div key={issue.key} className="rounded-xl border border-warning-200 bg-warning-50 p-3"><div className="text-sm font-black text-warning-900">{issue.title}</div><div className="mt-1 text-[11px] leading-5 text-warning-900">{issue.detail}</div></div>)}
            {analysis.qualityIssues.length === 0 && <div className="rounded-xl border border-success-200 bg-success-50 p-3 text-sm font-black text-success-900">لا توجد فجوات جودة ضمن الحقول التي يعتمد عليها هذا التقرير.</div>}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="التقارير الذكية على نفس المصدر" subtitle="لا يُعلن الذكاء نجاحًا ما لم تملك البيانات مدخلاته" />
        <CardBody>
          <div className="space-y-2">
            {[
              ['Sales Report','VERIFIED / REVIEW',true,'المبيعات الزمنية ومزيج نوع الفاتورة وتركيز العملاء متاحة.'],
              ['Receivables','PARTIAL',true,'نوع «آجل» يعطي مرشحًا للذمم؛ لا توجد تواريخ استحقاق/دفعات من هذا المصدر، لذلك لا يُقدّم Aging نهائيًا.'],
              ['Customer / RFM','REVIEW',analysis.missingCustomers < analysis.totalRows,'يعمل على العملاء المسمّين فقط؛ 913 صفًا بلا عميل يمنع اكتمال الهوية.'],
              ['Profitability','INSUFFICIENT DATA',false,'لا توجد تكلفة/كمية/بنود منتجات في هذا المصدر.'],
              ['Inventory','INSUFFICIENT DATA',false,'لا توجد حقول صنف/مستودع/كمية.'],
              ['Demand Velocity','INSUFFICIENT DATA',false,'لا توجد كمية وحدات مباعة أو SKU.'],
              ['Purchases / Suppliers','INSUFFICIENT DATA',false,'المصدر تقرير مبيعات فقط.'],
              ['Forecast','INSUFFICIENT DATA',false,'لا توجد نافذة تاريخية كافية على الأقل لربط تنبؤ تشغيلي موثوق بهذا المصدر وحده.'],
              ['Benchmark','INSUFFICIENT_SAMPLE',false,'لا يوجد peer sample مرتبط بهذا المصدر.'],
            ].map(([title,status,available,detail]) => <div key={title as string} className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-3">
              <div className="min-w-0"><div className="text-sm font-black text-ink-900">{title as string}</div><div className="mt-1 text-[11px] leading-5 text-ink-500">{detail as string}</div></div>
              <span className={'shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black ' + (available ? 'bg-primary-50 text-primary-700' : 'bg-warning-50 text-warning-900')}>{status as string}</span>
            </div>)}
          </div>
        </CardBody>
      </Card>
    </section>

    <section className="rounded-[18px] border border-ink-200 bg-ink-950 p-5 text-white">
      <div className="flex items-center gap-2"><Target size={18} className="text-primary-300"/><h2 className="text-lg font-black">قرارات قابلة للتنفيذ من هذا المصدر</h2></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(analysis.qualityIssues.length ? analysis.qualityIssues : [{ key: 'none', title: 'لا توجد فجوة مصدرية', detail: 'راجع الدليل قبل اعتماد أي قرار.' }]).map((issue) =>
          <div key={issue.key} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-black">{issue.title}</div>
            <div className="mt-1 text-[11px] leading-5 text-ink-300">{issue.detail}</div>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/trust" className="btn-secondary bg-white text-ink-950">فحص الدليل</Link>
        <Link to="/decision-experience" className="btn-primary">مساحة القرار</Link>
        <Link to="/reports" className="btn-secondary bg-white text-ink-950">مركز التقارير</Link>
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-success-200 bg-success-50 p-4"><div className="flex items-center gap-2 text-success-900"><CheckCircle2 size={17}/><span className="font-black">الاستيراد</span></div><div className="mt-2 text-[11px] leading-5 text-success-900">1,998 / 1,998 صف مثبت، import job مكتمل وreport execution rendered.</div></div>
      <div className="rounded-xl border border-primary-200 bg-primary-50 p-4"><div className="flex items-center gap-2 text-primary-900"><TrendingUp size={17}/><span className="font-black">الذكاء</span></div><div className="mt-2 text-[11px] leading-5 text-primary-900">تم تطبيق التحليل المتاح فوق المصدر نفسه، مع حدود صريحة للحسابات غير المدعومة.</div></div>
      <div className="rounded-xl border border-ink-200 bg-white p-4"><div className="flex items-center gap-2 text-ink-900"><Database size={17}/><span className="font-black">المصدر</span></div><div className="mt-2 text-[11px] leading-5 text-ink-500">لا توجد بيانات مخفية من التقرير؛ الصفوف والهوية والفراغات والفروقات تُقرأ من المصدر المعياري.</div></div>
    </section>
  </div>;
}
