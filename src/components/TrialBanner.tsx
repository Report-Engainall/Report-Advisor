import { useEffect, useState } from 'react';
import { Clock3, Sparkles, ArrowUpRight } from 'lucide-react';
import { supabase, COMPANY_ID } from '@/lib/supabase';
import { trialRemainingDays, type ProductPlan } from '@/lib/entitlements';

export function TrialBanner() {
  const [state,setState]=useState<{plan:ProductPlan;status:string;ends?:string}|null>(null);
  useEffect(()=>{let alive=true;(async()=>{if(!COMPANY_ID||COMPANY_ID.startsWith('00000000'))return;const{data,error}=await supabase.rpc('refresh_trial_status',{p_company_id:COMPANY_ID});if(!error&&data&&alive)setState({plan:data.plan as ProductPlan,status:data.status,ends:data.trial_ends_at})})();return()=>{alive=false}},[]);
  if(!state||state.plan!=='trial')return null;
  const days=trialRemainingDays(state.ends);
  const expired=state.status==='expired'||days===0;
  return <div className={`mx-4 mt-4 lg:mx-6 rounded-2xl border px-4 py-3 flex flex-wrap items-center gap-3 ${expired?'border-warning-200 bg-warning-50':'border-primary-200 bg-primary-50'}`} dir="rtl"><div className={`w-9 h-9 rounded-xl flex items-center justify-center ${expired?'bg-warning-100 text-warning-700':'bg-primary-100 text-primary-700'}`}>{expired?<Clock3 size={18}/>:<Sparkles size={18}/>}</div><div className="flex-1 min-w-[220px]"><div className="text-sm font-semibold text-ink-800">{expired?'انتهت الفترة التجريبية':'أنت تستخدم النسخة التجريبية الكاملة'}</div><div className="text-xs text-ink-500 mt-0.5">{expired?'بياناتك محفوظة. فعّل الخطة لاستعادة التحليلات المتقدمة والتنبؤ والأتمتة.':`متبقي ${days} ${days===1?'يوم':'أيام'} — جميع قدرات التحليل الأساسية متاحة خلال التجربة.`}</div></div><button className="btn-primary text-xs px-3 py-2"><ArrowUpRight size={14}/> عرض الخطط</button></div>;
}
