import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpLeft, CheckCircle2, Lightbulb, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import { buildDecisions, decisionStatus, type DecisionSignal } from '@/lib/decisionEngine';

const demoSignals: DecisionSignal[] = [
  { key: 'stock_coverage_days', label: 'تغطية المخزون', value: 2.4, unit: ' يوم', source: 'Inventory' },
  { key: 'liquidity_coverage_ratio', label: 'نسبة تغطية السيولة', value: 0.78, unit: 'x', source: 'Cash Flow' },
  { key: 'sales_change_percent', label: 'تغير المبيعات', value: -23, unit: '%', source: 'Sales' },
];

export function DecisionCenterPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const decisions = useMemo(() => buildDecisions(demoSignals), []);
  return <div className="space-y-6" dir="rtl">
    <header><div className="flex items-center gap-2 text-primary-600 text-sm font-medium"><Lightbulb size={16}/> Decision Intelligence</div><h1 className="mt-1 text-3xl font-bold text-ink-950">مركز القرار</h1><p className="mt-2 text-sm text-ink-500">تحويل إشارات الأعمال إلى إجراءات واضحة، مع إظهار سبب التوصية ومصدرها ودرجة الثقة.</p></header>
    <div className="grid gap-4 md:grid-cols-3">{demoSignals.map(s=><div key={s.key} className="rounded-2xl border border-ink-200 bg-white p-5"><p className="text-xs text-ink-500">{s.label}</p><div className="mt-2 text-2xl font-bold text-ink-950">{s.value}{s.unit}</div><p className="mt-1 text-xs text-ink-400">المصدر: {s.source}</p></div>)}</div>
    <section className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold text-ink-950">الأولوية الآن</h2><p className="mt-1 text-xs text-ink-500">توصيات مولدة من قواعد أعمال قابلة للتتبع، وليست إجابات لغوية غير موثقة.</p></div><SlidersHorizontal size={18} className="text-ink-400"/></div><div className="mt-4 space-y-3">{decisions.map(d=><button key={d.id} onClick={()=>setSelected(d.id)} className="w-full rounded-xl border border-ink-100 p-4 text-right hover:border-primary-300 hover:bg-primary-50/30"><div className="flex items-start gap-3"><div className={`mt-0.5 rounded-lg p-2 ${d.severity==='critical'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-600'}`}>{d.severity==='critical'?<ShieldAlert size={18}/>:<AlertTriangle size={18}/>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-ink-900">{d.title}</h3><span className="text-xs text-ink-500">ثقة {Math.round(d.confidence*100)}%</span></div><p className="mt-1 text-sm text-ink-600">{d.reason}</p><div className="mt-2 flex items-center gap-2 text-xs font-medium text-primary-700">{decisionStatus(d.confidence)} <ArrowUpLeft size={14}/></div></div></div></button>)}</div></section>
    {selected && <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5"><div className="flex items-center gap-2 font-semibold text-primary-900"><CheckCircle2 size={18}/> تم اختيار التوصية: {decisions.find(d=>d.id===selected)?.title}</div><p className="mt-2 text-sm text-primary-800">في المرحلة التالية سيتم ربط هذا المحرك مباشرة ببيانات Supabase الحية وسجل القرارات والتنبيهات بدل الإشارات التجريبية.</p></div>}
  </div>;
}
