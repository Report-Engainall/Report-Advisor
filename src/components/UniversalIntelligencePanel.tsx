import { useMemo } from 'react';
import { AlertTriangle, GitBranch, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { classifyDataset, detectRelations, resolveRows, summarizeUniversalQuality } from '@/lib/file-engine/universal-intelligence';
import type { Dataset } from '@/lib/file-engine/types';

export function UniversalIntelligencePanel({ datasets }: { datasets: Dataset[] }) {
  const analysis = useMemo(() => {
    const classifications = datasets.map((dataset) => ({ dataset, result: classifyDataset(dataset) }));
    const relations = detectRelations(datasets);
    const quality = datasets.map((dataset) => ({ dataset, summary: summarizeUniversalQuality(dataset, resolveRows(dataset)) }));
    return { classifications, relations, quality };
  }, [datasets]);

  return <section className="relative overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50/70 p-5 shadow-card-hover lg:p-6">
    <div className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full bg-violet-300/20 blur-3xl" />
    <div className="pointer-events-none absolute -right-10 bottom-[-4rem] h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
    <div className="relative flex flex-wrap items-start justify-between gap-3">
      <div><div className="flex items-center gap-2 text-violet-800"><span className="rounded-xl bg-white/80 p-2 shadow-sm"><Sparkles size={18}/></span><h2 className="text-lg font-black">Universal Intelligence</h2></div><p className="mt-2 max-w-3xl text-xs leading-6 text-ink-600">تصنيف وعلاقات وتكرارات وجودة مبنية على المصدر الحالي فقط. لا توجد كتابة أو دمج تلقائي.</p></div>
      <Badge variant="neutral">قراءة فقط · آمنة</Badge>
    </div>
    <div className="relative mt-5 grid gap-3 lg:grid-cols-3">
      {analysis.classifications.map(({ dataset, result }) => <div key={dataset.id} className="gradient-border rounded-2xl p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card-hover"><div className="text-xs font-semibold text-ink-400">تصنيف {dataset.name}</div><div className="mt-1 font-black text-ink-900">{result.reportType}</div><div className="mt-2 flex flex-wrap gap-2"><Badge variant={result.requiresReview ? 'warning' : 'success'}>{result.confidence}% ثقة</Badge>{result.requiresReview && <Badge variant="warning">مراجعة</Badge>}</div><div className="mt-3 space-y-1 text-xs text-ink-500">{result.evidence.slice(0, 3).map((evidence) => <div key={evidence}>• {evidence}</div>)}</div></div>)}
      <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4 shadow-sm"><div className="flex items-center gap-2 text-sm font-black"><span className="rounded-lg bg-cyan-50 p-1.5 text-cyan-700"><GitBranch size={16}/></span> العلاقات المكتشفة</div>{analysis.relations.length === 0 ? <p className="mt-3 text-xs text-ink-500">لا توجد علاقة مؤكدة من المفاتيح الحالية.</p> : <div className="mt-3 space-y-2">{analysis.relations.slice(0, 6).map((relation, index) => <div key={`${relation.leftDataset}-${relation.rightDataset}-${index}`} className="rounded-xl bg-gradient-to-l from-cyan-50 to-white p-2.5 text-xs"><div className="font-bold">{relation.leftDataset} ↔ {relation.rightDataset}</div><div className="mt-1 text-ink-500">{relation.leftField} ↔ {relation.rightField} · {relation.confidence}%</div></div>)}</div>}</div>
    </div>
    <div className="relative mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {analysis.quality.map(({ dataset, summary }) => <div key={dataset.id} className="rounded-2xl border border-ink-100 bg-white/90 p-4 shadow-sm"><div className="text-xs font-semibold text-ink-400">جودة {dataset.name}</div><div className="mt-1 text-3xl font-black gradient-text">{summary.score}%</div><div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-ink-500"><span>اكتمال {summary.completeness}%</span><span>Mapping {summary.mapping}%</span><span>الأنواع {summary.typeConfidence}%</span><span>تكرار {summary.duplicateCount}</span></div>{summary.conflictCount > 0 && <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-700"><AlertTriangle size={13}/> {summary.conflictCount} تعارض</div>}</div>)}
    </div>
    <div className="relative mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-white/80 p-3.5 text-xs leading-6 text-emerald-800 shadow-sm"><ShieldCheck size={16} className="mt-0.5 shrink-0"/><span>التكرار الدقيق يصنف <b>skip_exact</b>، والتشابه/الاختلاف يصنف كمرشح أو تعارض. لا يوجد حذف أو دمج صامت.</span></div>
  </section>;
}
