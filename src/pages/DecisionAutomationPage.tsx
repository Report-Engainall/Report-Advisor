import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, PlayCircle, ShieldCheck, XCircle, Zap } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState } from '@/components/ui/States';
import { supabase, COMPANY_ID } from '@/lib/supabase';

type Action = { id:string; action_type:string; status:string; priority:string; title:string; rationale:string; payload:Record<string,unknown>; created_at:string };
const priorityTone: Record<string,'danger'|'warning'|'success'|'default'> = { critical:'danger', high:'warning', medium:'default', low:'success' };

export function DecisionAutomationPage() {
  const [items,setItems]=useState<Action[]>([]); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState<string|null>(null); const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{ if(!COMPANY_ID||COMPANY_ID.startsWith('00000000')){setItems([]);setLoading(false);return;} setLoading(true); const {data,error:e}=await supabase.from('automation_actions').select('id,action_type,status,priority,title,rationale,payload,created_at').eq('company_id',COMPANY_ID).order('created_at',{ascending:false}).limit(100); if(e)setError(e.message);else setItems((data??[]) as Action[]);setLoading(false);},[]);
  useEffect(()=>{load()},[load]);
  const setStatus=async(id:string,status:string)=>{setBusy(id);setError(null);const {error:e}=await supabase.from('automation_actions').update({status,approved_at:status==='approved'?new Date().toISOString():undefined}).eq('id',id).eq('company_id',COMPANY_ID);if(e)setError(e.message);else await load();setBusy(null)};
  if(loading)return <LoadingState/>;
  return <div className="space-y-6" dir="rtl"><PageHeader title="مركز التنفيذ الذكي" subtitle="توصيات قابلة للمراجعة والتحويل إلى إجراءات، مع سجل تفسير وموافقة قبل الآثار الخارجية." />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardBody><div className="flex items-center gap-3"><Zap className="text-primary-600"/><div><div className="text-xs text-ink-500">إجراءات مقترحة</div><div className="text-2xl font-bold">{items.filter(x=>x.status==='proposed').length}</div></div></div></CardBody></Card><Card><CardBody><div className="flex items-center gap-3"><Clock3 className="text-warning-600"/><div><div className="text-xs text-ink-500">قيد التنفيذ</div><div className="text-2xl font-bold">{items.filter(x=>x.status==='running').length}</div></div></div></CardBody></Card><Card><CardBody><div className="flex items-center gap-3"><ShieldCheck className="text-success-600"/><div><div className="text-xs text-ink-500">مكتملة</div><div className="text-2xl font-bold">{items.filter(x=>x.status==='completed').length}</div></div></div></CardBody></Card></div>
    {error&&<div className="rounded-xl bg-danger-50 border border-danger-200 text-danger-700 p-3 text-sm">{error}</div>}
    <Card><CardHeader title="طابور القرارات"/><CardBody className="space-y-3">{items.map(item=><div key={item.id} className="border border-ink-100 rounded-2xl p-4 hover:border-primary-200 transition"><div className="flex flex-wrap items-center gap-2"><Badge variant={priorityTone[item.priority]??'default'}>{item.priority}</Badge><Badge variant="default">{item.status}</Badge><span className="font-semibold text-ink-800">{item.title}</span></div><p className="text-sm text-ink-600 mt-2">{item.rationale}</p><div className="mt-3 flex gap-2">{item.status==='proposed'&&<><button disabled={busy===item.id} onClick={()=>setStatus(item.id,'approved')} className="btn-primary text-xs"><CheckCircle2 size={14}/> موافقة</button><button disabled={busy===item.id} onClick={()=>setStatus(item.id,'rejected')} className="btn-secondary text-xs"><XCircle size={14}/> رفض</button></>}{item.status==='approved'&&<button disabled={busy===item.id} onClick={()=>setStatus(item.id,'running')} className="btn-primary text-xs"><PlayCircle size={14}/> بدء التنفيذ</button>}</div></div>)}{!items.length&&<div className="text-center py-12 text-ink-400">لا توجد إجراءات ذكية بانتظار المراجعة.</div>}</CardBody></Card>
  </div>;
}
