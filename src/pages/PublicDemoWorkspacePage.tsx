import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

type FixtureRow = {
  documentNo: string;
  date: string;
  productCode: string;
  productName: string;
  warehouse: string;
  salesQty: number;
  currentStock: number;
  unitPrice: number;
  netAmount: number;
  cost: number;
  profit: number;
  paidAmount: number;
};

const inventoryRows: FixtureRow[] = [
  { documentNo:'DOC-28-001', date:'2026-01-15', productCode:'SKU-1', productName:'صنف 1', warehouse:'WH-1', salesQty:8, currentStock:22, unitPrice:12, netAmount:173, cost:113, profit:60, paidAmount:108 },
  { documentNo:'DOC-28-002', date:'2026-02-15', productCode:'SKU-2', productName:'صنف 2', warehouse:'WH-2', salesQty:9, currentStock:24, unitPrice:13, netAmount:189, cost:130, profit:63, paidAmount:125 },
  { documentNo:'DOC-28-003', date:'2026-03-15', productCode:'SKU-3', productName:'صنف 3', warehouse:'WH-3', salesQty:10, currentStock:26, unitPrice:14, netAmount:205, cost:147, profit:66, paidAmount:142 },
  { documentNo:'DOC-28-004', date:'2026-04-15', productCode:'SKU-4', productName:'صنف 4', warehouse:'WH-1', salesQty:11, currentStock:25, unitPrice:15, netAmount:224, cost:164, profit:69, paidAmount:159 },
  { documentNo:'DOC-28-005', date:'2026-05-15', productCode:'SKU-5', productName:'صنف 5', warehouse:'WH-2', salesQty:12, currentStock:27, unitPrice:12, netAmount:240, cost:181, profit:72, paidAmount:176 },
  { documentNo:'DOC-28-006', date:'2026-06-15', productCode:'SKU-1', productName:'صنف 1', warehouse:'WH-3', salesQty:13, currentStock:29, unitPrice:13, netAmount:256, cost:198, profit:75, paidAmount:193 },
  { documentNo:'DOC-28-007', date:'2026-07-15', productCode:'SKU-2', productName:'صنف 2', warehouse:'WH-1', salesQty:14, currentStock:28, unitPrice:14, netAmount:275, cost:215, profit:78, paidAmount:210 },
  { documentNo:'DOC-28-008', date:'2026-08-15', productCode:'SKU-3', productName:'صنف 3', warehouse:'WH-2', salesQty:15, currentStock:30, unitPrice:15, netAmount:291, cost:232, profit:81, paidAmount:227 },
  { documentNo:'DOC-28-009', date:'2026-09-15', productCode:'SKU-4', productName:'صنف 4', warehouse:'WH-3', salesQty:16, currentStock:32, unitPrice:12, netAmount:307, cost:249, profit:84, paidAmount:244 },
  { documentNo:'DOC-28-010', date:'2026-10-15', productCode:'SKU-5', productName:'صنف 5', warehouse:'WH-1', salesQty:17, currentStock:31, unitPrice:13, netAmount:326, cost:266, profit:87, paidAmount:261 },
  { documentNo:'DOC-28-011', date:'2026-11-15', productCode:'SKU-1', productName:'صنف 1', warehouse:'WH-2', salesQty:18, currentStock:33, unitPrice:14, netAmount:342, cost:283, profit:90, paidAmount:278 },
  { documentNo:'DOC-28-012', date:'2026-12-15', productCode:'SKU-2', productName:'صنف 2', warehouse:'WH-3', salesQty:19, currentStock:35, unitPrice:15, netAmount:358, cost:300, profit:93, paidAmount:295 },
];

