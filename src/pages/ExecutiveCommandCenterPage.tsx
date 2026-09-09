import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, BrainCircuit, ChevronLeft, CircleAlert, Gauge, ShieldAlert, Sparkles, WalletCards } from 'lucide-react';
import { fetchDashboardSnapshot, type DashboardKPIs } from '../lib/dashboard-canonical';
import { isCompleteDashboardKPIs, type CompleteDashboardKPIs } from '../lib/dashboard-kpi-guards';

type Status = 'good' | 'watch' | 'critical';
type CommandCard = { label: string; value: string; status: Status; icon: typeof WalletCards; note: string };
const formatNumber=(value:number)=>new Intl.NumberFormat('ar-YE',{maximumFractionDigits:1}).format(value);
const formatPercent=(value:number)=>`${formatNumber(value)}%`;
function getReceivableStatus(kpi:CompleteDashboardKPIs):Status{const overdueRate=kpi.totalReceivables>0?(kpi.overdueReceivables/kpi.totalReceivables)*100:0;if(kpi.totalReceivables<=0)return'good';if(overdueRate>=35)return'critical';if(overdueRate>=15)return'watch';return'good';}
function getMarginStatus(m:number):Status{return m>=20?'good':m>=10?'watch':'critical';}
function getCollectionStatus(r:number):Status{return r>=80?'good':r>=60?'watch':'critical';}
function statusLabel(s:Status){return s==='good'?'مستقر':s==='watch'?'يحتاج متابعة':'أولوية حرجة';}
function statusClass(s:Status){return s==='good'?'bg-emerald-50 text-emerald-700 ring-emerald-100':s==='watch'?'bg-amber-50 text-amber-700 ring-amber-100':'bg-rose-50 text-rose-700 ring-rose-100';}

