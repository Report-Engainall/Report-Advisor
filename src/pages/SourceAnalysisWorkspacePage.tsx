import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BrainCircuit, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchSourceAnalysisSnapshot, fetchSourceAnalysisSnapshots, type SourceAnalysisSnapshot } from '@/lib/queries';
import { Badge } from '@/components/ui/Badge';
import { UniversalIntelligencePanel } from '@/components/UniversalIntelligencePanel';
import type { Dataset } from '@/lib/file-engine/types';

function entityLabel(entity: string) { return ({ sales_invoices: 'المبيعات والفواتير', purchase_invoices: 'المشتريات والفواتير', products: 'المنتجات', customers: 'العملاء', inventory: 'المخزون', payments: 'المدفوعات', document_analysis: 'تحليل المستند', general_report: 'تقرير عام' } as Record<string, string>)[entity] ?? entity; }
function statusLabel(status: SourceAnalysisSnapshot['analysis_status']) { return ({ completed: 'تم توجيهه', analyzed: 'محلل — يحتاج مراجعة', skipped: 'مكرر — لم يُكتب', failed: 'فشل حقيقي' } as Record<string, string>)[status] ?? status; }

export function SourceAnalysisWorkspacePage() {
  const [params] = useSearchParams();
  const selectedId = params.get('id');
  const [items, setItems] = useState<SourceAnalysisSnapshot[]>([]);
  const [selected, setSelected] = useState<SourceAnalysisSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { const list = await fetchSourceAnalysisSnapshots(100); setItems(list); setSelected(selectedId ? await fetchSourceAnalysisSnapshot(selectedId) : list[0] ?? null); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحميل مساحة تحليل المصادر'); } finally { setLoading(false); } }, [selectedId]);
  useEffect(() => { void load(); }, [load]);
  const datasets = useMemo(() => (selected?.datasets ?? []) as Dataset[], [selected]);
  const columns = useMemo(() => datasets.flatMap((dataset) => dataset.columns), [datasets]);

  return <div dir="rtl" className="space-y-5 pb-10">
    <header className="rounded-3xl bg-ink-950 p-6 text-white lg:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sm text-primary-300"><BrainCircuit size={18}/> Universal Source Intelligence</div><h1 className="mt-2 text-2xl font-bold lg:text-3xl">مساحة تحليل التقرير</h1><p className="mt-2 max-w-4xl text-sm leading-7 text-ink-300">من المصدر الخام إلى التصنيف والعلاقات والجودة والتكرارات، مع إبقاء كل حقل قابلًا للتتبع. التحليل للقراءة فقط ولا يكتب أو يدمج تلقائيًا.</p></div><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-900"><RefreshCw size={16}/> تحديث</button></div></header>
    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    {loading ? <div className="rounded-2xl border bg-white p-10 text-center text-sm text-ink-500">جارٍ قراءة المصادر المحفوظة…</div> : <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <aside className="space-y-2 rounded-2xl border bg-white p-3"><div className="px-2 py-2 text-sm font-bold">المصادر ({items.length})</div>{items.length === 0 ? <div className="rounded-xl border border-dashed p-5 text-sm text-ink-500">لا توجد مصادر محفوظة بعد.</div> : items.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item)} className={`w-full rounded-xl border p-3 text-right transition ${selected?.id === item.id ? 'border-primary-400 bg-primary-50' : 'border-ink-100 hover:bg-ink-50'}`}><div className="flex items-start justify-between gap-2"><span className="truncate text-sm font-semibold">{item.source_path}</span><Badge variant={item.analysis_status === 'failed' ? 'danger' : item.analysis_status === 'completed' ? 'success' : 'warning'}>{item.analysis_status}</Badge></div><div className="mt-1 text-xs text-ink-400">{item.source_format} · {item.row_count} صف · {item.quality_score ?? 0}%</div><div className="mt-2 text-xs font-medium text-primary-700">{entityLabel(item.entity_type)} · {statusLabel(item.analysis_status)}</div></button>)}</aside>
      <main className="space-y-4">{!selected ? <div className="rounded-2xl border bg-white p-10 text-center text-sm text-ink-500">اختر مصدرًا لعرض ذكائه.</div> : <>
        <section className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-xs text-ink-400">المصدر</div><h2 className="mt-1 break-all text-xl font-bold">{selected.source_path}</h2><div className="mt-2 flex flex-wrap gap-2"><Badge variant="neutral">SHA-256: {selected.source_hash.slice(0, 16)}…</Badge><Badge variant="neutral">{selected.source_format}</Badge><Badge variant="neutral">{entityLabel(selected.entity_type)}</Badge></div></div><div className="text-left text-xs text-ink-400">{statusLabel(selected.analysis_status)}</div></div><div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><div className="rounded-xl bg-ink-50 p-4"><div className="text-xs text-ink-500">الصفوف</div><b className="text-xl">{selected.row_count}</b></div><div className="rounded-xl bg-ink-50 p-4"><div className="text-xs text-ink-500">الأعمدة</div><b className="text-xl">{selected.column_count}</b></div><div className="rounded-xl bg-ink-50 p-4"><div className="text-xs text-ink-500">المجموعات</div><b className="text-xl">{datasets.length}</b></div><div className="rounded-xl bg-ink-50 p-4"><div className="text-xs text-ink-500">حقول للتحليل</div><b className="text-xl">{columns.length}</b></div></div></section>
        <UniversalIntelligencePanel datasets={datasets} />
        <section className="rounded-2xl border bg-white p-5"><h2 className="font-bold">المعاينة المحفوظة</h2><div className="mt-4 space-y-3">{datasets.map((dataset) => <div key={dataset.id} className="rounded-xl border p-4"><div className="font-semibold">{dataset.name}</div><div className="mt-3 overflow-auto"><table className="w-full min-w-[700px] text-xs"><tbody>{dataset.preview.slice(0, 8).map((row, index) => <tr key={index} className="border-b border-ink-100"><td className="p-2 text-ink-400">#{index + 1}</td>{Object.entries(row).slice(0, 12).map(([key, value]) => <td key={key} className="p-2 align-top"><div className="text-ink-400">{key}</div><div className="break-all font-medium">{String(value ?? '')}</div></td>)}</tr>)}</tbody></table></div></div>)}</div></section>
        <section className="rounded-2xl border bg-white p-5"><h2 className="font-bold">الأدلة والتنبيهات</h2><div className="mt-3 space-y-2">{selected.warnings.length ? selected.warnings.map((warning, index) => <div key={index} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{warning}</div>) : <div className="rounded-xl bg-ink-50 p-3 text-sm">لا توجد تحذيرات مسجلة.</div>}</div></section>
        <Link to="/import" className="inline-flex items-center gap-2 rounded-xl bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white"><ArrowLeft size={16}/> العودة إلى مركز الاستيراد</Link>
      </>}</main>
    </div>}
  </div>;
}
