import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BrainCircuit, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchSourceAnalysisSnapshot, fetchSourceAnalysisSnapshots, type SourceAnalysisSnapshot } from '@/lib/queries';
import { Badge } from '@/components/ui/Badge';
import { UniversalIntelligencePanel } from '@/components/UniversalIntelligencePanel';
import type { Dataset } from '@/lib/file-engine/types';

function entityLabel(entity: string) { return ({ sales_invoices: 'المبيعات والفواتير', purchase_invoices: 'المشتريات والفواتير', products: 'المنتجات', customers: 'العملاء', inventory: 'المخزون', payments: 'المدفوعات', document_analysis: 'تحليل المستند', general_report: 'تقرير عام' } as Record<string, string>)[entity] ?? entity; }
function statusLabel(status: SourceAnalysisSnapshot['analysis_status']) { return ({ completed: 'تم توجيهه', analyzed: 'محلل — يحتاج مراجعة', skipped: 'مكرر — لم يُكتب', failed: 'فشل حقيقي' } as Record<string, string>)[status] ?? status; }
function statusVariant(status: SourceAnalysisSnapshot['analysis_status']) { return status === 'failed' ? 'danger' : status === 'completed' ? 'success' : 'warning'; }

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

  return <div dir="rtl" className="space-y-6 pb-12 animate-fade-in">
    <header className="hero-gradient relative overflow-hidden rounded-[2rem] p-6 text-white shadow-elevated lg:p-9">
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-5rem] right-1/3 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-4xl"><div className="flex items-center gap-2 text-sm font-semibold text-cyan-200"><Sparkles size={18}/> Universal Source Intelligence</div><h1 className="mt-2 text-3xl font-black tracking-tight lg:text-4xl">مساحة تحليل التقرير</h1><p className="mt-3 text-sm leading-7 text-slate-200">من المصدر الخام إلى التصنيف والعلاقات والجودة والتكرارات، مع إبقاء كل حقل قابلًا للتتبع. التحليل للقراءة فقط ولا يكتب أو يدمج تلقائيًا.</p></div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur hover:bg-white/20"><RefreshCw size={16}/> تحديث</button>
      </div>
      <div className="relative mt-6 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white/10 px-3 py-1.5">{items.length} مصدر محفوظ</span><span className="rounded-full bg-white/10 px-3 py-1.5">{selected ? `${selected.row_count} صف` : 'اختر مصدرًا'}</span><span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-emerald-100"><ShieldCheck size={13} className="mr-1 inline"/> قراءة آمنة</span></div>
    </header>
    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">{error}</div>}
    {loading ? <div className="card p-12 text-center text-sm text-ink-500">جارٍ قراءة المصادر المحفوظة…</div> : <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="card h-fit p-3 shadow-card-hover"><div className="flex items-center justify-between px-3 py-3"><div><div className="text-xs text-ink-400">المصادر</div><div className="text-lg font-black">{items.length} مصدر</div></div><span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">محفوظ</span></div>{items.length === 0 ? <div className="m-2 rounded-2xl border border-dashed p-6 text-center text-sm text-ink-500">لا توجد مصادر محفوظة بعد.</div> : <div className="space-y-2">{items.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item)} className={`group w-full rounded-2xl border p-3.5 text-right transition-all duration-200 ${selected?.id === item.id ? 'gradient-border soft-glow' : 'border-ink-100 bg-white hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover'}`}><div className="flex items-start justify-between gap-2"><span className="truncate text-sm font-bold">{item.source_path}</span><Badge variant={statusVariant(item.analysis_status) as 'danger' | 'success' | 'warning'}>{item.analysis_status}</Badge></div><div className="mt-1 text-xs text-ink-400">{item.source_format} · {item.row_count} صف · {item.quality_score ?? 0}% جودة</div><div className="mt-2 text-xs font-semibold text-primary-700">{entityLabel(item.entity_type)} · {statusLabel(item.analysis_status)}</div></button>)}</div>}</aside>
      <main className="space-y-5">{!selected ? <div className="card p-12 text-center text-sm text-ink-500">اختر مصدرًا لعرض ذكائه.</div> : <>
        <section className="surface-gradient gradient-border rounded-3xl p-5 shadow-card-hover lg:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-xs font-semibold text-primary-600">المصدر الحالي</div><h2 className="mt-1 break-all text-2xl font-black tracking-tight">{selected.source_path}</h2><div className="mt-3 flex flex-wrap gap-2"><Badge variant="neutral">SHA-256: {selected.source_hash.slice(0, 16)}…</Badge><Badge variant="neutral">{selected.source_format}</Badge><Badge variant={statusVariant(selected.analysis_status) as 'danger' | 'success' | 'warning'}>{statusLabel(selected.analysis_status)}</Badge></div></div><div className="rounded-2xl bg-white/80 p-3 text-left text-xs text-ink-500 shadow-sm"><div>نوع التقرير</div><div className="mt-1 font-bold text-ink-900">{entityLabel(selected.entity_type)}</div></div></div><div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4"><div className="rounded-2xl bg-white/80 p-4 shadow-sm"><div className="text-xs text-ink-500">الصفوف</div><b className="mt-1 block text-2xl font-black">{selected.row_count}</b></div><div className="rounded-2xl bg-white/80 p-4 shadow-sm"><div className="text-xs text-ink-500">الأعمدة</div><b className="mt-1 block text-2xl font-black">{selected.column_count}</b></div><div className="rounded-2xl bg-white/80 p-4 shadow-sm"><div className="text-xs text-ink-500">المجموعات</div><b className="mt-1 block text-2xl font-black">{datasets.length}</b></div><div className="rounded-2xl bg-white/80 p-4 shadow-sm"><div className="text-xs text-ink-500">حقول للتحليل</div><b className="mt-1 block text-2xl font-black">{columns.length}</b></div></div></section>
        <UniversalIntelligencePanel datasets={datasets} />
        <section className="card p-5 lg:p-6"><h2 className="section-heading">المعاينة المحفوظة</h2><div className="mt-4 space-y-3">{datasets.map((dataset) => <div key={dataset.id} className="rounded-2xl border border-ink-100 bg-ink-50/40 p-4"><div className="font-bold">{dataset.name}</div><div className="mt-3 overflow-auto rounded-xl bg-white"><table className="w-full min-w-[700px] text-xs"><tbody>{dataset.preview.slice(0, 8).map((row, index) => <tr key={index} className="border-b border-ink-100 last:border-0"><td className="p-2.5 text-ink-400">#{index + 1}</td>{Object.entries(row).slice(0, 12).map(([key, value]) => <td key={key} className="p-2.5 align-top"><div className="text-ink-400">{key}</div><div className="break-all font-medium">{String(value ?? '')}</div></td>)}</tr>)}</tbody></table></div></div>)}</div></section>
        <section className="card p-5 lg:p-6"><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-amber-600"/><h2 className="section-heading">الأدلة والتنبيهات</h2></div><div className="mt-3 space-y-2">{selected.warnings.length ? selected.warnings.map((warning, index) => <div key={index} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{warning}</div>) : <div className="rounded-xl bg-ink-50 p-3 text-sm">لا توجد تحذيرات مسجلة.</div>}</div></section>
        <Link to="/import" className="btn-primary w-fit"><ArrowLeft size={16}/> العودة إلى مركز الاستيراد</Link>
      </>}</main>
    </div>}
  </div>;
}