const salesRows: FixtureRow[] = [
  { documentNo:'DOC-02-001', date:'2026-01-15', productCode:'SKU-1', productName:'صنف 1', warehouse:'WH-1', salesQty:8, currentStock:22, unitPrice:15, netAmount:147, cost:87, profit:60, paidAmount:82 },
  { documentNo:'DOC-02-002', date:'2026-02-15', productCode:'SKU-2', productName:'صنف 2', warehouse:'WH-2', salesQty:9, currentStock:24, unitPrice:16, netAmount:163, cost:104, profit:63, paidAmount:99 },
  { documentNo:'DOC-02-003', date:'2026-03-15', productCode:'SKU-3', productName:'صنف 3', warehouse:'WH-3', salesQty:10, currentStock:26, unitPrice:17, netAmount:179, cost:121, profit:66, paidAmount:116 },
  { documentNo:'DOC-02-004', date:'2026-04-15', productCode:'SKU-4', productName:'صنف 4', warehouse:'WH-1', salesQty:11, currentStock:25, unitPrice:18, netAmount:198, cost:138, profit:69, paidAmount:133 },
  { documentNo:'DOC-02-005', date:'2026-05-15', productCode:'SKU-5', productName:'صنف 5', warehouse:'WH-2', salesQty:12, currentStock:27, unitPrice:19, netAmount:214, cost:155, profit:72, paidAmount:150 },
  { documentNo:'DOC-02-006', date:'2026-06-15', productCode:'SKU-1', productName:'صنف 1', warehouse:'WH-3', salesQty:13, currentStock:29, unitPrice:15, netAmount:230, cost:172, profit:75, paidAmount:167 },
  { documentNo:'DOC-02-007', date:'2026-07-15', productCode:'SKU-2', productName:'صنف 2', warehouse:'WH-1', salesQty:14, currentStock:28, unitPrice:16, netAmount:249, cost:189, profit:78, paidAmount:184 },
  { documentNo:'DOC-02-008', date:'2026-08-15', productCode:'SKU-3', productName:'صنف 3', warehouse:'WH-2', salesQty:15, currentStock:30, unitPrice:17, netAmount:265, cost:206, profit:81, paidAmount:201 },
  { documentNo:'DOC-02-009', date:'2026-09-15', productCode:'SKU-4', productName:'صنف 4', warehouse:'WH-3', salesQty:16, currentStock:32, unitPrice:18, netAmount:281, cost:223, profit:84, paidAmount:218 },
  { documentNo:'DOC-02-010', date:'2026-10-15', productCode:'SKU-5', productName:'صنف 5', warehouse:'WH-1', salesQty:17, currentStock:31, unitPrice:19, netAmount:300, cost:240, profit:87, paidAmount:235 },
  { documentNo:'DOC-02-011', date:'2026-11-15', productCode:'SKU-1', productName:'صنف 1', warehouse:'WH-2', salesQty:18, currentStock:33, unitPrice:15, netAmount:316, cost:257, profit:90, paidAmount:252 },
  { documentNo:'DOC-02-012', date:'2026-12-15', productCode:'SKU-2', productName:'صنف 2', warehouse:'WH-3', salesQty:19, currentStock:35, unitPrice:16, netAmount:332, cost:274, profit:93, paidAmount:269 },
];

const fmt = (n: number) => new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 2 }).format(n);
const coverage = (r: FixtureRow) => r.salesQty > 0 ? r.currentStock / r.salesQty : null;
const priority = (r: FixtureRow) => {
  const days = coverage(r);
  if (days == null) return 'REVIEW';
  if (days < 2) return 'P0';
  if (days < 2.5) return 'P1';
  return 'P2';
};

const nav = [
  ['/', 'مركز القيادة'],
  ['/reports', 'التقارير'],
  ['/reports/inventory', 'المخزون'],
  ['/reports/sales', 'المبيعات'],
  ['/reports/receivables', 'التحصيل'],
  ['/decision-experience', 'القرار'],
];

