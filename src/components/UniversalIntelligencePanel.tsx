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

  return <section className="space-y-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><div className="flex items-center gap-2 text-violet-800"><Sparkles size={18}/><h2 className="font-bold">Universal Intelligence</h2></div><p className="mt-1 text-xs leading-6 text-ink-600">تصنيف وعلاقات وتكرارات وجودة مبنية على المصدر الحالي فقط. لا توجد كتابة أو دمج تلقائي.</p></div>
      <Badge variant="neutral">Read-only intelligence</Badge>
    </div>
    <div className="grid gap-3 lg:grid-cols-3">
      {analysis.classifications.map(({ dataset, result }) => <div key={dataset.id} className="rounded-xl border bg-white p-4"><div className="text-xs text-ink-400">تصنيف {dataset.name}</div><div className="mt-1 font-bold">{result.reportType}</div><div className="mt-2 flex flex-wrap gap-2"><Badge variant={result.requiresReview ? 'warning' : 'success'}>{result.confidence}% ثقة</Badge>{result.requiresReview && <Badge variant="warning">مراجعة</Badge>}</div><div className="mt-3 space-y-1 text-xs text-ink-500">{result.evidence.slice(0, 3).map((evidence) => <div key={evidence}>• {evidence}</div>)}</div></div>)}
      <div className="rounded-xl border bg-white p-4"><div className="flex items-center gap-2 text-sm font-bold"><GitBranch size={16}/> العلاقات المكتشفة</div>{analysis.relations.length === 0 ? <p className="mt-3 text-xs text-ink-500">لا توجد علاقة مؤكدة من المفاتيح الحالية.</p> : <div className="mt-3 space-y-2">{analysis.relations.slice(0, 6).map((relation, index) => <div key={`${relation.leftDataset}-${relation.rightDataset}-${index}`} className="rounded-lg bg-ink-50 p-2 text-xs"><div className="font-semibold">{relation.leftDataset} ↔ {relation.rightDataset}</div><div className="mt-1">{relation.leftField} ↔ {relation.rightField} · {relation.confidence}%</div></div>)}</div>}</div>
    </div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {analysis.quality.map(({ dataset, summary }) => <div key={dataset.id} className="rounded-xl border bg-white p-4"><div className="text-xs text-ink-400">جودة {dataset.name}</div><div className="mt-1 text-2xl font-bold">{summary.score}%</div><div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-ink-500"><span>اكتمال {summary.completeness}%</span><span>Mapping {summary.mapping}%</span><span>الأنواع {summary.typeConfidence}%</span><span>تكرار {summary.duplicateCount}</span></div>{summary.conflictCount > 0 && <div className="mt-2 flex items-center gap-1 text-xs text-red-700"><AlertTriangle size={13}/> {summary.conflictCount} تعارض</div>}</div>)}
    </div>
    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-white p-3 text-xs leading-6 text-emerald-800"><ShieldCheck size={16} className="mt-0.5 shrink-0"/><span>التكرار الدقيق يصنف <b>skip_exact</b>، والتشابه/الاختلاف يصنف كمرشح أو تعارض. القرار الكتابي النهائي ما زال يحتاج سياسة وحكمًا صريحًا؛ لا يوجد حذف أو دمج صامت.</span></div>
  </section>;
}
