import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownLeft, ArrowUpLeft, CalendarClock, CheckCircle2, RefreshCw, WalletCards, Zap } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { fetchFinanceSnapshot } from '@/lib/queries';
import type { FinanceSnapshot } from '@/lib/queries';
import { formatCurrency, formatNumber } from '@/lib/format';

function daysUntil(date: string | null) { if (!date) return null; return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000); }

export function FinanceIntelligencePage() {
 const [data,setData]=useState<FinanceSnapshot|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
 const load=async()=>{try{setLoading(true);setError(null);setData(await fetchFinanceSnapshot());}catch(e:any){setError(e?.message||'تعذر تحميل السيولة');}finally{setLoading(false);}};
 useEffect(()=>{load();},[]);
 const metrics=useMemo(()=>{
  if(!data)return null;
  const receivable=data.sales.reduce((s,i)=>s+Number(i.total)-Number(i.paid_amount),0);
  const payable=data.purchases.reduce((s,i)=>s+Number(i.total)-Number(i.paid_amount),0);
  const overdueReceivable=data.sales.filter(i=>i.due_date&&new Date(i.due_date)<new Date()&&Number(i.total)>Number(i.paid_amount)).reduce((s,i)=>s+Number(i.total)-Number(i.paid_amount),0);
  const overduePayable=data.purchases.filter(i=>i.due_date&&new Date(i.due_date)<new Date()&&Number(i.total)>Number(i.paid_amount)).reduce((s,i)=>s+Number(i.total)-Number(i.paid_amount),0);
  const incoming=data.payments.filter(p=>String(p.direction).toLowerCase().includes('in')).reduce((s,p)=>s+Number(p.amount),0);
  const outgoing=data.payments.filter(p=>String(p.direction).toLowerCase().includes('out')).reduce((s,p)=>s+Number(p.amount),0);
  const net=incoming-outgoing; const pressure=payable>receivable+Math.max(net,0);
  const obligations=[...data.sales.filter(i=>Number(i.total)>Number(i.paid_amount)).map(i=>({id:i.id,type:'تحصيل',date:i.due_date,amount:Number(i.total)-Number(i.paid_amount),label:`عميل · ${i.invoice_number}`})),...data.purchases.filter(i=>Number(i.total)>Number(i.paid_amount)).map(i=>({id:i.id,type:'سداد',date:i.due_date,amount:Number(i.total)-Number(i.paid_amount),label:`مورد · ${i.invoice_number}`}))].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
  return{receivable,payable,overdueReceivable,overduePayable,incoming,outgoing,net,pressure,obligations};
 },[data]);
 if(loading)return <LoadingState/>; if(error)return <ErrorState message={error} onRetry={load}/>; if(!metrics)return null;
 const riskDays=metrics.pressure?metrics.obligations.filter(o=>o.type==='سداد'&&daysUntil(o.date)<=30).length:0;
 return <div className="space-y-6 animate-fade-in">
  <PageHeader title="غرفة السيولة والالتزامات" subtitle="رؤية نقدية تربط التحصيل بالسداد والضغط القادم" action={<button onClick={load} className="btn-secondary text-xs"><RefreshCw size={14}/> تحديث</button>}/>
  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3"><Kpi icon={<ArrowDownLeft size={18}/>} label="ذمم مدينة" value={formatCurrency(metrics.receivable)}/><Kpi icon={<ArrowUpLeft size={18}/>} label="التزامات الموردين" value={formatCurrency(metrics.payable)} danger={metrics.payable>metrics.receivable}/><Kpi icon={<WalletCards size={18}/>} label="صافي المدفوعات" value={formatCurrency(metrics.net)}/><Kpi icon={<AlertTriangle size={18}/>} label="متأخر تحصيل" value={formatCurrency(metrics.overdueReceivable)} danger={metrics.overdueReceivable>0}/><Kpi icon={<CalendarClock size={18}/>} label="استحقاقات 30 يوم" value={formatNumber(riskDays)}/></div>
  <Card className={metrics.pressure?'border-danger-200 bg-danger-50/40':'border-success-200 bg-success-50/40'}><CardBody><div className="flex items-start gap-3"><div className={metrics.pressure?'text-danger-600':'text-success-600'}><Zap size={20}/></div><div><div className="font-semibold text-sm">{metrics.pressure?'ضغط سيولة محتمل':'وضع السيولة تحت المراقبة'}</div><p className="text-xs text-ink-600 mt-1">{metrics.pressure?'الالتزامات الحالية أعلى من قدرة الذمم والتحصيلات الظاهرة؛ ارفع أولوية التحصيل وجدولة الموردين قبل الاستحقاقات.':'لا يظهر ضغط حاد من البيانات الحالية. راقب المواعيد والتحصيلات القادمة باستمرار.'}</p></div></div></CardBody></Card>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Card><CardHeader title="من نتحصل منه؟" subtitle="الذمم المفتوحة حسب أقرب استحقاق"/><CardBody><ObligationList rows={metrics.obligations.filter(o=>o.type==='تحصيل').slice(0,8)} kind="in"/></CardBody></Card><Card><CardHeader title="لمن نسدد؟" subtitle="الالتزامات المفتوحة حسب أقرب استحقاق"/><CardBody><ObligationList rows={metrics.obligations.filter(o=>o.type==='سداد').slice(0,8)} kind="out"/></CardBody></Card></div>
  <Card><CardHeader title="خطة السيولة الأولية" subtitle="توصيات حسابية قابلة للمراجعة قبل اعتماد أي إجراء مالي"/><CardBody><div className="grid md:grid-cols-3 gap-3"><Plan title="1. التحصيل" text={metrics.overdueReceivable>0?`ابدأ بالذمم المتأخرة بقيمة ${formatCurrency(metrics.overdueReceivable)} قبل الالتزامات غير الحرجة.`:'ركز على أقرب الذمم استحقاقاً للحفاظ على التدفق النقدي.'}/><Plan title="2. السداد" text={metrics.overduePayable>0?`رتب ${formatCurrency(metrics.overduePayable)} من الالتزامات المتأخرة حسب الأهمية والعقود.`:'رتب الموردين حسب موعد الاستحقاق والأثر التشغيلي.'}/><Plan title="3. الحماية" text="لا تعتمد أي خطة دفع كبيرة دون احتساب الرصيد النقدي الفعلي والتحصيل المتوقع والحد الأدنى التشغيلي."/></div></CardBody></Card>
 </div>;
}
function Kpi({icon,label,value,danger=false}:{icon:React.ReactNode;label:string;value:string;danger?:boolean}){return <Card><CardBody><div className="flex items-center gap-2 text-ink-400">{icon}<span className="text-[11px]">{label}</span></div><div className={`mt-2 text-xl font-bold ${danger?'text-danger-600':'text-ink-900'}`}>{value}</div></CardBody></Card>}
function ObligationList({rows,kind}:{rows:{id:string;type:string;date:string|null;amount:number;label:string}[];kind:'in'|'out'}){return <div className="space-y-2">{rows.map(r=>{const d=daysUntil(r.date);return <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-ink-50/60"><div className={kind==='in'?'text-success-600':'text-danger-600'}>{kind==='in'?<ArrowDownLeft size={16}/>:<ArrowUpLeft size={16}/>}</div><div className="flex-1 min-w-0"><div className="text-xs font-medium truncate">{r.label}</div><div className="text-[10px] text-ink-400">{r.date||'بدون تاريخ'} · {d===null?'—':d<0?`متأخر ${Math.abs(d)} يوم`:`خلال ${d} يوم`}</div></div><div className="text-xs font-bold">{formatCurrency(r.amount)}</div></div>})}{!rows.length&&<div className="text-xs text-ink-400 text-center py-5">لا توجد التزامات.</div>}</div>}
function Plan({title,text}:{title:string;text:string}){return <div className="rounded-xl border border-ink-100 p-4"><div className="flex gap-2 items-center text-sm font-semibold"><CheckCircle2 size={15} className="text-primary-600"/>{title}</div><p className="text-xs text-ink-500 mt-2 leading-5">{text}</p></div>}
