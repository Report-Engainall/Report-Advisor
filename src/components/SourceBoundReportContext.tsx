import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { fetchImportEvidenceSnapshot, fetchReportExecutionJob, getBoundRenderedReportManifest, type ImportEvidenceSnapshot, type ReportExecutionJobRecord, type RenderedReportManifest } from '@/lib/queries';

export function SourceBoundReportContext() {
  const [searchParams] = useSearchParams();
  const importId = searchParams.get('import')?.trim() || null;
  const [snapshot, setSnapshot] = useState<ImportEvidenceSnapshot | null>(null);
  const [manifest, setManifest] = useState<RenderedReportManifest | null>(null);
  const [job, setJob] = useState<ReportExecutionJobRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!importId) {
      setSnapshot(null);
      setManifest(null);
      setJob(null);
      return () => { active = false; };
    }
    setLoading(true);
    void (async () => {
      try {
        const evidence = await fetchImportEvidenceSnapshot(importId);
        const jobId = typeof evidence?.metadata?.jobId === 'string' ? evidence.metadata.jobId : null;
        const executionJob = jobId ? await fetchReportExecutionJob(jobId) : null;
        const bound = evidence?.source_hash && executionJob
          ? getBoundRenderedReportManifest(executionJob, importId, evidence.source_hash)
          : null;
        if (!active) return;
        setSnapshot(evidence);
        setJob(executionJob);
        setManifest(bound);
      } catch {
        if (!active) return;
        setSnapshot(null);
        setJob(null);
        setManifest(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [importId]);

  if (!importId) return null;

  const evidenceStatus = snapshot?.analysis_status === 'analyzed' ? 'VERIFIED' : snapshot ? 'PARTIAL / REVIEW' : 'REVIEW / NOT PROVEN';
  const renderStatus = manifest && job?.status === 'completed' ? 'SOURCE-BOUND / RENDERED' : 'REVIEW / NOT PROVEN';

  return <section className="rounded-2xl border border-primary-200 bg-primary-50/35 p-4 shadow-sm" aria-label="سياق التقرير المرتبط بالمصدر">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700"><ShieldCheck size={17}/></div>
        <div className="min-w-0">
          <div className="text-[9px] font-black tracking-[.14em] text-primary-700">SOURCE-BOUND REPORT CONTEXT</div>
          <h2 className="mt-1 text-sm font-black text-ink-950">هذا التقرير مرتبط بعملية استيراد محددة</h2>
          <p className="mt-1 text-[10px] leading-5 text-ink-600">لا يتغير نطاق KPI الكانوني بسبب الملف؛ هذا السياق يثبت فقط المصدر والدليل ومخرج التقرير الناتج عن عملية الاستيراد.</p>
        </div>
      </div>
      <Link to={`/trust?import=${encodeURIComponent(importId)}`} className="btn-secondary inline-flex items-center gap-1 text-[9px]"><ExternalLink size={12}/> Evidence Passport</Link>
    </div>
    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      <div className="rounded-xl border border-white bg-white/80 p-3"><div className="text-[8px] text-ink-400">Import</div><div className="mt-1 break-all font-mono text-[9px] font-bold text-ink-900">{importId}</div></div>
      <div className="rounded-xl border border-white bg-white/80 p-3"><div className="text-[8px] text-ink-400">Evidence</div><div className="mt-1 text-[9px] font-black text-ink-900">{evidenceStatus}</div></div>
      <div className="rounded-xl border border-white bg-white/80 p-3"><div className="text-[8px] text-ink-400">Rendered</div><div className="mt-1 text-[9px] font-black text-ink-900">{loading ? 'CHECKING…' : renderStatus}</div></div>
      <div className="rounded-xl border border-white bg-white/80 p-3"><div className="text-[8px] text-ink-400">Source</div><div className="mt-1 break-words text-[9px] font-black text-ink-900">{snapshot?.source_path ?? 'غير مثبت'}</div></div>
      <div className="rounded-xl border border-white bg-white/80 p-3"><div className="text-[8px] text-ink-400">Output count</div><div className="mt-1 text-[9px] font-black text-ink-900">{manifest ? manifest.outputs.length : 'غير مثبت'}</div></div>
    </div>
    {!loading && !manifest && <div className="mt-3 rounded-xl border border-warning-200 bg-warning-50 px-3 py-2 text-[9px] font-bold text-warning-900">REVIEW / NOT PROVEN — لم يثبت مخرج rendered مربوط بهذه العملية؛ لن يتم اعتبار التقرير دليلًا على المصدر.</div>}
  </section>;
}
