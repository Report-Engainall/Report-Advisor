import { ArrowUpLeft, Banknote, Boxes, CircleGauge, Percent, TrendingUp, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { CommercialSignal, CommercialSignalKind } from '@/lib/commercial-opportunity-radar';

const iconByKind:Record<CommercialSignalKind,typeof TrendingUp>={cash:Banknote,concentration:UsersRound,momentum:TrendingUp,margin:Percent,inventory:Boxes};
const toneByPriority=(priority:CommercialSignal['priority']):'danger'|'warning'|'primary'=>priority>=5?'danger':priority>=4?'warning':'primary';
const priorityLabel=(priority:CommercialSignal['priority'])=>priority>=5?'تدخل يستحق الفحص':priority>=4?'أولوية تحليل':'إشارة متابعة';

export function CommercialOpportunityRadar({signals}:{signals:CommercialSignal[]}){
  return <Card className="overflow-hidden">
    <CardHeader title="الرادار التجاري" subtitle="من الرقم إلى فرصة الفحص: أقوى الإشارات المدعومة باللقطة الحالية، بلا اختلاق لنتيجة غير موجودة." action={<CircleGauge size={20} className="text-primary-600"/>}/>
    <CardBody>
      {!signals.length?<div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/60 p-6 text-center"><div className="text-sm font-black text-ink-800">لا توجد إشارة تجارية مدعومة حاليًا</div><p className="mt-1 text-xs leading-6 text-ink-500">عند اكتمال المدخلات الكانونية سيظهر هنا التحصيل، التركّز، الزخم، الهامش أو رأس المال المخزون.</p></div>:
      <div className="grid gap-3 lg:grid-cols-2">{signals.map(signal=>{const Icon=iconByKind[signal.kind];return <article key={signal.id} className="rounded-2xl border border-ink-200 bg-white p-4 transition hover:-translate-y-px hover:border-primary-200 hover:shadow-card-hover">
        <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700"><Icon size={18}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge variant={toneByPriority(signal.priority)}>{priorityLabel(signal.priority)}</Badge><span className="text-[10px] font-bold text-ink-400">{signal.source}</span></div><h3 className="mt-2 text-sm font-black text-ink-900">{signal.title}</h3><p className="mt-1 text-xs leading-6 text-ink-500">{signal.detail}</p></div></div>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-3 rounded-xl bg-ink-50 p-3"><div><div className="text-[10px] font-bold text-ink-400">{signal.metricLabel}</div><div className="mt-1 text-lg font-black tabular-nums text-ink-950">{signal.metricValue}</div></div><div className="text-left text-[10px] leading-5 text-ink-500"><div>دليل اللقطة</div><div>{signal.evidence[0]}</div><div>{signal.evidence[1]||''}</div></div></div>
        <div className="mt-3 flex items-center justify-between gap-3"><span className="text-[10px] text-ink-400">لا تتحول الإشارة إلى قرار تلقائي.</span><Link to={signal.actionPath} className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-[11px] font-black text-ink-700 hover:border-primary-300 hover:text-primary-700">{signal.actionLabel}<ArrowUpLeft size={13}/></Link></div>
      </article>})}</div>}
    </CardBody>
  </Card>;
}
