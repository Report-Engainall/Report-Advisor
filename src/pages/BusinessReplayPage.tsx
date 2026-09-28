import { useCallback, useEffect, useMemo, useState } from 'react';
import { History, RefreshCw, ShieldCheck } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { fetchImportEvidenceSnapshot } from '@/lib/queries';
import { loadPersistedOutcomes, summarizeOutcomes, type DecisionOutcome } from '@/lib/analytics/outcome-feedback';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format';

export function BusinessReplayPage() {
  const [params] = useSearchParams();
  const importId = params.get('import')?.trim() || null;
  const [rows, setRows] = useState<DecisionOutcome[]>([]);
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { resolveCurrentCompanyId } = await import('@/lib/supabase');
      const [companyId, evidence] = await Promise.all([
        resolveCurrentCompanyId(),
        importId ? fetchImportEvidenceSnapshot(importId) : Promise.resolve(null),
      ]);
      if (!companyId) throw new Error('TENANT_REQUIRED');
      const outcomes = await loadPersistedOutcomes(companyId);
      setSnapshotId(evidence?.id ?? null);
      setRows(importId && evidence ? outcomes.filter((item) => item.evidenceSnapshotId === evidence.id) : outcomes);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل سجل النتائج والتعلّم');
    } finally {
      setLoading(false);
    }
  }, [importId]);

  useEffect(() => { void load(); }, [load]);

  const summary = useMemo(() => {
    const tenantId = rows[0]?.tenantId ?? '__none__';
    return summarizeOutcomes(rows, tenantId);
  }, [rows]);

  return (
    <div dir="rtl" className="space-y-5 animate-fade-in pb-10">
      <section className="rounded-[20px] border border-ink-200 bg-ink-950 p-5 text-white shadow-elevated lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[.14em] text-primary-200"><History size={15}/> BUSINESS REPLAY</div>
            <h1 className="mt-2 text-2xl font-black lg:text-[30px]">النتيجة والتعلّم</h1>
            <p className="mt-2 max-w-3xl text-[11px] leading-6 text-ink-300">يعرض هذا السطح النتائج التي سُجلت فعليًا بعد القرار. لا يعيد تركيب تاريخ مفقود ولا يحول التوصية إلى نتيجة من دون Outcome محفوظ.</p>
          </div>
          <button type="button" onClick={() => void load()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-[10px] font-black text-white hover:bg-white/15"><RefreshCw size={14}/> تحديث</button>
        </div>
      </section>
      {loading && <LoadingState message="جارٍ تحميل النتائج المحفوظة..." />}
      {error && <ErrorState message={error} onRetry={() => void load()} />}
      {!loading && !error && <>
        <section className="ag-decision-strip" aria-label="ملخص نتائج القرار">
          <div className="ag-decision-cell"><span className="ag-decision-label">النتائج المسجلة</span><span className="ag-decision-value">{formatNumber(summary.count)}</span></div>
          <div className="ag-decision-cell"><span className="ag-decision-label">الدقة</span><span className="ag-decision-value">{summary.accuracy == null ? 'غير متاح' : String(Math.round(summary.accuracy * 100)) + '%'}</span></div>
          <div className="ag-decision-cell"><span className="ag-decision-label">التغطية</span><span className="ag-decision-value">{summary.coverage == null ? 'غير متاح' : String(Math.round(summary.coverage * 100)) + '%'}</span></div>
          <div className="ag-decision-cell"><span className="ag-decision-label">الأثر المسجل</span><span className="ag-decision-value">{summary.impact == null ? 'غير متاح' : formatCurrency(summary.impact)}</span></div>
        </section>
        {importId && <section className="rounded-2xl border border-primary-200 bg-primary-50/45 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><div className="section-kicker">SOURCE CONTEXT</div><div className="mt-1 text-sm font-black text-ink-950">Business Replay المرتبط بالمصدر</div><div className="mt-1 text-[10px] text-ink-600">تمت التصفية على لقطة الدليل المرتبطة بعملية الاستيراد فقط.</div></div>
            <Link to={snapshotId ? '/trust?import=' + encodeURIComponent(importId) : '/trust'} className="btn-secondary text-[10px]"><ShieldCheck size={13}/> Evidence Passport</Link>
          </div>
        </section>}
        {!rows.length ? <EmptyState icon={<History size={32}/>} title={importId ? 'INSUFFICIENT DATA' : 'لا توجد نتائج محفوظة بعد'} message={importId ? 'لم تُسجل Outcome مرتبطة بلقطة الدليل لهذا المصدر. لا يتم اختلاق Replay أو نتائج تاريخية غير موجودة.' : 'لا توجد نتائج Outcome محفوظة يمكن إعادة تشغيلها أو تلخيص تعلّم منها.'} action={<Link to="/decision-experience?stage=outcome" className="btn-primary text-[11px]">فتح مرحلة النتيجة</Link>} /> :
          <Card><CardHeader title="سجل النتائج الفعلية" subtitle="المصدر هنا recommendation_outcomes المحفوظة، لا تقدير الواجهة." /><CardBody>
            <div className="space-y-2">
              {rows.map((row) => <article key={row.decisionFingerprint + ':' + row.observedAt} className="rounded-xl border border-ink-100 bg-ink-50/50 p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0"><div className="text-[11px] font-black text-ink-900">{row.decisionFingerprint}</div><div className="mt-1 text-[9px] text-ink-400">{formatDateTime(row.observedAt)} · Evidence {row.evidenceSnapshotId}</div></div>
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-black">
                    <span className="rounded-full border border-ink-200 bg-white px-2 py-1">{row.label}</span>
                    {row.expectedValue != null && <span className="rounded-full bg-white px-2 py-1">المتوقع: {formatCurrency(row.expectedValue)}</span>}
                    {row.actualValue != null && <span className="rounded-full bg-white px-2 py-1">الفعلي: {formatCurrency(row.actualValue)}</span>}
                    {row.impactValue != null && <span className="rounded-full bg-primary-50 px-2 py-1 text-primary-800">الأثر: {formatCurrency(row.impactValue)}</span>}
                  </div>
                </div>
                {row.notes && <div className="mt-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-[9px] text-ink-600">{row.notes}</div>}
              </article>)}
            </div>
          </CardBody></Card>}
      </>}
    </div>
  );
}