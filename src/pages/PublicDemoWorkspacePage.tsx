import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type Row = {
  sku: string;
  product: string;
  warehouse: string;
  quantity: number;
  daily: number;
  cover: number;
  priority: 'P0' | 'P1' | 'P2';
};

const rows: Row[] = [
  { sku: 'ITM-00142', product: 'حبر طابعة HP 85A', warehouse: 'الرئيسي', quantity: 0, daily: 4.8, cover: 0, priority: 'P0' },
  { sku: 'ITM-00218', product: 'ورق A4 80g', warehouse: 'الرئيسي', quantity: 12, daily: 5.4, cover: 2, priority: 'P0' },
  { sku: 'ITM-00731', product: 'زيت محرك 20W-50', warehouse: 'صنعاء', quantity: 34, daily: 1.3, cover: 26, priority: 'P1' },
  { sku: 'ITM-00992', product: 'فلتر زيت 90915', warehouse: 'عدن', quantity: 7, daily: 1.2, cover: 6, priority: 'P1' },
  { sku: 'ITM-01108', product: 'بطارية 70Ah', warehouse: 'الرئيسي', quantity: 3, daily: 0.9, cover: 3, priority: 'P0' },
  { sku: 'ITM-01241', product: 'سائل فرامل DOT4', warehouse: 'تعز', quantity: 51, daily: 0.4, cover: 128, priority: 'P2' },
  { sku: 'ITM-01473', product: 'سير مكينة 6PK', warehouse: 'الرئيسي', quantity: 19, daily: 0.7, cover: 27, priority: 'P2' },
  { sku: 'ITM-01822', product: 'فحمات أمامية', warehouse: 'عدن', quantity: 6, daily: 1.1, cover: 5, priority: 'P1' },
];

const nav = [
  ['/', 'مركز القيادة'],
  ['/reports', 'التقارير'],
  ['/reports/inventory', 'المخزون'],
  ['/reports/sales', 'المبيعات'],
  ['/reports/receivables', 'التحصيل'],
  ['/decision-experience', 'القرار'],
];

function Top({ active }: { active: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {nav.map(([path, label]) => (
        <Link key={path} to={path} className={"whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-black " + (active === path ? 'border-primary-700 bg-primary-700 text-white' : 'border-ink-100 bg-white text-ink-700')}>
          {label}
        </Link>
      ))}
    </div>
  );
}

function Shell({ title, subtitle, active, children }: { title: string; subtitle: string; active: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f5f9] text-ink-950">
      <div className="mx-auto max-w-[1440px] p-3 sm:p-5 lg:p-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="font-black">الأغبري <span className="text-xs font-bold text-ink-400">/ عرض المنتج التفاعلي</span></div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-800">بيانات عرض ثابتة · لا تصل إلى أي شركة</span>
        </div>
        <header className="rounded-2xl bg-[#0c1222] p-5 text-white shadow-[0_24px_70px_-44px_rgba(15,23,42,.7)]">
          <div className="text-[10px] font-black tracking-[.14em] text-emerald-300">AGHBARI · PRODUCT DEMO</div>
          <h1 className="mt-2 text-2xl font-black">{title}</h1>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-300">{subtitle}</p>
        </header>
        <div className="mt-4"><Top active={active} /></div>
        <main className="mt-5">{children}</main>
        <footer className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 text-[11px] leading-5 text-ink-500">
          هذه نسخة عرض آمنة للعميل المحتمل. الأرقام والصفوف هنا ثابتة للعرض ولا تمثل بيانات شركة حقيقية؛ بيانات العملاء الفعلية تبقى خلف المصادقة وعزل الشركة.
        </footer>
      </div>
    </div>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
      <div className="text-xs font-bold text-ink-500">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
      <div className="mt-1 text-[11px] text-ink-500">{note}</div>
    </div>
  );
}

