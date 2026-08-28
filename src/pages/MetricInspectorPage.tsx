import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Database, GitBranch, ShieldCheck } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { listSemanticMetricContracts, semanticMetricIsFresh, type SemanticMetricContract } from '@/lib/semantic-metric-service';

function statusClass(status: SemanticMetricContract['governance'] extends infer G ? G extends { certificationStatus: infer S } ? S : never : never): string {
  if (status === 'CERTIFIED') return 'bg-success-50 text-success-700';
  if (status === 'REVIEWED') return 'bg-primary-50 text-primary-700';
  if (status === 'DEPRECATED') return 'bg-ink-100 text-ink-600';
  return 'bg-warning-50 text-warning-700';
}

function freshnessClass(state: 'FRESH' | 'STALE' | 'UNKNOWN'): string {
  if (state === 'FRESH') return 'text-success-600';
  if (state === 'STALE') return 'text-warning-600';
  return 'text-ink-400';
}

export function MetricInspectorPage() {
  const [items, setItems] = useState<SemanticMetricContract[]>([]);
  const [selected, setSelected] = useState<SemanticMetricContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setLoading(true); setError(null); const result = await listSemanticMetricContracts(); setItems(result); setSelected(current => current ? result.find(item => item.definition.metricId === current.definition.metricId) ?? result[0] ?? null : result[0] ?? null); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحميل حوكمة المؤشرات'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState message="جارٍ تحميل حوكمة المؤشرات..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items.length) return <EmptyState title="لا توجد مؤشرات محفوظة" message="لم يتم العثور على نسخ حوكمة persisted للمؤشرات." />;

  const governance = selected?.governance;
  const freshness = semanticMetricIsFresh(governance, governance?.updatedAt);

  return <div dir="rtl" className="space-y-6 animate-fade-in">
    <PageHeader title="حوكمة المؤشرات" subtitle="تعريف المؤشر، نسخته، مصدره، الثقة، الأدلة، والجهات المستهلكة من عقد موحد" />
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <Card><CardHeader title="المؤشرات" subtitle={`${items.length} مؤشرًا محفوظًا`} /><CardBody className="p-2"><div className="space-y-1">{items.map(item => <button key={item.definition.metricId} type="button" onClick={() => setSelected(item)} className={`w-full text-right rounded-xl px-3 py-3 transition ${selected?.definition.metricId === item.definition.metricId ? 'bg-primary-50' : 'hover:bg-ink-50'}`}><div className="font-semibold text-sm text-ink-800">{item.definition.label}</div><div className="mt-1 flex items-center justify-between text-xs text-ink-400"><span>{item.definition.metricId}</span><span>v{item.governance?.version ?? item.definition.version}</span></div></button>)}</div></CardBody></Card>
      {selected && <div className="space-y-6">
        <Card><CardBody><div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"><div><div className="text-xs text-ink-400">{selected.definition.metricId}</div><h2 className="mt-1 text-2xl font-bold text-ink-900">{selected.definition.label}</h2><p className="mt-2 text-sm leading-6 text-ink-500">{selected.definition.description}</p></div><div className="flex flex-wrap gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(governance?.certificationStatus ?? 'DRAFT')}`}><ShieldCheck size={14}/>{governance?.certificationStatus ?? 'DRAFT'}</span><span className={`inline-flex items-center gap-1 text-xs font-medium ${freshnessClass(freshness)}`}><Clock3 size={14}/>{freshness}</span></div></div></CardBody></Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardHeader title="التعريف والحساب" /><CardBody className="space-y-3"><div><div className="text-xs text-ink-400">Formula</div><code className="mt-1 block rounded-lg bg-ink-50 p-3 text-xs text-ink-700 break-words">{selected.definition.formula}</code></div><div><div className="text-xs text-ink-400">Time semantic</div><div className="mt-1 font-medium text-ink-800">{selected.definition.timeSemantic}</div></div><div><div className="text-xs text-ink-400">Owner</div><div className="mt-1 font-medium text-ink-800">{governance?.owner ?? selected.definition.owner}</div></div></CardBody></Card>
          <Card><CardHeader title="المصدر والأدلة" /><CardBody className="space-y-3"><div className="flex items-start gap-2"><Database size={16} className="mt-0.5 text-primary-600"/><div><div className="text-xs text-ink-400">Sources</div><div className="text-sm text-ink-800">{selected.definition.source.join('، ')}</div></div></div><div className="flex items-start gap-2"><GitBranch size={16} className="mt-0.5 text-primary-600"/><div><div className="text-xs text-ink-400">Evidence references</div><div className="text-sm text-ink-800">{governance?.evidence.join('، ') || selected.definition.evidence.join('، ')}</div></div></div></CardBody></Card>
        </div>
        <Card><CardHeader title="Consumers & Dependencies" /><CardBody><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><div className="text-xs text-ink-400 mb-2">Consumers</div><div className="flex flex-wrap gap-2">{(governance?.consumers ?? selected.definition.consumers).map(item => <span key={item} className="rounded-full bg-ink-50 px-2.5 py-1 text-xs text-ink-600">{item}</span>)}</div></div><div><div className="text-xs text-ink-400 mb-2">Dependencies</div><div className="flex flex-wrap gap-2">{(governance?.dependencies ?? selected.definition.dependencies ?? []).map(item => <span key={item} className="rounded-full bg-ink-50 px-2.5 py-1 text-xs text-ink-600">{item}</span>)}</div></div></div></CardBody></Card>
        <Card><CardHeader title="Test & Governance Status" /><CardBody><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="rounded-xl bg-ink-50 p-4"><div className="flex items-center gap-2 text-sm font-medium text-ink-700"><CheckCircle2 size={16} className="text-success-600"/> Tests</div><div className="mt-2 text-xs text-ink-500">{(governance?.tests ?? selected.definition.tests).join('، ')}</div></div><div className="rounded-xl bg-ink-50 p-4"><div className="flex items-center gap-2 text-sm font-medium text-ink-700"><AlertTriangle size={16} className="text-warning-600"/> Freshness policy</div><div className="mt-2 text-xs text-ink-500">{governance ? JSON.stringify(governance.freshness) : 'غير محفوظة'}</div></div><div className="rounded-xl bg-ink-50 p-4"><div className="text-sm font-medium text-ink-700">Version</div><div className="mt-2 text-lg font-bold text-ink-900">v{governance?.version ?? selected.definition.version}</div><div className="text-xs text-ink-400">آخر تحديث: {governance?.updatedAt ?? 'غير محفوظ'}</div></div></div></CardBody></Card>
      </div>}
    </div>
  </div>;
}
