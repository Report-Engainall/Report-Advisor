import { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Calendar } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
const SimpleBarChart = lazy(async () => ({ default: (await import('@/components/ui/Charts')).SimpleBarChart }));
import { fetchDashboardSnapshot, fetchRFMSnapshot, fetchABCSnapshot, fetchAgingSnapshot, type RFMSnapshotRow, type ABCSnapshotRow, type AgingSnapshotRow } from '@/lib/dashboard-canonical';
import { formatCurrency, formatNumber } from '@/lib/format';
import { TruthContextStrip } from '@/components/TruthContextStrip';

const analyticsCards = [
  {
    path: '/analytics/rfm',
    title: 'عملاؤك',
    question: 'من يستحق الاحتفاظ والعودة والمتابعة؟',
    desc: 'RFM يربط حداثة الشراء وتكراره وقيمته لتحديد شرائح العملاء من المصدر التحليلي.',
    icon: Users,
    iconClass: 'bg-primary-50 text-primary-600',
    tag: 'قرار العملاء',
  },
  {
    path: '/analytics/abc',
    title: 'محفظة المنتجات',
    question: 'أين تتركز مساهمة الإيرادات؟',
    desc: 'ABC يوضح مساهمة المنتجات تراكمياً مع إبقاء السجلات الناقصة خارج التصنيف الموثوق.',
    icon: Package,
    iconClass: 'bg-accent-50 text-accent-600',
    tag: 'قرار المنتجات',
  },
  {
    path: '/analytics/aging',
    title: 'التعرض والتحصيل',
    question: 'أين تتجمع الذمم وما عمرها؟',
    desc: 'تحليل الأعمار يوزع الذمم حسب الاستحقاق من المصدر، مع إبقاء الحالات غير المؤكدة مرئية.',
    icon: Calendar,
    iconClass: 'bg-warning-50 text-warning-600',
    tag: 'قرار التحصيل',
  },
];