export function ExecutiveCommandCenterPage(){
 const[months,setMonths]=useState(3);const[selected,setSelected]=useState(0);const[kpis,setKpis]=useState<DashboardKPIs|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState<string|null>(null);
 useEffect(()=>{let active=true;setLoading(true);setError(null);fetchDashboardSnapshot(months).then(snapshot=>{if(active)setKpis(snapshot.kpis);}).catch(()=>{if(active)setError('تعذر تحميل مؤشرات مركز القيادة.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;}},[months]);
 const completeKpis=isCompleteDashboardKPIs(kpis)?kpis:null;
 const cards=useMemo<CommandCard[]>(()=>{if(!completeKpis)return[];return[
  {label:'الذمم المستحقة',value:formatNumber(completeKpis.totalReceivables),status:getReceivableStatus(completeKpis),icon:WalletCards,note:'إجمالي الرصيد المستحق'},
  {label:'هامش الربح الإجمالي',value:formatPercent(completeKpis.grossMargin),status:getMarginStatus(completeKpis.grossMargin),icon:Gauge,note:'قبل المصروفات التشغيلية'},
  {label:'قيمة المخزون',value:formatNumber(completeKpis.inventoryValue),status:completeKpis.inventoryValue>0?'good':'watch',icon:Activity,note:'القيمة الحالية للمخزون'},
  {label:'الذمم المتأخرة',value:formatNumber(completeKpis.overdueReceivables),status:getReceivableStatus(completeKpis),icon:ShieldAlert,note:'يتطلب متابعة التحصيل'}
 ];},[completeKpis]);
 const actions=useMemo(()=>{if(!completeKpis)return[];const overdueRate=completeKpis.totalReceivables>0?(completeKpis.overdueReceivables/completeKpis.totalReceivables)*100:0;return[
  {title:overdueRate>=15?'رفع التحصيل من العملاء المتأخرين':'مواصلة متابعة التحصيل',impact:`${formatPercent(overdueRate)} من الذمم متأخرة`,status:(overdueRate>=35?'critical':overdueRate>=15?'watch':'good') as Status},
  {title:completeKpis.grossMargin<15?'مراجعة هوامش الأصناف منخفضة الربحية':'مراجعة فرص تحسين الهامش',impact:`الهامش الإجمالي الحالي ${formatPercent(completeKpis.grossMargin)}`,status:(completeKpis.grossMargin<10?'critical':completeKpis.grossMargin<20?'watch':'good') as Status},
  {title:completeKpis.collectionRate<70?'تحسين دورة التحصيل':'الحفاظ على كفاءة التحصيل',impact:`معدل التحصيل ${formatPercent(completeKpis.collectionRate)}`,status:getCollectionStatus(completeKpis.collectionRate)}
 ];},[completeKpis]);
 const selectedAction=actions[selected]??actions[0];
 return <div dir="rtl" className="page-glow relative mx-auto w-full max-w-[1600px] space-y-7 pb-10">
  <section className="experience-hero min-h-[290px] lg:min-h-[330px]">
   <div className="relative z-10 flex h-full flex-col justify-between gap-10">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
     <div className="max-w-3xl">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-100 backdrop-blur"><Sparkles size={15}/> غرفة التحكم التنفيذية</div>
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">صورة العمل <span className="text-amber-300">الآن</span></h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/80 sm:text-base">لوحة قيادة واحدة تجمع المؤشرات المعتمدة مع الأولويات التي تستحق قرارًا. لا توجد قيم افتراضية؛ ما تراه هنا يأتي من المصدر الحالي.</p>
     </div>
     <div className="rounded-2xl border border-white/10 bg-black/10 p-1.5 backdrop-blur-md">
      <div className="px-3 pb-2 pt-1 text-[10px] font-bold text-emerald-100/60">النطاق الزمني</div>
      <div className="flex gap-1">{[[1,'شهر'],[3,'3 أشهر'],[6,'6 أشهر']].map(([value,label])=><button key={value} onClick={()=>setMonths(Number(value))} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${months===value?'bg-white text-emerald-900 shadow-lg':'text-white/70 hover:bg-white/10 hover:text-white'}`}>{label}</button>)}</div>
     </div>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
     {completeKpis&&cards.map(card=>{const Icon=card.icon;return <div key={card.label} className="experience-kpi group"><div className="flex items-center justify-between gap-2"><div className="rounded-xl bg-white/10 p-2 text-emerald-100 transition-transform group-hover:scale-110"><Icon size={19}/></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusClass(card.status)}`}>{statusLabel(card.status)}</span></div><div className="mt-4 text-xs text-white/60">{card.label}</div><div className="mt-1 text-2xl font-black tabular-nums sm:text-3xl">{card.value}</div><div className="mt-1 text-[10px] text-white/45">{card.note}</div></div>})}
    </div>
   </div>
  </section>
  {loading&&<div className="experience-section flex items-center gap-3 text-sm text-ink-500"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500"/> جارٍ تحميل المؤشرات الحقيقية…</div>}
  {error&&<div role="alert" className="experience-section border-rose-200 bg-rose-50 text-sm text-rose-700"><div className="flex items-center gap-2 font-bold"><CircleAlert size={18}/> تعذر الوصول إلى لوحة القيادة</div><p className="mt-2">{error}</p></div>}
  {!loading&&!error&&kpis?.status==='INSUFFICIENT_DATA'&&<div className="experience-section border-amber-200 bg-amber-50 text-sm text-amber-800"><div className="flex items-center gap-2 font-bold"><CircleAlert size={18}/> البيانات تحتاج إلى استكمال</div><p className="mt-2">البيانات الحالية غير كافية لإصدار جميع المؤشرات بثقة، لذلك لا يتم عرض قيم افتراضية.</p></div>}
  {!loading&&!error&&completeKpis&&<>
   <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_.85fr]">
    <div className="experience-section min-h-[390px]">
     <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-emerald-700"><BrainCircuit size={16}/> Decision Engine</div><h2 className="experience-section-title text-2xl sm:text-3xl">محرك القرار</h2><p className="experience-section-subtitle mt-1">حوّل الأرقام إلى ثلاث أولويات قابلة للتنفيذ، دون اختلاق توصيات خارج البيانات.</p></div><span className="experience-chip">{actions.length} أولويات نشطة</span></div>
     <div className="mt-7 space-y-3">{actions.map((action,index)=><button key={action.title} onClick={()=>setSelected(index)} className={`group w-full rounded-2xl border p-4 text-right transition-all sm:p-5 ${selected===index?'border-emerald-300 bg-gradient-to-l from-emerald-50 to-amber-50/40 shadow-md':'border-ink-100 bg-white hover:border-emerald-200 hover:shadow-sm'}`}><div className="flex items-center gap-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.status==='critical'?'bg-rose-100 text-rose-700':action.status==='watch'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}><span className="h-2.5 w-2.5 rounded-full bg-current"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-ink-900">{action.title}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${statusClass(action.status)}`}>{statusLabel(action.status)}</span></div><p className="mt-1 text-xs text-ink-500">{action.impact}</p></div><ChevronLeft size={18} className="text-ink-300 transition-transform group-hover:-translate-x-1"/></div></button>)}</div>
    </div>
    <div className="experience-section min-h-[390px] bg-gradient-to-br from-white to-emerald-50/50"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-950 p-2.5 text-emerald-200"><CircleAlert size={20}/></div><div><h2 className="experience-section-title">التفسير والأدلة</h2><p className="text-xs text-ink-500">لماذا هذه الأولوية؟</p></div></div><div className="mt-8 rounded-2xl bg-emerald-950 p-5 text-white shadow-elevated"><div className="text-xs font-bold text-emerald-300">الأولوية المحددة</div><div className="mt-3 text-xl font-black leading-9">{selectedAction?.title??'لا توجد توصية متاحة حاليًا.'}</div><div className="mt-5 h-px bg-white/10"/><div className="mt-4 text-xs text-emerald-200/60">المؤشر المرتبط</div><div className="mt-1 font-bold text-emerald-50">{selectedAction?.impact??'لا توجد بيانات كافية'}</div></div><div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm leading-7 text-amber-900">التوصية هنا تفسير تشغيلي للمؤشرات الحالية. قبل التنفيذ، راجع التفاصيل والأدلة المرتبطة بها في تجربة القرار.</div></div>
   </section>
   <section className="experience-section"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-100 p-2.5 text-amber-700"><Bell size={19}/></div><div><h2 className="experience-section-title">رادار التنبيهات</h2><p className="experience-section-subtitle">إشارات تشغيلية سريعة من نفس المؤشرات.</p></div></div><span className="experience-chip">مراقبة مباشرة</span></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5"><div className="text-xs font-bold text-rose-600">تحصيل</div><div className="mt-2 text-2xl font-black text-rose-950">{formatNumber(completeKpis.overdueReceivables)}</div><p className="mt-1 text-xs text-rose-700/70">الذمم المتأخرة</p></div><div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5"><div className="text-xs font-bold text-amber-700">ربحية</div><div className="mt-2 text-2xl font-black text-amber-950">{formatPercent(completeKpis.grossMargin)}</div><p className="mt-1 text-xs text-amber-800/70">الهامش الإجمالي</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5"><div className="text-xs font-bold text-emerald-700">كفاءة</div><div className="mt-2 text-2xl font-black text-emerald-950">{formatPercent(completeKpis.collectionRate)}</div><p className="mt-1 text-xs text-emerald-800/70">معدل التحصيل</p></div></div></section>
  </>}
 </div>;
}
