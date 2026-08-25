import { useMemo, useState } from 'react';
import type { EvidenceNode, EvidenceTrail, WorkspaceState } from '@/lib/secondary-evidence-ux';

const labels: Record<EvidenceNode['kind'], string> = {
  file: 'File', page: 'Page', table: 'Table', row: 'Row', column: 'Column', cell: 'Cell', extracted: 'Extracted Value', normalized: 'Normalized Value', entity: 'Entity', canonical: 'Canonical Record', metric: 'Metric', report: 'Report', decision: 'Decision', action: 'Action', outcome: 'Outcome',
};

export function StatePanel({ state, message }: { state: WorkspaceState; message?: string }) {
  if (state === 'READY') return null;
  const title = state === 'LOADING' ? 'جارٍ تحميل الأدلة…' : state === 'EMPTY' ? 'لا توجد أدلة متاحة' : state === 'ERROR' ? 'تعذر تحميل الأدلة' : state === 'BLOCKED' ? 'الوصول إلى الدليل محظور' : 'الدليل غير متاح بعد';
  return <div role={state === 'ERROR' ? 'alert' : 'status'} className="rounded-xl border border-ink-100 bg-white p-6 text-sm text-ink-600"><strong className="block text-ink-900">{title}</strong><span className="mt-1 block">{message ?? (state === 'UNKNOWN' ? 'INSUFFICIENT EVIDENCE — لا يمكن إثبات المصدر حاليًا.' : 'لا توجد بيانات كافية لعرض هذه الحالة.')}</span></div>;
}

export function EvidenceWorkspace({ trail }: { trail: EvidenceTrail }) {
  const [selectedId, setSelectedId] = useState<string | null>(trail.nodes[trail.nodes.length - 1]?.id ?? null);
  const selected = trail.nodes.find(node => node.id === selectedId) ?? null;
  return <section dir="rtl" aria-label="Evidence Workspace" className="space-y-4">
    <header><p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Evidence Workspace</p><h2 className="mt-1 text-xl font-bold text-ink-900">مسار الدليل القابل للتدقيق</h2><p className="mt-1 text-sm text-ink-500">المصدر ← البيانات ← المؤشر ← التقرير ← القرار ← الإجراء ← النتيجة</p></header>
    <StatePanel state={trail.status} message={trail.message} />
    {trail.status === 'READY' && <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="card overflow-hidden"><div className="overflow-x-auto"><ol className="flex min-w-max p-4 gap-2" aria-label="Evidence lineage">
        {trail.nodes.map((node, index) => <li key={node.id} className="flex items-center gap-2"><button type="button" onClick={() => setSelectedId(node.id)} aria-current={selectedId === node.id ? 'step' : undefined} className={`rounded-xl border px-3 py-2 text-right text-sm transition ${selectedId === node.id ? 'border-primary-300 bg-primary-50 text-primary-800' : 'border-ink-100 bg-white text-ink-700 hover:bg-ink-50'}`}><span className="block text-[11px] text-ink-400">{labels[node.kind]}</span><span className="font-semibold">{node.label}</span>{node.value !== undefined && <span className="block text-xs text-ink-500">{node.value ?? 'UNKNOWN'}</span>}</button>{index < trail.nodes.length - 1 && <span aria-hidden="true" className="text-ink-300">←</span>}</li>)}
      </ol></div></div>
      <aside className="card p-5" aria-live="polite"><p className="text-xs font-semibold text-ink-400">تفاصيل العقدة</p>{selected ? <><h3 className="mt-2 text-lg font-bold text-ink-900">{selected.label}</h3><p className="mt-1 text-sm text-ink-500">{labels[selected.kind]}</p><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-ink-400">ID</dt><dd className="font-mono text-ink-700 break-all">{selected.id}</dd></div><div><dt className="text-ink-400">Status</dt><dd className="font-semibold">{selected.status ?? 'UNKNOWN'}</dd></div>{selected.sourceRef && <div><dt className="text-ink-400">Source Reference</dt><dd className="font-mono break-all">{selected.sourceRef}</dd></div>}</dl></> : <p className="mt-3 text-sm text-ink-500">اختر عقدة لعرض تفاصيلها.</p>}</aside>
    </div>}
  </section>;
}

export function TrustDimensions({ values }: { values: Record<string, number | undefined> }) {
  const items = useMemo(() => Object.entries(values), [values]);
  return <div dir="rtl" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{items.map(([key, value]) => <div key={key} className="rounded-xl border border-ink-100 bg-white p-4"><div className="text-xs text-ink-400">{key}</div><div className="mt-1 text-xl font-bold text-ink-900">{value === undefined ? 'UNKNOWN' : `${Math.round(value)}%`}</div></div>)}</div>;
}