export function AnalyticsCenterPage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSnapshot(await fetchDashboardSnapshot(6));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل سياق التحليلات.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState message="جارٍ تثبيت سياق التحليلات..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!snapshot) return null;

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="مركز التحليلات"
        subtitle="ابدأ من سؤال تجاري واضح، ثم افتح العدسة التي تملك مسارًا تحليليًا موثقًا للإجابة."
        actions={<button type="button" onClick={() => void load()} className="btn-secondary">تحديث السياق</button>}
      />

      <TruthContextStrip months={snapshot.months} status={snapshot.kpis.status} asOf={snapshot.asOf} />

      <section className="rounded-[18px] border border-ink-200 bg-ink-950 p-5 text-white shadow-card lg:p-6">
        <div className="section-kicker text-primary-300">من السؤال إلى العدسة</div>
        <h2 className="mt-2 text-xl font-black tracking-tight lg:text-2xl">ما الذي تريد فهمه الآن؟</h2>
        <p className="mt-2 max-w-3xl text-[11px] leading-6 text-ink-300">
          هذه الصفحة لا تصنع نتيجة جديدة؛ هي نقطة توجيه إلى التحليلات الكانونية الموجودة. حالة البيانات والزمن والسياق المؤسسي تأتي من اللقطة الحالية.
        </p>
        <div className="mt-5 grid gap-2 text-[10px] font-semibold sm:grid-cols-4">
          {['سؤال تجاري', 'مصدر تحليلي', 'دليل وقيود', 'قرار قابل للتحقيق'].map((label, index) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[.045] p-3">
              <span className="block text-white/35">0{index + 1}</span>
              <span className="mt-2 block text-white">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="عدسات التحليل" className="grid gap-4 lg:grid-cols-3">
        {analyticsCards.map((r) => (
          <Link key={r.path} to={r.path} className="group">
            <Card hover className="h-full overflow-hidden">
              <CardBody className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${r.iconClass}`}>
                    <r.icon size={20} />
                  </div>
                  <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-bold text-ink-500">{r.tag}</span>
                </div>
                <h3 className="mt-4 text-base font-black text-ink-900">{r.title}</h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-ink-700">{r.question}</p>
                <p className="mt-2 flex-1 text-xs leading-6 text-ink-500">{r.desc}</p>
                <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-3 text-[10px] font-bold">
                  <span className="text-ink-400">المصدر الكانوني هو المرجع</span>
                  <span className="text-primary-700 transition-transform group-hover:-translate-x-1">فتح العدسة ←</span>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card><CardBody><div className="text-[10px] font-black text-ink-400">حدود الاستخدام</div><div className="mt-2 text-sm font-bold text-ink-800">لا يتم تعويض القيم المفقودة بصفر.</div><p className="mt-1 text-[11px] leading-5 text-ink-500">ستظهر الحالات غير الكافية كحالة صريحة بدل تحويلها إلى تصنيف أو درجة مصطنعة.</p></CardBody></Card>
        <Card><CardBody><div className="text-[10px] font-black text-ink-400">زمن اللقطة</div><div className="mt-2 text-sm font-bold text-ink-800">{snapshot.asOf}</div><p className="mt-1 text-[11px] leading-5 text-ink-500">التحليل يظل مرتبطًا بالسياق الزمني الظاهر أعلى الصفحة.</p></CardBody></Card>
        <Card><CardBody><div className="text-[10px] font-black text-ink-400">الخطوة التالية</div><div className="mt-2 text-sm font-bold text-ink-800">افتح العدسة، ثم افحص الدليل قبل اتخاذ إجراء.</div><p className="mt-1 text-[11px] leading-5 text-ink-500">التحليل ليس اعتمادًا تلقائيًا لقرار تشغيلي.</p></CardBody></Card>
      </section>
    </div>
  );
}

const RFM_VARIANTS: Record<string, 'success' | 'primary' | 'accent' | 'warning' | 'danger' | 'neutral'> = { 'أبطال': 'success', 'مخلصون': 'primary', 'واعدون': 'accent', 'معرضون للخطر': 'warning', 'خاملون': 'danger' };

export function RFMAnalysisPage() {
  const [data,setData]=useState<RFMSnapshotRow[]>([]); const [status,setStatus]=useState<'INSUFFICIENT_DATA'|'CALCULATED'>('INSUFFICIENT_DATA'); const [unknownRows,setUnknownRows]=useState<number|null>(null); const [asOf,setAsOf]=useState('غير متاح'); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{try{setLoading(true);setError(null);const snapshot=await fetchRFMSnapshot(500);setData(snapshot.rows);setStatus(snapshot.status);setUnknownRows(snapshot.unknownRows);setAsOf(snapshot.asOf);}catch(e:unknown){setError(e instanceof Error?e.message:'فشل تحميل تحليل RFM');}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]); if(loading)return <LoadingState/>; if(error)return <ErrorState message={error} onRetry={load}/>;
  const counts=new Map<string,number>(); data.forEach(r=>counts.set(r.rfm_segment,(counts.get(r.rfm_segment)||0)+1)); const segmentData=Array.from(counts.entries()).map(([name,value])=>({name,value}));
  return <div dir="rtl" className="space-y-6 animate-fade-in"><PageHeader title="تحليل RFM" subtitle="تصنيف العملاء من المصدر التحليلي المعتمد، دون تحميل سجل المعاملات كاملًا إلى المتصفح"/><TruthContextStrip periodLabel="لقطة تحليلية من المصدر" status={status} asOf={asOf}/>{status==='INSUFFICIENT_DATA'&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">البيانات غير كافية لإصدار RFM كامل. السجلات غير الصالحة/الناقصة: {unknownRows==null?'غير متاح':formatNumber(unknownRows)}. لا يتم تصنيع درجات بديلة.</div>}<div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Card><CardHeader title="توزيع الشرائح"/><CardBody>{segmentData.length?<Suspense fallback={<div className="flex h-[250px] items-center justify-center text-xs text-ink-400">جارٍ تحميل الرسم...</div>}><SimpleBarChart data={segmentData} dataKey="value" nameKey="name" height={250}/></Suspense>:<div className="text-sm text-ink-500 py-16 text-center">لا توجد بيانات كافية</div>}</CardBody></Card><Card className="lg:col-span-2"><CardHeader title="تفاصيل العملاء"/><DataTable columns={[{key:'customer_name',label:'العميل'},{key:'recency',label:'الحداثة (يوم)',align:'center',render:(r:RFMSnapshotRow)=>formatNumber(r.recency)},{key:'frequency',label:'التكرار',align:'center',render:(r:RFMSnapshotRow)=>formatNumber(r.frequency)},{key:'monetary',label:'القيمة',align:'right',render:(r:RFMSnapshotRow)=>formatCurrency(r.monetary)},{key:'rfm_segment',label:'الشريحة',align:'center',render:(r:RFMSnapshotRow)=><Badge variant={RFM_VARIANTS[r.rfm_segment]??'neutral'}>{r.rfm_segment}</Badge>}] } data={data.slice(0,20)}/></Card></div></div>;
}

export function ABCAnalysisPage(){
  const[data,setData]=useState<ABCSnapshotRow[]>([]); const [status,setStatus]=useState<'INSUFFICIENT_DATA'|'CALCULATED'>('INSUFFICIENT_DATA'); const [unknownRows,setUnknownRows]=useState<number|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{try{setLoading(true);setError(null);const snapshot=await fetchABCSnapshot(500);setData(snapshot.rows);setStatus(snapshot.status);setUnknownRows(snapshot.unknownRows);}catch(e:unknown){setError(e instanceof Error?e.message:'فشل تحميل تحليل ABC');}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]); if(loading)return <LoadingState/>; if(error)return <ErrorState message={error} onRetry={load}/>;
  const counts=new Map<string,number>(); data.forEach(r=>{if(r.class)counts.set(r.class,(counts.get(r.class)||0)+1);});
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تحليل ABC" subtitle="تصنيف المنتجات حسب مساهمة الإيرادات من المصدر المعتمد"/>{status==='INSUFFICIENT_DATA'&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">لا يمكن إصدار تصنيف ABC موثوق من البيانات الحالية. السجلات الناقصة: {unknownRows==null?'غير متاح':formatNumber(unknownRows)}.</div>}<div className="grid grid-cols-3 gap-4">{['A','B','C'].map(c=><Card key={c}><CardBody><div className="text-xs text-ink-500 mb-1">الفئة {c}</div><div className="text-xl font-bold text-ink-900">{counts.get(c)??'—'} منتج</div><div className="text-xs text-ink-400 mt-1">حدود الفئات يحسبها المصدر التحليلي نفسه</div></CardBody></Card>)}</div><Card><CardHeader title="تصنيف المنتجات"/><DataTable columns={[{key:'product_name',label:'المنتج'},{key:'revenue',label:'الإيرادات',align:'right',render:(r:ABCSnapshotRow)=>formatCurrency(r.revenue)},{key:'cumulative_pct',label:'النسبة التراكمية',align:'right',render:(r:ABCSnapshotRow)=>r.cumulative_pct==null?'غير متاح':`${r.cumulative_pct.toFixed(1)}%`},{key:'class',label:'الفئة',align:'center',render:(r:ABCSnapshotRow)=><Badge variant={r.class==='A'?'success':r.class==='B'?'primary':'neutral'}>{r.class??'غير معروف'}</Badge>}] } data={data.slice(0,30)}/></Card></div>;
}

export function AgingAnalysisPage(){
  const[buckets,setBuckets]=useState<AgingSnapshotRow[]>([]); const [status,setStatus]=useState<'NO_DATA'|'INSUFFICIENT_DATA'|'CALCULATED'>('NO_DATA'); const [unknownRows,setUnknownRows]=useState<number|null>(null); const [asOf,setAsOf]=useState('غير متاح'); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{try{setLoading(true);setError(null);const snapshot=await fetchAgingSnapshot();setBuckets(snapshot.rows);setStatus(snapshot.status);setUnknownRows(snapshot.unknownRows);setAsOf(snapshot.asOf);}catch(e:unknown){setError(e instanceof Error?e.message:'فشل تحميل تحليل أعمار الذمم');}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]); if(loading)return <LoadingState/>; if(error)return <ErrorState message={error} onRetry={load}/>;
  return <div dir="rtl" className="space-y-6 animate-fade-in"><PageHeader title="تحليل أعمار الذمم" subtitle="توزيع الذمم من المصدر المعتمد، مع حفظ حالة البيانات الناقصة"/><TruthContextStrip periodLabel="لقطة تحليلية من المصدر" status={status==='CALCULATED'?'CALCULATED':'INSUFFICIENT_DATA'} asOf={asOf}/>{status==='INSUFFICIENT_DATA'&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">بعض السجلات لا تكفي لحساب العمر بثقة: {unknownRows==null?'غير متاح':formatNumber(unknownRows)}. تظهر كـ«دون تاريخ» أو «حالة غير مكتملة» بدل تحويلها إلى صفر.</div>}<Card><CardHeader title="توزيع الأعمار"/><CardBody>{buckets.length?<Suspense fallback={<div className="flex h-[280px] items-center justify-center text-xs text-ink-400">جارٍ تحميل الرسم...</div>}><SimpleBarChart data={buckets} dataKey="amount" nameKey="name"/></Suspense>:<div className="text-sm text-ink-500 py-16 text-center">لا توجد بيانات</div>}</CardBody></Card><Card><CardHeader title="التفاصيل"/><DataTable columns={[{key:'name',label:'الفئة (يوم)'},{key:'amount',label:'المبلغ',align:'right',render:(r:AgingSnapshotRow)=>formatCurrency(r.amount)},{key:'count',label:'عدد الفواتير',align:'center',render:(r:AgingSnapshotRow)=>formatNumber(r.count)}]} data={buckets}/></Card></div>;
}
