import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, BrainCircuit, ChevronLeft, CircleAlert, FileCheck2, Gauge, ShieldAlert, Sparkles, WalletCards } from 'lucide-react';
import { EvidenceDrawer, type EvidenceDrawerData } from '@/components/EvidenceDrawer';
import { fetchDashboardSnapshot, type DashboardKPIs } from '../lib/dashboard-canonical';
import { isCompleteDashboardKPIs, type CompleteDashboardKPIs } from '../lib/dashboard-kpi-guards';

type Status = 'good' | 'watch' | 'critical';
type CommandCard = { label: string; value: string; rawValue: number; status: Status; icon: typeof WalletCards };
const formatNumber=(value:number)=>new Intl.NumberFormat('ar-YE',{maximumFractionDigits:1}).format(value);
const formatPercent=(value:number)=>`${formatNumber(value)}%`;
function getReceivableStatus(kpi:CompleteDashboardKPIs):Status{const overdueRate=kpi.totalReceivables>0?(kpi.overdueReceivables/kpi.totalReceivables)*100:0;if(kpi.totalReceivables<=0)return'good';if(overdueRate>=35)return'critical';if(overdueRate>=15)return'watch';return'good';}
function getMarginStatus(m:number):Status{return m>=20?'good':m>=10?'watch':'critical';}
function getCollectionStatus(r:number):Status{return r>=80?'good':r>=60?'watch':'critical';}
function statusLabel(s:Status){return s==='good'?'مستقر':s==='watch'?'مراقبة':'حرج';}
function statusBadgeClass(s:Status){return s==='good'?'bg-success-50 text-success-700 ring-success-100':s==='watch'?'bg-warning-50 text-warning-700 ring-warning-100':'bg-danger-50 text-danger-700 ring-danger-100';}
function statusDotClass(s:Status){return s==='good'?'bg-success-500':s==='watch'?'bg-warning-500':'bg-danger-500';}

