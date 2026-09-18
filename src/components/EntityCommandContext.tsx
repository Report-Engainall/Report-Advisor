import { ArrowUpLeft, CircleHelp, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import type { DashboardKPIs, TopEntity } from '@/lib/dashboard-canonical';
import { formatCurrency } from '@/lib/format';

type EntityKind='customer'|'product';
export function EntityCommandContext({ kind, entity, kpis, rank }: { kind: EntityKind; entity: TopEntity|null; kpis: DashboardKPIs|null; rank: number|null }){
  if(!entity) return <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/70 p-4 text-xs text-ink-500"><div className="flex items-center gap-2 font-bold text-ink-700"><CircleHelp size={15}/> السياق التجاري المرئي</div><p className="mt-1 leading-5">هذا السجل ليس ضمن أعلى النتائج المرئية في اللقطة الحالية؛ لا يتم اعتباره صفرًا ولا نستنتج عدم النشاط.</p></div>;
  const share=kpis?.totalSales!=null&&kpis.totalSales>0?entity.value/kpis.totalSales*100:null;
  const source=kind==='customer'?'topCustomers من get_dashboard_snapshot':'topProducts من get_dashboard_snapshot';
  const actionPath=kind==='customer'?'/reports/receivables':'/reports/profitability';
  const actionLabel=kind==='customer'?'تحقيق التحصيل':'تحقيق الربحية';
  return <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-[10px] font-black tracking-[0.12em] text-primary-700"><ShieldCheck size={14}/> ENTITY COMMAND CONTEXT</div><h3 className="mt-1 text-base font-black text-ink-950">{entity.name}</h3><p className="mt-1 text-[10px] text-primary-800">السياق مبني على اللقطة التنفيذية، وليس على استنتاج من السجل وحده.</p></div><Badge variant="primary">{kind==='customer'?'عميل':'منتج'}</Badge></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-xl border border-white bg-white p-3"><div className="text-[10px] text-ink-400">القيمة في الفترة</div><div className="mt-1 text-lg font-black text-ink-950">{formatCurrency(entity.value)}</div></div><div className="rounded-xl border border-white bg-white p-3"><div className="text-[10px] text-ink-400">حصة من مبيعات الفترة</div><div className="mt-1 text-lg font-black text-ink-950">{share==null?'غير متاح':share.toFixed(1)+'%'}</div></div><div className="rounded-xl border border-white bg-white p-3"><div className="text-[10px] text-ink-400">الترتيب المرئي</div><div className="mt-1 text-lg font-black text-ink-950">{rank==null?'غير ظاهر':'#'+rank}</div></div></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-[10px] leading-5 text-ink-500">المصدر: {source} · القيمة لا تعني رصيدًا أو ربحًا مستحقًا بذاته.</span><Link to={actionPath} className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-white px-3 py-1.5 text-[11px] font-black text-primary-700 hover:bg-primary-50">{actionLabel}<ArrowUpLeft size={13}/></Link></div>
  </div>;
}
