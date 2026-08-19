import { useMemo, useState } from 'react';
import { CheckCircle2, Database, Info, Search, ShieldCheck } from 'lucide-react';
import { BUSINESS_METRICS, type MetricDefinition } from '@/lib/semanticMetrics';

function StatusBadge({ status }: { status: MetricDefinition['status'] }) {
  const labels: Record<MetricDefinition['status'], string> = { CONFIRMED: 'مؤكد', CALCULATED: 'محسوب', ESTIMATED: 'تقديري', FORECAST: 'تنبؤ', INSUFFICIENT_DATA: 'بيانات غير كافية', UNAVAILABLE: 'غير متوفر' };
  return <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700"><CheckCircle2 size={13} />{labels[status]}</span>;
}

export function SemanticMetricsPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<MetricDefinition | null>(null);
  const metrics = useMemo(() => BUSINESS_METRICS.filter(m => `${m.label} ${m.key} ${m.description}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="space-y-6" dir="rtl">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-medium text-primary-600">قاموس الأعمال</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink-950">مقاييس الأعمال الموحّدة</h1><p className="mt-2 max-w-3xl text-sm text-ink-500">مصدر موحّد لتعريف المقاييس التي تستخدمها لوحات المعلومات والتقارير والذكاء الاصطناعي، مع إظهار طريقة الحساب ومصدر البيانات.</p></div>
      <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-600"><ShieldCheck size={17} className="text-emerald-600" /> النتائج قابلة للتتبع</div>
    </div>
    <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث عن مقياس أو تعريف..." className="w-full rounded-xl border border-ink-200 bg-white py-3 pr-10 pl-4 outline-none focus:border-primary-500"/></div>
    <div className="grid gap-4 lg:grid-cols-2">
      {metrics.map(metric => <button key={metric.key} onClick={() => setSelected(metric)} className="text-right rounded-2xl border border-ink-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-sm">
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-ink-900">{metric.label}</h2><p className="mt-1 text-xs text-ink-500">{metric.key}</p></div><StatusBadge status={metric.status}/></div>
        <p className="mt-4 text-sm leading-6 text-ink-600">{metric.description}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-ink-500"><Database size={14}/>{metric.source.join(' + ')}</div>
      </button>)}
    </div>
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4" onClick={() => setSelected(null)}><div onClick={e => e.stopPropagation()} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" dir="rtl"><div className="flex items-start justify-between"><div><p className="text-sm text-primary-600">تعريف المقياس</p><h2 className="mt-1 text-2xl font-bold text-ink-950">{selected.label}</h2></div><button onClick={() => setSelected(null)} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100">×</button></div><div className="mt-6 space-y-4"><div className="rounded-xl bg-ink-50 p-4"><div className="flex items-center gap-2 text-sm font-medium"><Info size={16}/> التعريف</div><p className="mt-2 text-sm leading-6 text-ink-600">{selected.description}</p></div><div><p className="text-xs font-semibold text-ink-500">المعادلة</p><code className="mt-2 block rounded-xl bg-ink-950 p-4 text-sm text-white" dir="ltr">{selected.formula}</code></div><div><p className="text-xs font-semibold text-ink-500">مصادر البيانات</p><div className="mt-2 flex flex-wrap gap-2">{selected.source.map(s => <span key={s} className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs">{s}</span>)}</div></div><div className="flex items-center justify-between border-t border-ink-100 pt-4"><StatusBadge status={selected.status}/><span className="text-xs text-ink-500">الوحدة: {selected.unit}</span></div></div></div></div>}
  </div>;
}
