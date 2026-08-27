import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Calendar } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { SimpleBarChart } from '@/components/ui/Charts';
import { fetchRFMSnapshot, fetchABCSnapshot, fetchAgingSnapshot, type RFMSnapshotRow, type ABCSnapshotRow, type AgingSnapshotRow } from '@/lib/dashboard-canonical';
import { formatCurrency, formatNumber } from '@/lib/format';

const analyticsCards = [
  { path: '/analytics/rfm', title: 'تحليل RFM للعملاء', desc: 'تصنيف العملاء حسب الحداثة والتكرار والقيمة', icon: Users, color: 'primary' },
  { path: '/analytics/abc', title: 'تحليل ABC للمنتجات', desc: 'تصنيف المنتجات حسب الأهمية والمساهمة', icon: Package, color: 'accent' },
  { path: '/analytics/aging', title: 'تحليل أعمار الذمم', desc: 'توزيع الفواتير حسب عمر الاستحقاق', icon: Calendar, color: 'warning' },
];

export function AnalyticsCenterPage() { return <div className="space-y-6 animate-fade-in"><PageHeader title="مركز التحليلات" subtitle="تحليلات متقدمة لاكتشاف الأنماط والاتجاهات" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{analyticsCards.map((r) => <Link key={r.path} to={r.path}><Card hover className="h-full"><CardBody><div className="flex items-start gap-3"><div className={`w-11 h-11 rounded-xl bg-${r.color}-50 text-${r.color}-600 flex items-center justify-center flex-shrink-0`}><r.icon size={20} /></div><div><h3 className="font-semibold text-ink-800 text-sm">{r.title}</h3><p className="text-xs text-ink-500 mt-1">{r.desc}</p></div></div></CardBody></Card></Link>)}</div></div>; }

const RFM_VARIANTS: Record<string, 'success' | 'primary' | 'accent' | 'warning' | 'danger' | 'neutral'> = { 'أبطال': 'success', 'مخلصون': 'primary', 'واعدون': 'accent', 'معرضون للخطر': 'warning', 'خاملون': 'danger' };

export function RFMAnalysisPage() {
  const [data,setData]=useState<RFMSnapshotRow[]>([]); const [status,setStatus]=useState<'INSUFFICIENT_DATA'|'CALCULATED'>('INSUFFICIENT_DATA'); const [unknownRows,setUnknownRows]=useState(0); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{try{setLoading(true);setError(null);const snapshot=await fetchRFMSnapshot(500);setData(snapshot.rows);setStatus(snapshot.status);setUnknownRows(snapshot.unknownRows);}catch(e:unknown){setError(e instanceof Error?e.message:'فشل تحميل تحليل RFM');}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]); if(loading)return <LoadingState/>; if(error)return <ErrorState message={error} onRetry={load}/>;
  const counts=new Map<string,number>(); data.forEach(r=>counts.set(r.rfm_segment,(counts.get(r.rfm_segment)||0)+1)); const segmentData=Array.from(counts.entries()).map(([name,value])=>({name,value}));
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تحليل RFM" subtitle="تصنيف العملاء من المصدر التحليلي المعتمد، دون تحميل سجل المعاملات كاملًا إلى المتصفح"/>{status==='INSUFFICIENT_DATA'&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">البيانات غير كافية لإصدار RFM كامل. السجلات غير الصالحة/الناقصة: {formatNumber(unknownRows)}. لا يتم تصنيع درجات بديلة.</div>}<div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Card><CardHeader title="توزيع الشرائح"/><CardBody>{segmentData.length?<SimpleBarChart data={segmentData} dataKey="value" nameKey="name" height={250}/>:<div className="text-sm text-ink-500 py-16 text-center">لا توجد بيانات كافية</div>}</CardBody></Card><Card className="lg:col-span-2"><CardHeader title="تفاصيل العملاء"/><DataTable columns={[{key:'customer_name',label:'العميل'},{key:'recency',label:'الحداثة (يوم)',align:'center',render:(r:RFMSnapshotRow)=>formatNumber(r.recency)},{key:'frequency',label:'التكرار',align:'center',render:(r:RFMSnapshotRow)=>formatNumber(r.frequency)},{key:'monetary',label:'القيمة',align:'right',render:(r:RFMSnapshotRow)=>formatCurrency(r.monetary)},{key:'rfm_segment',label:'الشريحة',align:'center',render:(r:RFMSnapshotRow)=><Badge variant={RFM_VARIANTS[r.rfm_segment]??'neutral'}>{r.rfm_segment}</Badge>}] } data={data.slice(0,20)}/></Card></div></div>;
}