function Overview() {
  return (
    <Shell active="/" title="مركز القيادة" subtitle="ليس قاموسًا للمصطلحات: أرقام فعلية في العرض، إشارات محددة، ثم انتقال إلى تقرير قابل للتفاعل وقرار قابل للاعتماد.">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="إجمالي المبيعات" value="18.42 مليون" note="آخر 30 يومًا" />
        <Kpi label="معدل التحصيل" value="82.6%" note="من الفواتير المستحقة" />
        <Kpi label="قيمة المخزون" value="7.64 مليون" note="اللقطة الحالية" />
        <Kpi label="إشارات حرجة" value="3 P0" note="من أصل 12 إشارة" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="font-black">ما الذي يحتاج انتباهًا الآن؟</h2>
          <div className="mt-4 grid gap-3">
            {[
              ['140', 'صنف بلا رصيد مع حركة بيع', 'مخاطر إتاحة مباشرة'],
              ['44', 'صنف قد ينفد خلال 7 أيام', 'طلب يومي أعلى من التغطية'],
              ['0.65 مليون', 'ذمم تتجاوز 90 يومًا', 'أولوية تحصيل P0'],
            ].map(([value, title, why]) => (
              <div key={title} className="grid grid-cols-[100px_1fr] gap-3 rounded-2xl border border-ink-100 p-4">
                <div className="text-2xl font-black text-primary-700">{value}</div>
                <div><div className="font-black">{title}</div><div className="mt-1 text-xs text-ink-500">{why}</div></div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
          <div className="text-xs font-black text-primary-800">جرب بنفسك</div>
          <h2 className="mt-2 text-xl font-black">افتح جدول المخزون</h2>
          <p className="mt-2 text-sm leading-6 text-ink-600">ابحث، صفِّ حسب الأولوية، افتح الصنف، وشاهد سبب ظهور الإشارة.</p>
          <Link to="/reports/inventory" className="mt-4 inline-flex rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-black text-white">فتح تقرير المخزون ←</Link>
        </section>
      </div>
    </Shell>
  );
}

function Reports() {
  const cards = [
    ['/reports/inventory', 'المخزون', '140 بلا رصيد مع حركة · 44 نفاد متوقع · 15 أرصدة سالبة'],
    ['/reports/sales', 'المبيعات', '18.42 مليون · 486 فاتورة · تحصيل 82.6%'],
    ['/reports/receivables', 'التحصيل', '3.18 مليون ذمم · 0.65 مليون فوق 90 يومًا'],
    ['/reports/profitability', 'الربحية', 'هامش إجمالي 17.8% · القطع الأعلى مساهمة'],
  ];
  return (
    <Shell active="/reports" title="مركز التقارير" subtitle="كل بطاقة هنا تقود إلى سطح عمل حقيقي داخل النسخة التجريبية، وليس إلى تعريف عن التقرير.">
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(([path, title, note]) => (
          <Link key={path} to={path} className="rounded-2xl border border-ink-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md">
            <h2 className="text-lg font-black">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">{note}</p>
            <div className="mt-4 text-xs font-black text-primary-700">افتح السطح التفاعلي ←</div>
          </Link>
        ))}
      </div>
    </Shell>
  );
}

function Inventory() {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('ALL');
  const [selected, setSelected] = useState<Row | null>(null);
  const visible = useMemo(() => rows.filter(row => {
    const text = (row.product + ' ' + row.sku + ' ' + row.warehouse).toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (priority === 'ALL' || row.priority === priority);
  }), [query, priority]);

  return (
    <Shell active="/reports/inventory" title="ذكاء المخزون" subtitle="هنا يظهر العمل الحقيقي: بيانات صفية، تغطية بالأيام، أولويات، بحث وتصفية، وفتح تفاصيل الصنف.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="قيمة المخزون" value="7.64 مليون" note="من لقطة المصدر" />
        <Kpi label="بلا رصيد مع حركة" value="140" note="أولوية P0" />
        <Kpi label="نفاد خلال 7 أيام" value="44" note="خطر إتاحة" />
        <Kpi label="أرصدة سالبة" value="15" note="فجوة تشغيلية" />
      </div>
      <section className="mt-4 rounded-2xl border border-ink-100 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-black">صفوف قابلة للفعل</h2><p className="mt-1 text-xs text-ink-500">ثمانية صفوف نموذجية من نمط التقرير؛ المصدر الكامل 332 صفًا.</p></div>
          <div className="flex gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)} className="h-10 min-w-64 rounded-xl border border-ink-200 px-3 text-xs outline-none focus:border-primary-500" placeholder="ابحث عن الصنف..." />
            <select value={priority} onChange={e => setPriority(e.target.value)} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-xs font-bold"><option value="ALL">كل الأولويات</option><option value="P0">P0</option><option value="P1">P1</option><option value="P2">P2</option></select>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100">
          <table className="min-w-[900px] w-full text-right text-xs">
            <thead className="bg-ink-50"><tr>{['الصنف','المستودع','الرصيد','الطلب اليومي','التغطية','الأولوية','تفاصيل'].map(h => <th key={h} className="px-3 py-3 font-black">{h}</th>)}</tr></thead>
            <tbody>
              {visible.map(row => (
                <tr key={row.sku} className="border-t border-ink-100 hover:bg-primary-50/40">
                  <td className="px-3 py-3"><div className="font-black">{row.product}</div><div className="mt-0.5 text-[10px] text-ink-400">{row.sku}</div></td>
                  <td className="px-3 py-3">{row.warehouse}</td>
                  <td className="px-3 py-3 font-black">{row.quantity}</td>
                  <td className="px-3 py-3">{row.daily.toFixed(1)}</td>
                  <td className={"px-3 py-3 font-black " + (row.cover <= 7 ? 'text-red-700' : row.cover <= 30 ? 'text-amber-700' : 'text-emerald-700')}>{row.cover} يوم</td>
                  <td className="px-3 py-3"><span className={"rounded-full px-2 py-1 text-[10px] font-black " + (row.priority === 'P0' ? 'bg-red-50 text-red-800' : row.priority === 'P1' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800')}>{row.priority}</span></td>
                  <td className="px-3 py-3"><button type="button" onClick={() => setSelected(row)} className="rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-[10px] font-black text-primary-800">افتح الصنف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-black text-primary-700">{selected.sku}</div><h2 className="mt-1 text-xl font-black">{selected.product}</h2></div><button type="button" onClick={() => setSelected(null)} className="rounded-xl border border-ink-200 px-3 py-2 text-xs font-black">إغلاق</button></div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['الرصيد', String(selected.quantity)],['الطلب اليومي', selected.daily.toFixed(1)],['التغطية', selected.cover + ' يوم'],['الأولوية', selected.priority]].map(([k,v]) => <div key={k} className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-500">{k}</div><div className="mt-1 font-black">{v}</div></div>)}</div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{selected.quantity === 0 ? 'السبب: الصنف بلا رصيد مع وجود حركة يومية، لذلك حصل على P0.' : 'السبب: التغطية الحالية تحت حد الأمان المحدد للصنف.'}</div>
            <Link to="/decision-experience" className="mt-4 inline-flex rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-black text-white">حوّل الإشارة إلى قرار ←</Link>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Sales() {
  const items = [
    ['S-2026-00481', 'شركة المدار للتجارة', '18,450', '18,450', 'مدفوعة'],
    ['S-2026-00480', 'مؤسسة النور', '12,680', '6,800', 'مفتوحة'],
    ['S-2026-00479', 'مجموعة الأفق', '9,840', '9,840', 'مدفوعة'],
    ['S-2026-00478', 'شركة البدر', '21,600', '0', 'متأخرة'],
    ['S-2026-00477', 'مؤسسة الريادة', '7,420', '7,420', 'مدفوعة'],
  ];
  return (
    <Shell active="/reports/sales" title="تقرير المبيعات" subtitle="الفاتورة والعميل والقيمة والمدفوع والحالة؛ بيانات يمكن البحث فيها ومراجعتها، لا عبارات وصفية.">
      <div className="grid gap-3 md:grid-cols-3"><Kpi label="مبيعات اللقطة" value="18.42 مليون" note="آخر 30 يومًا" /><Kpi label="الفواتير" value="486" note="بعد التحقق" /><Kpi label="التحصيل" value="82.6%" note="من المستحقات" /></div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100 bg-white p-4"><table className="min-w-[760px] w-full text-right text-xs"><thead className="bg-ink-50"><tr>{['الفاتورة','العميل','الإجمالي','المدفوع','الحالة'].map(h => <th key={h} className="px-3 py-3 font-black">{h}</th>)}</tr></thead><tbody>{items.map(item => <tr key={item[0]} className="border-t border-ink-100"><td className="px-3 py-3 font-black">{item[0]}</td><td className="px-3 py-3">{item[1]}</td><td className="px-3 py-3">{item[2]} ر.ي.</td><td className="px-3 py-3">{item[3]} ر.ي.</td><td className="px-3 py-3 font-black">{item[4]}</td></tr>)}</tbody></table></div>
    </Shell>
  );
}

function Receivables() {
  const buckets = [['0–30 يوم', '1.24 مليون', 62], ['31–60 يوم', '0.83 مليون', 42], ['61–90 يوم', '0.46 مليون', 24], ['90+ يوم', '0.65 مليون', 33]];
  return (
    <Shell active="/reports/receivables" title="الذمم والتحصيل" subtitle="الأرقام موزعة حسب العمر مع أولوية واضحة للمتابعة.">
      <div className="grid gap-3 md:grid-cols-3"><Kpi label="إجمالي الذمم" value="3.18 مليون" note="الرصيد الحالي" /><Kpi label="90+ يومًا" value="0.65 مليون" note="أولوية P0" /><Kpi label="معدل التحصيل" value="82.6%" note="من المستحق" /></div>
      <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-5"><h2 className="font-black">أعمار الذمم</h2><div className="mt-4 space-y-4">{buckets.map(([name, value, width]) => <div key={name}><div className="flex justify-between text-xs"><span>{name}</span><b>{value}</b></div><div className="mt-1 h-3 rounded-full bg-ink-100"><div className="h-3 rounded-full bg-primary-600" style={{ width: String(width) + '%' }} /></div></div>)}</div></div>
    </Shell>
  );
}

function Decisions() {
  const [states, setStates] = useState(['مقترح', 'مقترح', 'معتمد']);
  const data = [
    ['إعادة طلب ورق A4', 'الرصيد 12 والتغطية يومان', 'المشتريات', 'P0'],
    ['تحصيل فاتورة شركة البدر', '21,600 ر.ي. دون سداد مسجل', 'التحصيل', 'P0'],
    ['نقل فحمات إلى عدن', 'التغطية 5 أيام', 'المخزون', 'P1'],
  ];
  return (
    <Shell active="/decision-experience" title="تجربة القرار" subtitle="التوصية تصبح قرارًا عندما يكون لها سبب وأثر ومسؤول وحالة يمكن تغييرها.">
      <div className="grid gap-4">{data.map((item, index) => <section key={item[0]} className="rounded-2xl border border-ink-100 bg-white p-5"><div className="flex flex-col gap-4 lg:flex-row lg:justify-between"><div><div className="flex gap-2"><span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-800">{item[3]}</span><span className="rounded-full bg-primary-50 px-2 py-1 text-[10px] font-black text-primary-800">{states[index]}</span></div><h2 className="mt-3 text-lg font-black">{item[0]}</h2><p className="mt-2 text-sm text-ink-600">{item[1]}</p></div><div className="rounded-xl bg-ink-50 p-3 text-xs"><div className="text-ink-500">المسؤول</div><div className="mt-1 font-black">{item[2]}</div></div></div>{states[index] !== 'معتمد' && <button type="button" onClick={() => setStates(current => current.map((state, i) => i === index ? 'معتمد' : state))} className="mt-4 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-black text-white">اعتماد القرار</button>}</section>)}</div>
    </Shell>
  );
}

export function PublicDemoWorkspacePage() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/reports') return <Reports />;
  if (path === '/reports/inventory' || path === '/reports/inventory-intelligence') return <Inventory />;
  if (path === '/reports/sales') return <Sales />;
  if (path === '/reports/receivables') return <Receivables />;
  if (path === '/decision-experience') return <Decisions />;
  return <Overview />;
}
