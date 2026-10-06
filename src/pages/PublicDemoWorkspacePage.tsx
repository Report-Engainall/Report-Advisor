import { useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, CheckCircle2, ChevronDown, CircleAlert, Filter, Package, Search, ShoppingCart, WalletCards, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

type InventoryRow = {
  sku: string;
  product: string;
  category: string;
  warehouse: string;
  quantity: number;
  reorder: number;
  unitCost: number;
  dailySales: number;
  daysCover: number;
  priority: 'P0' | 'P1' | 'P2';
};

type SalesRow = {
  invoice: string;
  customer: string;
  date: string;
  total: number;
  paid: number;
  status: 'مدفوعة' | 'مؤكدة' | 'متأخرة';
};

type DecisionRow = {
  title: string;
  why: string;
  impact: string;
  owner: string;
  priority: 'P0' | 'P1';
  state: 'مقترح' | 'معتمد';
};

const inventory: InventoryRow[] = [
  { sku: 'ITM-00142', product: 'حبر طابعة HP 85A', category: 'مستلزمات مكتبية', warehouse: 'الرئيسي', quantity: 0, reorder: 25, unitCost: 28, dailySales: 4.8, daysCover: 0, priority: 'P0' },
  { sku: 'ITM-00218', product: 'ورق A4 80g', category: 'مستلزمات مكتبية', warehouse: 'الرئيسي', quantity: 12, reorder: 60, unitCost: 4.9, dailySales: 5.4, daysCover: 2, priority: 'P0' },
  { sku: 'ITM-00731', product: 'زيت محرك 20W-50', category: 'زيوت', warehouse: 'صنعاء', quantity: 34, reorder: 40, unitCost: 18.5, dailySales: 1.3, daysCover: 26, priority: 'P1' },
  { sku: 'ITM-00992', product: 'فلتر زيت 90915', category: 'قطع غيار', warehouse: 'عدن', quantity: 7, reorder: 15, unitCost: 7.8, dailySales: 1.2, daysCover: 6, priority: 'P1' },
  { sku: 'ITM-01108', product: 'بطارية 70Ah', category: 'بطاريات', warehouse: 'الرئيسي', quantity: 3, reorder: 8, unitCost: 68, dailySales: 0.9, daysCover: 3, priority: 'P0' },
  { sku: 'ITM-01241', product: 'سائل فرامل DOT4', category: 'سوائل', warehouse: 'تعز', quantity: 51, reorder: 25, unitCost: 6.2, dailySales: 0.4, daysCover: 128, priority: 'P2' },
  { sku: 'ITM-01473', product: 'سير مكينة 6PK', category: 'قطع غيار', warehouse: 'الرئيسي', quantity: 19, reorder: 12, unitCost: 14.3, dailySales: 0.7, daysCover: 27, priority: 'P2' },
  { sku: 'ITM-01822', product: 'فحمات أمامية', category: 'قطع غيار', warehouse: 'عدن', quantity: 6, reorder: 10, unitCost: 22, dailySales: 1.1, daysCover: 5, priority: 'P1' },
  { sku: 'ITM-02041', product: 'فلتر هواء', category: 'قطع غيار', warehouse: 'الرئيسي', quantity: 42, reorder: 20, unitCost: 8.9, dailySales: 1.8, daysCover: 23, priority: 'P2' },
  { sku: 'ITM-02330', product: 'زيت قير ATF', category: 'زيوت', warehouse: 'صنعاء', quantity: 8, reorder: 20, unitCost: 21.5, dailySales: 1.7, daysCover: 5, priority: 'P1' },
];

const sales: SalesRow[] = [
  { invoice: 'S-2026-00481', customer: 'شركة المدار للتجارة', date: '06/10/2026', total: 18450, paid: 18450, status: 'مدفوعة' },
  { invoice: 'S-2026-00480', customer: 'مؤسسة النور', date: '06/10/2026', total: 12680, paid: 6800, status: 'مؤكدة' },
  { invoice: 'S-2026-00479', customer: 'مجموعة الأفق', date: '05/10/2026', total: 9840, paid: 9840, status: 'مدفوعة' },
  { invoice: 'S-2026-00478', customer: 'شركة البدر', date: '05/10/2026', total: 21600, paid: 0, status: 'متأخرة' },
  { invoice: 'S-2026-00477', customer: 'مؤسسة الريادة', date: '04/10/2026', total: 7420, paid: 7420, status: 'مدفوعة' },
  { invoice: 'S-2026-00476', customer: 'شركة المتحد', date: '04/10/2026', total: 15890, paid: 10500, status: 'مؤكدة' },
  { invoice: 'S-2026-00475', customer: 'مؤسسة السلام', date: '03/10/2026', total: 6320, paid: 6320, status: 'مدفوعة' },
  { invoice: 'S-2026-00474', customer: 'شركة الوفاء', date: '03/10/2026', total: 19250, paid: 8250, status: 'متأخرة' },
];

const decisions: DecisionRow[] = [
  { title: 'إعادة طلب ورق A4 قبل نفاده', why: 'الرصيد 12 فقط مقابل طلب يومي 5.4؛ التغطية يومان.', impact: 'منع توقف صنف سريع الحركة', owner: 'المشتريات', priority: 'P0', state: 'مقترح' },
  { title: 'تحصيل فاتورة شركة البدر', why: 'الرصيد المستحق 21,600 ولا يوجد سداد مسجل.', impact: 'تحسين السيولة وتقليل التأخر', owner: 'التحصيل', priority: 'P0', state: 'مقترح' },
  { title: 'نقل فحمات أمامية إلى عدن', why: 'التغطية 5 أيام بينما الرصيد تحت حد إعادة الطلب.', impact: 'خفض خطر نفاد مخزون الفرع', owner: 'المخزون', priority: 'P1', state: 'معتمد' },
];

const money = (value: number) => new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 0 }).format(value) + ' ر.ي';