export function ExecutiveCommandCenterPage(){
 const[months,setMonths]=useState(3);
 const[selected,setSelected]=useState(0);
 const[kpis,setKpis]=useState<DashboardKPIs|null>(null);
 const[asOf,setAsOf]=useState('غير متاح');
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState<string|null>(null);
 const[evidence,setEvidence]=useState<CommandCard|null>(null);

 useEffect(()=>{let active=true;setLoading(true);setError(null);fetchDashboardSnapshot(months).then(snapshot=>{if(!active)return;setKpis(snapshot.kpis);setAsOf(snapshot.asOf);}).catch(()=>{if(active)setError('تعذر تحميل مؤشرات مركز القيادة.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;}},[months]);

 const completeKpis=isCompleteDashboardKPIs(kpis)?kpis:null;
 const cards=useMemo<CommandCard[]>(()=>{if(!completeKpis)return[];return[
   {label:'الذمم المستحقة',rawValue:completeKpis.totalReceivables,value:formatNumber(completeKpis.totalReceivables),status:getReceivableStatus(completeKpis),icon:WalletCards},
   {label:'هامش الربح الإجمالي',rawValue:completeKpis.grossMargin,value:formatPercent(completeKpis.grossMargin),status:getMarginStatus(completeKpis.grossMargin),icon:Gauge},
   {label:'قيمة المخزون',rawValue:completeKpis.inventoryValue,value:formatNumber(completeKpis.inventoryValue),status:completeKpis.inventoryValue>0?'good':'watch',icon:Activity},
   {label:'الذمم المتأخرة',rawValue:completeKpis.overdueReceivables,value:formatNumber(completeKpis.overdueReceivables),status:getReceivableStatus(completeKpis),icon:ShieldAlert},
 ];},[completeKpis]);

 const actions=useMemo(()=>{if(!completeKpis)return[];const overdueRate=completeKpis.totalReceivables>0?(completeKpis.overdueReceivables/completeKpis.totalReceivables)*100:0;return[
   {title:overdueRate>=15?'رفع التحصيل من العملاء المتأخرين':'مواصلة متابعة التحصيل',impact:`${formatPercent(overdueRate)} من الذمم مستحقة ومتأخرة`,status:(overdueRate>=35?'critical':overdueRate>=15?'watch':'good') as Status},
   {title:completeKpis.grossMargin<15?'مراجعة هوامش الأصناف منخفضة الربحية':'مراجعة فرص تحسين الهامش',impact:`الهامش الإجمالي الحالي ${formatPercent(completeKpis.grossMargin)}`,status:(completeKpis.grossMargin<10?'critical':completeKpis.grossMargin<20?'watch':'good') as Status},
   {title:completeKpis.collectionRate<70?'تحسين دورة التحصيل':'الحفاظ على كفاءة التحصيل',impact:`معدل التحصيل ${formatPercent(completeKpis.collectionRate)}`,status:getCollectionStatus(completeKpis.collectionRate)}
 ];},[completeKpis]);

 const selectedAction=actions[selected]??actions[0];
 const evidenceStatus=kpis?.status==='CONFIRMED'?'CONFIRMED':kpis?.status==='CALCULATED'?'CALCULATED':'INSUFFICIENT_DATA';
 const evidenceData: EvidenceDrawerData|undefined=evidence && kpis ? {
   value:evidence.value,
   status:evidenceStatus,
   source:'get_dashboard_snapshot',
   period:`آخر ${months} ${months===1?'شهر':'أشهر'}`,
   asOf,
   tenant:'الشركة الحالية',
   freshness:asOf,
   nextAction:'فتح المسار التفصيلي للمؤشر',
   blockReason:kpis.status==='INSUFFICIENT_DATA'?'المصدر الحالي لم يثبت جميع عناصر المؤشر بما يكفي لعرض نتيجة مؤكدة.':undefined,
 } : undefined;

 return <div dir="rtl" className="space-y-6 animate-fade-in pb-10">
   <section className="hero-surface p-5 lg:p-6">
     <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
       <div className="min-w-0">
         <div className="flex flex-wrap items-center gap-2"><span className="badge-primary"><Sparkles size={13}/>مركز القيادة التنفيذي</span><span className="text-[10px] font-semibold text-ink-400">لقطة قرار موحّدة</span></div>
         <h1 className="mt-2 text-[24px] font-black tracking-tight text-ink-950 lg:text-[28px]">صورة العمل الآن</h1>
         <p className="mt-2 max-w-3xl text-[12px] leading-6 text-ink-500">مؤشرات الشركة الحالية في سياق واحد: ماذا يحدث، لماذا يهم، وما الذي يحتاج متابعة — مع إبقاء المصدر والفترة وحدود الدليل واضحة.</p>
       </div>
       <div className="rounded-xl border border-ink-200 bg-ink-50 p-1.5">
         <div className="mb-1 px-2 text-[10px] font-black text-ink-400">النطاق الزمني</div>
         <div className="flex items-center gap-1">
           {[[1,'شهر'],[3,'3 أشهر'],[6,'6 أشهر']].map(([value,label])=><button key={value} onClick={()=>setMonths(Number(value))} type="button" aria-pressed={months===value} className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${months===value?'bg-white text-ink-950 shadow-sm ring-1 ring-ink-200':'text-ink-500 hover:bg-white/70'}`}>{label}</button>)}
         </div>
       </div>
     </div>
   </section>

   {loading&&<div className="card p-6 text-sm text-ink-500">جارٍ تحميل المؤشرات الحقيقية…</div>}
   {error&&<div role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 p-6 text-sm text-danger-800">{error}</div>}
   {!loading&&!error&&kpis?.status==='INSUFFICIENT_DATA'&&<div className="rounded-2xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-900"><div className="font-bold">البيانات الحالية غير كافية لإصدار جميع المؤشرات بثقة.</div><div className="mt-1 text-xs leading-5">لا يتم عرض قيم افتراضية أو تحويل النقص إلى حالة نجاح.</div></div>}

   {!loading&&!error&&completeKpis&&<>
     <section>
       <div className="mb-3 flex items-end justify-between gap-3"><div><div className="section-kicker">لوحة المؤشرات</div><h2 className="mt-1 text-base font-black text-ink-950">المؤشرات التي تحدد الأولوية الآن</h2></div><div className="text-[10px] text-ink-400">حتى {asOf}</div></div>
       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
         {cards.map(card=>{const Icon=card.icon;return <article key={card.label} className="card card-hover p-4"><div className="flex items-start justify-between gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-ink-200 bg-ink-50 text-ink-600"><Icon size={18}/></div><span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${statusBadgeClass(card.status)}`}>{statusLabel(card.status)}</span></div><div className="mt-4 text-[11px] font-bold text-ink-500">{card.label}</div><div className="mt-1 flex items-center justify-between gap-3"><strong className="metric-value">{card.value}</strong><button type="button" onClick={()=>setEvidence(card)} className="icon-button h-8 w-8" aria-label={`فتح دليل ${card.label}`} title="عرض الدليل"><FileCheck2 size={14}/></button></div><div className="mt-2 text-[10px] text-ink-400">المصدر: get_dashboard_snapshot</div></article>})}
       </div>
     </section>

     <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_.8fr]">
       <div className="card p-5">
         <div className="flex items-start justify-between gap-3"><div><div className="section-kicker">Decision Engine</div><h2 className="mt-1 text-base font-black">محرك القرار</h2><p className="mt-1 text-[11px] leading-5 text-ink-400">الإجراءات مشتقة من المؤشرات الحالية وليست قيمًا تجريبية ثابتة.</p></div><BrainCircuit size={19} className="text-primary-700"/></div>
         <div className="mt-5 space-y-2.5">{actions.map((action,index)=><button key={action.title} type="button" onClick={()=>setSelected(index)} aria-pressed={selected===index} className={`w-full rounded-xl border p-4 text-right transition ${selected===index?'border-primary-300 bg-primary-50/70':'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50'}`}><div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClass(action.status)}`} aria-hidden="true"/><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink-900">{action.title}</span><span className="mt-1 block text-[11px] text-ink-500">{action.impact}</span></span><ChevronLeft size={16} className="shrink-0 text-ink-300"/></div></button>)}</div>
       </div>
       <div className="card p-5">
         <div className="flex items-center gap-2"><CircleAlert size={18} className="text-primary-700"/><h2 className="text-base font-black">التفسير والسياق</h2></div>
         <div className="mt-5 rounded-xl border border-ink-100 bg-ink-50/70 p-4"><div className="text-[10px] font-black text-ink-400">الأولوية المحددة</div><div className="mt-1 text-sm font-black text-ink-900">{selectedAction?.title??'لا توجد توصية متاحة حاليًا.'}</div></div>
         <div className="mt-3 rounded-xl border border-ink-100 bg-white p-4"><div className="text-[10px] font-black text-ink-400">الأثر / المؤشر المرتبط</div><div className="mt-1 text-sm font-bold text-ink-800">{selectedAction?.impact??'لا توجد بيانات كافية'}</div></div>
         <div className="mt-4 flex items-center gap-2 text-[10px] text-ink-400"><span className="status-dot text-primary-600"/><span>الدليل والسياق متاحان من زر الدليل في بطاقة المؤشر.</span></div>
       </div>
     </section>

     <section className="card p-5">
       <div className="flex items-center justify-between gap-3"><div><div className="section-kicker">Attention</div><h2 className="mt-1 text-base font-black">مراقبة التنبيهات الذكية</h2></div><Bell size={18} className="text-ink-500"/></div>
       <div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-xl border border-danger-100 bg-danger-50/60 p-4"><div className="text-[10px] font-black text-danger-700">الذمم المتأخرة</div><div className="mt-1 text-lg font-black tabular-nums text-ink-900">{formatNumber(completeKpis.overdueReceivables)}</div></div><div className="rounded-xl border border-warning-100 bg-warning-50/60 p-4"><div className="text-[10px] font-black text-warning-800">الهامش الإجمالي</div><div className="mt-1 text-lg font-black tabular-nums text-ink-900">{formatPercent(completeKpis.grossMargin)}</div></div><div className="rounded-xl border border-success-100 bg-success-50/60 p-4"><div className="text-[10px] font-black text-success-700">معدل التحصيل</div><div className="mt-1 text-lg font-black tabular-nums text-ink-900">{formatPercent(completeKpis.collectionRate)}</div></div></div>
     </section>
   </>}

   {evidence && evidenceData && <EvidenceDrawer open={Boolean(evidence)} onClose={()=>setEvidence(null)} title={evidence.label} data={evidenceData}/>}
 </div>;
}