function Nav({ active }: { active: string }) {
  return <nav className="flex gap-2 overflow-x-auto">{nav.map(([path,label]) =>
    <Link key={path} to={path} className={"whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-black " + (path === active ? 'border-primary-700 bg-primary-700 text-white' : 'border-ink-100 bg-white text-ink-700')}>{label}</Link>
  )}</nav>;
}

function Shell({ title, subtitle, active, children }: { title: string; subtitle: string; active: string; children: ReactNode }) {
  return <div dir="rtl" className="min-h-screen bg-[#f3f5f9] text-ink-950">
    <div className="mx-auto max-w-[1440px] p-3 sm:p-5 lg:p-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="font-black">الأغبري <span className="text-xs font-bold text-ink-400">/ عرض المنتج المبني على المصدر</span></div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-800">مصدر Fixture موثق · لا يصل إلى بيانات العملاء</span>
      </div>
      <header className="rounded-2xl bg-[#0c1222] p-5 text-white shadow-[0_24px_70px_-44px_rgba(15,23,42,.7)]">
        <div className="text-[10px] font-black tracking-[.14em] text-emerald-300">AGHBARI · SOURCE-BACKED DEMO</div>
        <h1 className="mt-2 text-2xl font-black">{title}</h1>
        <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-300">{subtitle}</p>
      </header>
      <div className="mt-4"><Nav active={active} /></div>
      <main className="mt-5">{children}</main>
      <footer className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 text-[11px] leading-5 text-ink-500">
        المعروض هنا مأخوذ من Fixtures واقعية داخل المستودع، وليس من شركة عميل. المصدران الرئيسيان: 02-sales-invoice-detail.csv و28-inventory-stockout-reorder.csv.
      </footer>
    </div>
  </div>;
}

function Kpi({ label, value, note }: { label:string; value:string; note:string }) {
  return <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
    <div className="text-xs font-bold text-ink-500">{label}</div>
    <div className="mt-2 text-2xl font-black">{value}</div>
    <div className="mt-1 text-[11px] text-ink-500">{note}</div>
  </div>;
}