function DemoNav({ active }: { active: string }) {
  const items = [
    ['/', 'مركز القيادة'],
    ['/reports', 'التقارير'],
    ['/reports/inventory', 'المخزون'],
    ['/reports/sales', 'المبيعات'],
    ['/reports/receivables', 'التحصيل'],
    ['/decision-experience', 'القرار'],
  ];
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      {items.map(([path, label]) => (
        <Link
          key={path}
          to={path}
          className={"whitespace-nowrap rounded-xl px-3 py-2 text-xs font-black transition " + (active === path ? 'bg-primary-600 text-white' : 'border border-ink-100 bg-white text-ink-600 hover:bg-ink-50')}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="rounded-2xl border border-ink-100 bg-[#0c1222] px-5 py-5 text-white shadow-[0_24px_70px_-44px_rgba(15,23,42,.7)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-black tracking-[.16em] text-emerald-300">AGHBARI · LIVE PRODUCT DEMO</div>
          <h1 className="mt-2 text-2xl font-black">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold">
          <CheckCircle2 size={16} className="text-emerald-300" />
          المصدر: تقارير ادارية.xlsx · 332 صفًا
        </div>
      </div>
    </header>
  );
}

function Kpi({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof BarChart3 }) {
  return (
    <article className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-ink-500">{label}</span>
        <span className="rounded-xl bg-primary-50 p-2 text-primary-700"><Icon size={17} /></span>
      </div>
      <div className="mt-3 text-2xl font-black text-ink-950">{value}</div>
      <div className="mt-1 text-[11px] text-ink-500">{note}</div>
    </article>
  );
}

function Overview() {
  return (
    <div className="space-y-5">
      <Header title="مركز القيادة" subtitle="هذه نسخة العرض التجاري القابلة للنقر: أرقام، جداول، إشارات، قرارات، ثم انتقال مباشر إلى العمل. ليست صفحة مصطلحات." />
      <DemoNav active="/" />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="إجمالي المبيعات" value="18.42 مليون" note="آخر 30 يومًا" icon={ShoppingCart} />
        <Kpi label="معدل التحصيل" value="82.6%" note="من الفواتير المستحقة" icon={WalletCards} />
        <Kpi label="قيمة المخزون" value="7.64 مليون" note="القيمة المثبتة في اللقطة" icon={Package} />
        <Kpi label="إشارات تحتاج انتباهًا" value="12" note="منها 3 حرجة P0" icon={CircleAlert} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <div><h2 className="text-base font-black">ما الذي يستحق انتباه الإدارة الآن؟</h2><p className="mt-1 text-xs text-ink-500">الإشارة مرتبطة ببيانات محددة وليست وصفًا عامًا.</p></div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-800">3 × P0</span>
          </div>
          <div className="mt-4 space-y-3">
            {[
              ['نفاد 140 صنفًا بدون رصيد فعلي', 'مخزون', 'يهدد الإتاحة على الأصناف الأسرع حركة.'],
              ['44 صنفًا متوقع نفاده خلال 7 أيام', 'تخطيط', 'الطلب اليومي أعلى من التغطية الحالية.'],
              ['3 فواتير متأخرة عالية القيمة', 'تحصيل', 'إجمالي مستحق يتجاوز 54 ألف ر.ي.'],
            ].map(([title, area, why]) => (
              <div key={title} className="rounded-2xl border border-ink-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><div className="font-black">{title}</div><span className="rounded-full bg-ink-50 px-2 py-1 text-[10px] font-black">{area}</span></div>
                <div className="mt-2 text-xs leading-6 text-ink-600">{why}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
          <div className="text-xs font-black text-primary-800">الخطوة التالية</div>
          <div className="mt-2 text-xl font-black text-ink-950">افتح تقرير المخزون</div>
          <p className="mt-2 text-sm leading-6 text-ink-600">شاهد الصفوف، التغطية بالأيام، أولوية كل صنف، ثم افتح قرارًا على الصف نفسه.</p>
          <Link to="/reports/inventory" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-black text-white hover:bg-primary-800">فتح التقرير <ArrowLeft size={15} /></Link>
        </div>
      </section>
      <section className="rounded-2xl border border-ink-100 bg-white p-5">
        <div className="flex items-center justify-between"><div><h2 className="font-black">أين تحوّل المنتج من تقرير إلى إجراء؟</h2><p className="mt-1 text-xs text-ink-500">كل بطاقة أدناه تفتح سطحًا يمكن التعامل معه.</p></div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ['/reports/inventory', 'المخزون', 'جدول أصناف + التغطية + الأولوية + Drill-down'],
            ['/reports/sales', 'المبيعات', 'فواتير + مبالغ + حالة التحصيل'],
            ['/decision-experience', 'القرار', 'مقترحات + أثر + مسؤول + حالة'],
          ].map(([path, label, note]) => <Link key={path} to={path} className="rounded-2xl border border-ink-100 p-4 hover:border-primary-300 hover:bg-primary-50"><div className="font-black">{label}</div><div className="mt-2 text-xs leading-5 text-ink-500">{note}</div></Link>)}
        </div>
      </section>
    </div>
  );
}

function InventoryPage() {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<'ALL' | InventoryRow['priority']>('ALL');
  const [selected, setSelected] = useState<InventoryRow | null>(null);
  const rows = useMemo(() => inventory.filter(row => {
    const text = (row.product + ' ' + row.sku + ' ' + row.category + ' ' + row.warehouse).toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (priority === 'ALL' || row.priority === priority);
  }), [query, priority]);

  return (
    <div className="space-y-5">
      <Header title="ذكاء المخزون" subtitle="الجدول نفسه هو سطح القرار: ابحث، صفِّ، راجع التغطية، ثم افتح الصنف بدل قراءة وصف عن المخزون." />
      <DemoNav active="/reports/inventory" />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="قيمة المخزون" value="7.64 مليون" note="المصدر الحالي" icon={Package} />
        <Kpi label="أصناف بلا رصيد مع حركة" value="140" note="أولوية P0" icon={CircleAlert} />
        <Kpi label="نفاد خلال 7 أيام" value="44" note="خطر إتاحة" icon={BarChart3} />
        <Kpi label="أرصدة سالبة" value="15" note="فجوة تشغيلية" icon={WalletCards} />
      </section>
      <section className="rounded-2xl border border-ink-100 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-black">صفوف المخزون القابلة للفعل</h2>
            <p className="mt-1 text-xs text-ink-500">10 صفوف نموذجية من نفس نمط التقرير؛ 332 صفًا في المصدر الكانوني.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block"><Search size={15} className="absolute right-3 top-3 text-ink-400" /><input value={query} onChange={e => setQuery(e.target.value)} className="h-10 w-full min-w-64 rounded-xl border border-ink-200 bg-white pr-9 pl-3 text-xs outline-none focus:border-primary-500" placeholder="ابحث برقم الصنف أو الاسم" /></label>
            <label className="relative"><Filter size={15} className="absolute right-3 top-3 text-ink-400" /><select value={priority} onChange={e => setPriority(e.target.value as typeof priority)} className="h-10 appearance-none rounded-xl border border-ink-200 bg-white px-9 pl-8 text-xs font-bold"><option value="ALL">كل الأولويات</option><option value="P0">P0 حرجة</option><option value="P1">P1 مهمة</option><option value="P2">P2 مراقبة</option></select><ChevronDown size={14} className="pointer-events-none absolute left-3 top-3.5 text-ink-400" /></label>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100">
          <table className="min-w-[980px] w-full text-right text-xs">
            <thead className="bg-ink-50 text-ink-600"><tr>{['الصنف','المستودع','الرصيد','الطلب اليومي','التغطية','إعادة الطلب','التكلفة','الأولوية','إجراء'].map(h => <th key={h} className="px-3 py-3 font-black">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.sku} className="border-t border-ink-100 hover:bg-primary-50/40">
                  <td className="px-3 py-3"><div className="font-black text-ink-900">{row.product}</div><div className="mt-0.5 text-[10px] text-ink-400">{row.sku}</div></td>
                  <td className="px-3 py-3 text-ink-600">{row.warehouse}</td>
                  <td className="px-3 py-3 font-black">{row.quantity}</td>
                  <td className="px-3 py-3">{row.dailySales.toFixed(1)}</td>
                  <td className={"px-3 py-3 font-black " + (row.daysCover <= 7 ? 'text-red-700' : row.daysCover <= 30 ? 'text-amber-700' : 'text-emerald-700')}>{row.daysCover} يوم</td>
                  <td className="px-3 py-3">{row.reorder}</td>
                  <td className="px-3 py-3">{money(row.unitCost)}</td>
                  <td className="px-3 py-3"><span className={"rounded-full px-2 py-1 text-[10px] font-black " + (row.priority === 'P0' ? 'bg-red-50 text-red-800' : row.priority === 'P1' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800')}>{row.priority}</span></td>
                  <td className="px-3 py-3"><button type="button" onClick={() => setSelected(row)} className="rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-[10px] font-black text-primary-800 hover:bg-primary-100">افتح الصنف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-ink-500"><span>يعرض {rows.length} من 10 صفوف في نسخة العرض.</span><span>الحكم لا يحول البيانات الناقصة إلى صفر.</span></div>
      </section>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4" role="dialog" aria-modal="true" aria-label="تفاصيل الصنف">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-black text-primary-700">{selected.sku}</div><h3 className="mt-1 text-xl font-black">{selected.product}</h3><div className="mt-1 text-xs text-ink-500">{selected.category} · {selected.warehouse}</div></div><button type="button" onClick={() => setSelected(null)} className="rounded-xl border border-ink-200 p-2"><X size={17} /></button></div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[['الرصيد', String(selected.quantity)],['الطلب اليومي', selected.dailySales.toFixed(1)],['التغطية', selected.daysCover + ' يوم'],['إعادة الطلب', String(selected.reorder)]].map(([k,v]) => <div key={k} className="rounded-xl border border-ink-100 bg-ink-50 p-3"><div className="text-[10px] text-ink-500">{k}</div><div className="mt-1 font-black">{v}</div></div>)}
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><b>لماذا ظهر هذا الصنف؟</b><div className="mt-1">{selected.quantity <= 0 ? 'نفد الرصيد مع وجود حركة يومية، لذلك الإشارة P0.' : 'التغطية الحالية أقل من حد الأمان المحدد للصنف.'}</div></div>
            <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setSelected(null)} className="rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-black text-white">حوّلها إلى قرار</button><button type="button" onClick={() => setSelected(null)} className="rounded-xl border border-ink-200 px-4 py-2.5 text-xs font-black">تمت المراجعة</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function SalesPage() {
  const [query, setQuery] = useState('');
  const rows = sales.filter(row => (row.invoice + ' ' + row.customer).toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="space-y-5">
      <Header title="تقرير المبيعات" subtitle="الفاتورة، العميل، قيمة العملية، المسدد والمتأخر: أرقام قابلة للبحث بدل بطاقات وصفية فقط." />
      <DemoNav active="/reports/sales" />
      <section className="grid gap-3 md:grid-cols-3">
        <Kpi label="مبيعات اللقطة" value="18.42 مليون" note="آخر 30 يومًا" icon={ShoppingCart} />
        <Kpi label="عدد الفواتير" value="486" note="بعد التحقق" icon={BarChart3} />
        <Kpi label="متوسط الفاتورة" value="37,901 ر.ي." note="القيمة الإجمالية ÷ عدد الفواتير" icon={WalletCards} />
      </section>
      <section className="rounded-2xl border border-ink-100 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black">فواتير مبيعات فعلية في نموذج العرض</h2><p className="mt-1 text-xs text-ink-500">ابحث باسم العميل أو رقم الفاتورة.</p></div><label className="relative"><Search size={15} className="absolute right-3 top-3 text-ink-400" /><input value={query} onChange={e => setQuery(e.target.value)} className="h-10 min-w-72 rounded-xl border border-ink-200 pr-9 pl-3 text-xs outline-none focus:border-primary-500" placeholder="ابحث..." /></label></div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100"><table className="min-w-[800px] w-full text-right text-xs"><thead className="bg-ink-50"><tr>{['الفاتورة','العميل','التاريخ','الإجمالي','المدفوع','الحالة'].map(h => <th key={h} className="px-3 py-3 font-black">{h}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r.invoice} className="border-t border-ink-100"><td className="px-3 py-3 font-black">{r.invoice}</td><td className="px-3 py-3">{r.customer}</td><td className="px-3 py-3">{r.date}</td><td className="px-3 py-3">{money(r.total)}</td><td className="px-3 py-3">{money(r.paid)}</td><td className="px-3 py-3"><span className={"rounded-full px-2 py-1 text-[10px] font-black " + (r.status === 'متأخرة' ? 'bg-red-50 text-red-800' : r.status === 'مدفوعة' ? 'bg-emerald-50 text-emerald-800' : 'bg-primary-50 text-primary-800')}>{r.status}</span></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}

function ReceivablesPage() {
  const buckets = [
    ['0–30 يوم', '1.24 مليون', 62],
    ['31–60 يوم', '0.83 مليون', 42],
    ['61–90 يوم', '0.46 مليون', 24],
    ['90+ يوم', '0.65 مليون', 33],
  ];
  return (
    <div className="space-y-5">
      <Header title="الذمم والتحصيل" subtitle="العمر، الرصيد، وأولوية المتابعة في شاشة واحدة مع انتقال مباشر إلى قرار التحصيل." />
      <DemoNav active="/reports/receivables" />
      <section className="grid gap-3 md:grid-cols-3">
        <Kpi label="إجمالي الذمم" value="3.18 مليون" note="لقطة التحصيل الحالية" icon={WalletCards} />
        <Kpi label="أكثر من 90 يومًا" value="0.65 مليون" note="أولوية P0" icon={CircleAlert} />
        <Kpi label="معدل التحصيل" value="82.6%" note="من الرصيد المستحق" icon={BarChart3} />
      </section>
      <section className="rounded-2xl border border-ink-100 bg-white p-5">
        <h2 className="font-black">توزيع الأعمار</h2>
        <div className="mt-4 space-y-4">{buckets.map(([name, value, width]) => <div key={name}><div className="mb-1 flex items-center justify-between text-xs"><span className="font-bold">{name}</span><span className="font-black">{value}</span></div><div className="h-3 rounded-full bg-ink-100"><div className="h-3 rounded-full bg-primary-600" style={{width: width + '%'}} /></div></div>)}</div>
      </section>
      <section className="rounded-2xl border border-ink-100 bg-white p-4">
        <h2 className="font-black">أولوية التحصيل</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {sales.filter(r => r.status === 'متأخرة' || r.paid < r.total).slice(0,4).map(r => <div key={r.invoice} className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex justify-between gap-3"><div className="font-black">{r.customer}</div><span className="text-[10px] font-black text-amber-900">متابعة اليوم</span></div><div className="mt-2 text-sm">{money(r.total-r.paid)} مستحق</div><div className="mt-2 text-xs leading-5 text-ink-600">سبب الأولوية: فاتورة مفتوحة مع رصيد لم يُسجل تحصيله بالكامل.</div></div>)}
        </div>
      </section>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="space-y-5">
      <Header title="مركز التقارير" subtitle="خمسة تقارير قابلة للفتح، ولكل تقرير أرقام وصفوف وإشارات. هذا هو الفرق بين مصطلح وبين منتج يُجرَّب." />
      <DemoNav active="/reports" />
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          ['/reports/inventory', 'المخزون', '140 بلا رصيد مع حركة · 44 نفاد متوقع · 15 رصيد سالب', 'فتح ذكاء المخزون'],
          ['/reports/sales', 'المبيعات', '18.42 مليون · 486 فاتورة · تحصيل 82.6%', 'فتح المبيعات'],
          ['/reports/receivables', 'التحصيل', '3.18 مليون ذمم · 0.65 مليون فوق 90 يومًا', 'فتح التحصيل'],
          ['/reports/profitability', 'الربحية', 'هامش إجمالي 17.8% · أعلى فئة: قطع الغيار', 'فتح الربحية'],
        ].map(([path, title, note, cta]) => <Link key={path} to={path} className="rounded-2xl border border-ink-100 bg-white p-5 hover:border-primary-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-ink-600">{note}</p></div><ArrowLeft size={18} className="mt-1 text-primary-600" /></div><div className="mt-4 text-xs font-black text-primary-700">{cta} ←</div></Link>)}
      </div>
    </div>
  );
}

function ProfitabilityPage() {
  const data = [
    ['قطع الغيار', '6.24 مليون', '1.31 مليون', '21.0%'],
    ['الزيوت', '4.12 مليون', '0.74 مليون', '18.0%'],
    ['البطاريات', '2.18 مليون', '0.33 مليون', '15.1%'],
    ['المستلزمات', '1.40 مليون', '0.19 مليون', '13.6%'],
  ];
  return (
    <div className="space-y-5">
      <Header title="تقرير الربحية" subtitle="الربح والهامش حسب الفئة، مع إبراز ما يستحق قرارًا بدل الاكتفاء بعنوان التقرير." />
      <DemoNav active="/reports/profitability" />
      <section className="grid gap-3 md:grid-cols-4">
        <Kpi label="المبيعات" value="13.94 مليون" note="الفئات الرئيسية" icon={ShoppingCart} />
        <Kpi label="التكلفة" value="11.46 مليون" note="مرتبطة بالمصدر" icon={WalletCards} />
        <Kpi label="الربح الإجمالي" value="2.48 مليون" note="محسوب" icon={BarChart3} />
        <Kpi label="الهامش" value="17.8%" note="الربح ÷ المبيعات" icon={CheckCircle2} />
      </section>
      <section className="overflow-x-auto rounded-2xl border border-ink-100 bg-white p-4"><table className="min-w-[760px] w-full text-right text-xs"><thead className="bg-ink-50"><tr>{['الفئة','المبيعات','الربح','الهامش'].map(h => <th key={h} className="px-3 py-3 font-black">{h}</th>)}</tr></thead><tbody>{data.map(r => <tr key={r[0]} className="border-t border-ink-100"><td className="px-3 py-3 font-black">{r[0]}</td><td className="px-3 py-3">{r[1]}</td><td className="px-3 py-3">{r[2]}</td><td className="px-3 py-3 font-black">{r[3]}</td></tr>)}</tbody></table></section>
    </div>
  );
}

function DecisionsPage() {
  const [rows, setRows] = useState(decisions);
  const approve = (index: number) => setRows(current => current.map((row, i) => i === index ? { ...row, state: 'معتمد' } : row));
  return (
    <div className="space-y-5">
      <Header title="تجربة القرار" subtitle="هنا يظهر الفرق بين توصية وكلام عام: كل قرار له سبب، أثر، مسؤول، أولوية، وحالة تتغير بالنقر." />
      <DemoNav active="/decision-experience" />
      <section className="grid gap-4">
        {rows.map((row, index) => <article key={row.title} className="rounded-2xl border border-ink-100 bg-white p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={"rounded-full px-2 py-1 text-[10px] font-black " + (row.priority === 'P0' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800')}>{row.priority}</span><span className={"rounded-full px-2 py-1 text-[10px] font-black " + (row.state === 'معتمد' ? 'bg-emerald-50 text-emerald-800' : 'bg-primary-50 text-primary-800')}>{row.state}</span></div><h2 className="mt-3 text-lg font-black">{row.title}</h2><p className="mt-2 text-sm leading-6 text-ink-600">{row.why}</p></div><div className="min-w-52 rounded-xl bg-ink-50 p-3"><div className="text-[10px] font-black text-ink-500">الأثر المتوقع</div><div className="mt-1 text-sm font-black">{row.impact}</div><div className="mt-2 text-[10px] text-ink-500">المسؤول: {row.owner}</div></div></div>{row.state !== 'معتمد' && <button type="button" onClick={() => approve(index)} className="mt-4 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-black text-white hover:bg-primary-800">اعتماد القرار</button>}</article>)}
      </section>
    </div>
  );
}

export function PublicDemoWorkspacePage() {
  const { pathname } = useLocation();
  const page = pathname.replace(/\/$/, '') || '/';
  const content = page === '/reports' ? <ReportsPage />
    : page === '/reports/inventory' || page === '/reports/inventory-intelligence' ? <InventoryPage />
    : page === '/reports/sales' ? <SalesPage />
    : page === '/reports/receivables' ? <ReceivablesPage />
    : page === '/reports/profitability' ? <ProfitabilityPage />
    : page === '/decision-experience' ? <DecisionsPage />
    : <Overview />;
  return (
    <div dir="rtl" className="min-h-screen bg-[#f3f5f9] text-ink-950">
      <div className="mx-auto w-full max-w-[1440px] p-3 sm:p-5 lg:p-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="font-black tracking-tight">الأغبري <span className="text-xs font-bold text-ink-400">/ عرض المنتج التفاعلي</span></div>
          <Link to="/proposal-demo" className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-black text-ink-700 hover:bg-ink-50">كيف نبيع المنتج؟</Link>
        </div>
        {content}
        <footer className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 text-[11px] leading-5 text-ink-500">
          هذه نسخة عرض عامة وآمنة: الأرقام ثابتة للعرض ولا تقرأ بيانات أي شركة أو حساب. البيانات التجارية الحقيقية تبقى خلف المصادقة وعزل الشركة.
        </footer>
      </div>
    </div>
  );
}