export function ABCAnalysisPage(){
  const[data,setData]=useState<ABCSnapshotRow[]>([]); const [status,setStatus]=useState<'INSUFFICIENT_DATA'|'CALCULATED'>('INSUFFICIENT_DATA'); const [unknownRows,setUnknownRows]=useState(0); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{try{setLoading(true);setError(null);const snapshot=await fetchABCSnapshot(500);setData(snapshot.rows);setStatus(snapshot.status);setUnknownRows(snapshot.unknownRows);}catch(e:unknown){setError(e instanceof Error?e.message:'فشل تحميل تحليل ABC');}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]); if(loading)return <LoadingState/>; if(error)return <ErrorState message={error} onRetry={load}/>;
  const counts=new Map<string,number>(); data.forEach(r=>{if(r.class)counts.set(r.class,(counts.get(r.class)||0)+1);});
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تحليل ABC" subtitle="تصنيف المنتجات حسب مساهمة الإيرادات من المصدر المعتمد"/>{status==='INSUFFICIENT_DATA'&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">لا يمكن إصدار تصنيف ABC موثوق من البيانات الحالية. السجلات الناقصة: {formatNumber(unknownRows)}.</div>}<div className="grid grid-cols-3 gap-4">{['A','B','C'].map(c=><Card key={c}><CardBody><div className="text-xs text-ink-500 mb-1">الفئة {c}</div><div className="text-xl font-bold text-ink-900">{counts.get(c)??'—'} منتج</div><div className="text-xs text-ink-400 mt-1">حدود الفئات يحسبها المصدر التحليلي نفسه</div></CardBody></Card>)}</div><Card><CardHeader title="تصنيف المنتجات"/><DataTable columns={[{key:'product_name',label:'المنتج'},{key:'revenue',label:'الإيرادات',align:'right',render:(r:ABCSnapshotRow)=>formatCurrency(r.revenue)},{key:'cumulative_pct',label:'النسبة التراكمية',align:'right',render:(r:ABCSnapshotRow)=>r.cumulative_pct==null?'غير متاح':`${r.cumulative_pct.toFixed(1)}%`},{key:'class',label:'الفئة',align:'center',render:(r:ABCSnapshotRow)=><Badge variant={r.class==='A'?'success':r.class==='B'?'primary':'neutral'}>{r.class??'غير معروف'}</Badge>}] } data={data.slice(0,30)}/></Card></div>;
}

export function AgingAnalysisPage(){
  const[buckets,setBuckets]=useState<AgingSnapshotRow[]>([]); const [status,setStatus]=useState<'NO_DATA'|'INSUFFICIENT_DATA'|'CALCULATED'>('NO_DATA'); const [unknownRows,setUnknownRows]=useState(0); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{try{setLoading(true);setError(null);const snapshot=await fetchAgingSnapshot();setBuckets(snapshot.rows);setStatus(snapshot.status);setUnknownRows(snapshot.unknownRows);}catch(e:unknown){setError(e instanceof Error?e.message:'فشل تحميل تحليل أعمار الذمم');}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]); if(loading)return <LoadingState/>; if(error)return <ErrorState message={error} onRetry={load}/>;
  return <div className="space-y-6 animate-fade-in"><PageHeader title="تحليل أعمار الذمم" subtitle="توزيع الذمم من المصدر المعتمد، مع حفظ حالة البيانات الناقصة"/>{status==='INSUFFICIENT_DATA'&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">بعض السجلات لا تكفي لحساب العمر بثقة: {formatNumber(unknownRows)}. تظهر كـUNDATED/حالة غير مكتملة بدل تحويلها إلى صفر.</div>}<Card><CardHeader title="توزيع الأعمار"/><CardBody>{buckets.length?<SimpleBarChart data={buckets} dataKey="amount" nameKey="name"/>:<div className="text-sm text-ink-500 py-16 text-center">لا توجد بيانات</div>}</CardBody></Card><Card><CardHeader title="التفاصيل"/><DataTable columns={[{key:'name',label:'الفئة (يوم)'},{key:'amount',label:'المبلغ',align:'right',render:(r:AgingSnapshotRow)=>formatCurrency(r.amount)},{key:'count',label:'عدد الفواتير',align:'center',render:(r:AgingSnapshotRow)=>formatNumber(r.count)}]} data={buckets}/></Card></div>;
}