function Overview() {
  const salesTotal = salesRows.reduce((s,r)=>s+r.netAmount,0);
  const outstanding = salesRows.reduce((s,r)=>s+Math.max(0,r.netAmount-r.paidAmount),0);
  const stockValue = inventoryRows.reduce((s,r)=>s+(r.currentStock*r.unitPrice),0);
  const low = inventoryRows.filter(r=>priority(r)!=='P2').length;
  return <Shell active="/" title="مركز القيادة" subtitle="الأرقام محسوبة مباشرة من صفوف المصدر، ثم تتحول إلى إشارة وسياق وقرار قابل للتجربة.">
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="صافي المبيعات" value={fmt(salesTotal)+' ر.ي.'} note="12 صفًا من 02-sales-invoice-detail.csv" />
      <Kpi label="المتبقي للتحصيل" value={fmt(outstanding)+' ر.ي.'} note="صافي المبلغ − المدفوع" />
      <Kpi label="قيمة المخزون" value={fmt(stockValue)+' ر.ي.'} note="الرصيد الحالي × سعر الوحدة من المصدر" />
      <Kpi label="إشارات تحتاج انتباهًا" value={String(low)} note="محسوبة من أيام التغطية" />
    </section>
    <section className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <h2 className="font-black">ما الذي يحتاج انتباهًا؟</h2>
        <p className="mt-1 text-xs text-ink-500">لا توجد أرقام دخيلة؛ كل قيمة أدناه قابلة لإعادة الحساب من الصفوف المصدرية.</p>
        <div className="mt-4 grid gap-3">
          {inventoryRows.slice().sort((a,b)=>(coverage(a) ?? 999)-(coverage(b) ?? 999)).slice(0,3).map(r =>
            <div key={r.documentNo} className="grid grid-cols-[90px_1fr] gap-3 rounded-2xl border border-ink-100 p-4">
              <div className="text-xl font-black text-primary-700">{fmt(coverage(r) ?? 0)}</div>
              <div><div className="font-black">{r.productCode} · {r.productName}</div><div className="mt-1 text-xs text-ink-500">{r.currentStock} رصيد ÷ {r.salesQty} مبيعات = أيام تغطية تقديرية داخل اللقطة · {priority(r)}</div></div>
            </div>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
        <div className="text-xs font-black text-primary-800">تجربة فعلية</div>
        <h2 className="mt-2 text-xl font-black">افتح المخزون</h2>
        <p className="mt-2 text-sm leading-6 text-ink-600">ابحث وصفِّ الصفوف ثم افتح سجلًا لرؤية السبب والحساب والانتقال إلى القرار.</p>
        <Link to="/reports/inventory" className="mt-4 inline-flex rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-black text-white">فتح المخزون ←</Link>
      </div>
    </section>
  </Shell>;
}

function Reports() {
  return <Shell active="/reports" title="مركز التقارير" subtitle="أربع مساحات تقرأ صفوفًا حقيقية من Fixtures وتبني فوقها مؤشرات قابلة للفحص.">
    <div className="grid gap-4 md:grid-cols-2">
      {[
        ['/reports/inventory','المخزون','12 صفًا مصدرّيًا · رصيد · مبيعات · تغطية · أولوية'],
        ['/reports/sales','المبيعات','12 فاتورة مصدرية · صافي · تكلفة · ربح · مدفوع'],
        ['/reports/receivables','التحصيل','رصيد كل فاتورة غير مسدد من المصدر'],
        ['/decision-experience','القرار','إشارة محسوبة · سبب · مسؤول · اعتماد'],
      ].map(([path,title,note]) => <Link key={path} to={path} className="rounded-2xl border border-ink-100 bg-white p-5 hover:border-primary-300 hover:shadow-md"><h2 className="text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-ink-600">{note}</p><div className="mt-4 text-xs font-black text-primary-700">افتح السطح ←</div></Link>)}
    </div>
  </Shell>;
}

function Inventory() {
  const [q,setQ]=useState('');
  const [p,setP]=useState('ALL');
  const [selected,setSelected]=useState<FixtureRow|null>(null);
  const visible=useMemo(()=>inventoryRows.filter(r=>{
    const hay=(r.documentNo+' '+r.productCode+' '+r.productName+' '+r.warehouse).toLowerCase();
    return hay.includes(q.toLowerCase().trim()) && (p==='ALL'||priority(r)===p);
  }),[q,p]);
  return <Shell active="/reports/inventory" title="ذكاء المخزون" subtitle="هذه الشاشة تعرض الصفوف نفسها، والحكم مشتق من البيانات الظاهرة أمامك.">
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="عدد صفوف اللقطة" value={String(inventoryRows.length)} note="من ملف 28-inventory-stockout-reorder.csv" />
      <Kpi label="أقل تغطية" value={fmt(Math.min(...inventoryRows.map(r=>coverage(r) ?? 999)))} note="نسبة الرصيد إلى مبيعات الصف" />
      <Kpi label="قيمة الرصيد" value={fmt(inventoryRows.reduce((s,r)=>s+r.currentStock*r.unitPrice,0))+' ر.ي.'} note="تجميع الصفوف المصدرية" />
      <Kpi label="صفوف P0/P1" value={String(inventoryRows.filter(r=>priority(r)==='P0'||priority(r)==='P1').length)} note="قاعدة الأولوية المعروضة أسفل الجدول" />
    </section>
    <section className="mt-4 rounded-2xl border border-ink-100 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 className="font-black">جدول المصدر</h2><p className="mt-1 text-xs text-ink-500">كل صف يمكن فتحه. التصفية والبحث يعملان مباشرة على البيانات الحالية.</p></div>
        <div className="flex gap-2"><input value={q} onChange={e=>setQ(e.target.value)} className="h-10 min-w-56 rounded-xl border border-ink-200 px-3 text-xs" placeholder="ابحث..." /><select value={p} onChange={e=>setP(e.target.value)} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-xs font-bold"><option value="ALL">كل الأولويات</option><option value="P0">P0</option><option value="P1">P1</option><option value="P2">P2</option></select></div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100">
        <table className="min-w-[900px] w-full text-right text-xs">
          <thead className="bg-ink-50"><tr>{['المستند','الصنف','المستودع','المبيعات','الرصيد','التغطية','سعر الوحدة','الأولوية','فتح'].map(h=><th key={h} className="px-3 py-3 font-black">{h}</th>)}</tr></thead>
          <tbody>{visible.map(r=><tr key={r.documentNo} className="border-t border-ink-100 hover:bg-primary-50/40">
            <td className="px-3 py-3 font-black">{r.documentNo}</td><td className="px-3 py-3">{r.productCode} · {r.productName}</td><td className="px-3 py-3">{r.warehouse}</td><td className="px-3 py-3">{r.salesQty}</td><td className="px-3 py-3 font-black">{r.currentStock}</td><td className="px-3 py-3">{fmt(coverage(r) ?? 0)}</td><td className="px-3 py-3">{fmt(r.unitPrice)}</td><td className="px-3 py-3 font-black">{priority(r)}</td><td className="px-3 py-3"><button type="button" onClick={()=>setSelected(r)} className="rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-[10px] font-black text-primary-800">افتح</button></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-black text-primary-700">{selected.documentNo}</div><h2 className="mt-1 text-xl font-black">{selected.productCode} · {selected.productName}</h2></div><button onClick={()=>setSelected(null)} type="button" className="rounded-xl border border-ink-200 px-3 py-2 text-xs font-black">إغلاق</button></div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['المبيعات',String(selected.salesQty)],['الرصيد',String(selected.currentStock)],['التغطية',fmt(coverage(selected) ?? 0)],['الأولوية',priority(selected)]].map(([k,v])=><div key={k} className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-500">{k}</div><div className="mt-1 font-black">{v}</div></div>)}</div>
        <p className="mt-4 rounded-xl border border-ink-100 bg-ink-50 p-4 text-sm leading-6">سبب الإشارة: التغطية = الرصيد الحالي ÷ الكمية المباعة في الصف. لا يوجد إدخال يدوي للرقم النهائي.</p>
        <Link to="/decision-experience" className="mt-4 inline-flex rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-black text-white">حوّلها إلى قرار ←</Link>
      </div>
    </div>}
  </Shell>;
}

function Sales() {
  const total=salesRows.reduce((s,r)=>s+r.netAmount,0);
  const paid=salesRows.reduce((s,r)=>s+r.paidAmount,0);
  return <Shell active="/reports/sales" title="تقرير المبيعات" subtitle="صفوف مبيعات مصدرية مع صافي المبلغ والتكلفة والربح والمدفوع، دون توليد أرقام خارج الملف.">
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="صافي المبيعات" value={fmt(total)+' ر.ي.'} note="12 صفًا" /><Kpi label="التكلفة" value={fmt(salesRows.reduce((s,r)=>s+r.cost,0))+' ر.ي.'} note="من المصدر" /><Kpi label="الربح" value={fmt(salesRows.reduce((s,r)=>s+r.profit,0))+' ر.ي.'} note="من المصدر" /><Kpi label="المدفوع" value={fmt(paid)+' ر.ي.'} note="من المصدر" /></section>
    <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100 bg-white p-4"><table className="min-w-[850px] w-full text-right text-xs"><thead className="bg-ink-50"><tr>{['المستند','التاريخ','العميل','الصنف','الصافي','التكلفة','الربح','المدفوع'].map(h=><th key={h} className="px-3 py-3 font-black">{h}</th>)}</tr></thead><tbody>{salesRows.map(r=><tr key={r.documentNo} className="border-t border-ink-100"><td className="px-3 py-3 font-black">{r.documentNo}</td><td className="px-3 py-3">{r.date}</td><td className="px-3 py-3">مصدر C-</td><td className="px-3 py-3">{r.productCode} · {r.productName}</td><td className="px-3 py-3">{fmt(r.netAmount)}</td><td className="px-3 py-3">{fmt(r.cost)}</td><td className="px-3 py-3 font-black">{fmt(r.profit)}</td><td className="px-3 py-3">{fmt(r.paidAmount)}</td></tr>)}</tbody></table></div>
  </Shell>;
}

function Receivables() {
  const rows=salesRows.map(r=>({...r,balance:Math.max(0,r.netAmount-r.paidAmount)})).filter(r=>r.balance>0);
  const buckets=[['مفتوح','',rows.reduce((s,r)=>s+r.balance,0)]];
  return <Shell active="/reports/receivables" title="الذمم والتحصيل" subtitle="المتبقي محسوب من صافي الفاتورة ناقص المدفوع لكل صف مصدرّي.">
    <section className="grid gap-3 sm:grid-cols-3"><Kpi label="الرصيد المفتوح" value={fmt(rows.reduce((s,r)=>s+r.balance,0))+' ر.ي.'} note="من صفوف المبيعات" /><Kpi label="عدد الصفوف المفتوحة" value={String(rows.length)} note="نتيجة حسابية" /><Kpi label="إجمالي المدفوع" value={fmt(salesRows.reduce((s,r)=>s+r.paidAmount,0))+' ر.ي.'} note="من المصدر" /></section>
    <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-4"><h2 className="font-black">الذمم المفتوحة</h2><div className="mt-4 grid gap-3">{rows.map(r=><div key={r.documentNo} className="flex flex-col gap-2 rounded-xl border border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-black">{r.documentNo} · {r.productCode}</div><div className="mt-1 text-xs text-ink-500">{r.date} · الصافي {fmt(r.netAmount)} · المدفوع {fmt(r.paidAmount)}</div></div><div className="text-lg font-black text-primary-700">{fmt(r.balance)} ر.ي.</div></div>)}</div></div>
  </Shell>;
}

function Decisions() {
  const [states,setStates]=useState<Record<string,'مقترح'|'معتمد'>>({});
  const candidates=inventoryRows.slice().sort((a,b)=>(coverage(a)??999)-(coverage(b)??999)).slice(0,3);
  return <Shell active="/decision-experience" title="تجربة القرار" subtitle="القرار هنا مشتق من إشارة مصدرية محددة، وليس من نص إنشائي مستقل.">
    <div className="grid gap-4">{candidates.map(r=>{
      const days=coverage(r) ?? 0;
      const title = 'مراجعة تغطية '+r.productCode+' · '+r.productName;
      const state=states[r.documentNo] ?? 'مقترح';
      return <section key={r.documentNo} className="rounded-2xl border border-ink-100 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between"><div><div className="flex gap-2"><span className="rounded-full bg-primary-50 px-2 py-1 text-[10px] font-black text-primary-800">{priority(r)}</span><span className="rounded-full bg-ink-50 px-2 py-1 text-[10px] font-black">{state}</span></div><h2 className="mt-3 text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-ink-600">السبب: {r.currentStock} رصيد حالي مقابل {r.salesQty} مبيعات في صف المصدر، أي تغطية {fmt(days)}. الأثر المتوقع: منع وصول التغطية إلى منطقة حرجة.</p></div><div className="rounded-xl bg-ink-50 p-3 text-xs"><div className="text-ink-500">المسؤول المقترح</div><div className="mt-1 font-black">المخزون</div></div></div>
        {state==='مقترح' && <button type="button" onClick={()=>setStates(s=>({...s,[r.documentNo]:'معتمد'}))} className="mt-4 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-black text-white">اعتماد القرار</button>}
      </section>;
    })}</div>
  </Shell>;
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
