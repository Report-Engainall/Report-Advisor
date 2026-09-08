import { useEffect, useMemo, useState } from 'react';
import { fetchExecutiveDecisionReport, type ExecutiveDecisionReport } from '@/lib/executive-decision-report';
import { buildExecutiveReportFreshness } from '@/lib/executive-report-freshness';
import { summarizeExecutiveReportQuality } from '@/lib/executive-report-quality';

function latestObservedAt(report: ExecutiveDecisionReport): string {
  const values = report.rows.flatMap((row) => [row.decision.created_at, row.decision.executed_at, row.decision.approved_at, row.decision_outcome?.observed_at ?? null, row.recommendation_outcome?.observed_at ?? null, ...row.work_items.map((item) => item.updated_at)]).filter((value): value is string => Boolean(value));
  return values.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? report.generated_at;
}

function evidenceRefs(row: ExecutiveDecisionReport['rows'][number]): string[] {
  const refs = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) refs.add(value.trim());
    if (Array.isArray(value)) value.forEach(add);
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      ['id', 'evidenceId', 'evidence_id', 'evidenceSnapshotId', 'evidence_snapshot_id', 'sourceDocumentId', 'source_document_id', 'sourceHash', 'source_hash'].forEach((key) => add(obj[key]));
    }
  };
  add(row.decision.evidence); add(row.recommendation?.evidence_snapshot_id); add(row.recommendation?.metric_versions); row.work_items.forEach((item) => add(item.evidence_refs)); add(row.decision_outcome?.evidence_snapshot_id); add(row.recommendation_outcome?.evidence);
  return [...refs].slice(0, 12);
}

export function ExecutiveDecisionReportPanel() {
  const [report, setReport] = useState<ExecutiveDecisionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void fetchExecutiveDecisionReport(50).then(setReport).catch((e) => setError(e instanceof Error ? e.message : 'تعذر تحميل سجل القرار التنفيذي.')); }, []);
  const freshness = useMemo(() => report ? buildExecutiveReportFreshness(report.generated_at, latestObservedAt(report), report.rows.length > 0) : null, [report]);
  const quality = useMemo(() => report ? summarizeExecutiveReportQuality({ hasDecisionEvidence: report.rows.some((row) => row.decision.evidence != null), hasOutcomeEvidence: report.rows.some((row) => row.decision_outcome?.evidence_snapshot_id || row.recommendation_outcome?.evidence), hasApproval: report.rows.some((row) => row.approval.status === 'APPROVED'), hasWorkItems: report.rows.some((row) => row.work_items.length > 0), learningAvailable: report.rows.some((row) => row.learning.sample_size > 0) }) : null, [report]);
  if (error) return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="text-lg font-bold">سجل القرار التنفيذي</h2><p className="mt-2 text-sm text-amber-900">{error} — لا يتم اختلاق بيانات عند غياب جلسة موثقة.</p></section>;
  if (!report || !freshness || !quality) return <section className="rounded-2xl border border-ink-200 bg-white p-5" aria-busy="true"><h2 className="text-lg font-bold">سجل القرار التنفيذي</h2><p className="mt-2 text-sm text-ink-500">جارٍ تحميل دورة القرار المحفوظة…</p></section>;
  return <section className="rounded-2xl border border-ink-200 bg-white p-5 print:border-0 print:p-0">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold">سجل القرار والتنفيذ والنتيجة</h2><p className="mt-1 text-xs text-ink-500">المصدر: سجل القرار المحفوظ · Generated {new Date(freshness.generatedAt).toLocaleString('ar')} · As of {new Date(freshness.asOf).toLocaleString('ar')}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold">{report.count} قرار</span><span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold">اكتمال {quality.completeness}%</span></div></div>
    <div className="mt-3 flex flex-wrap gap-2 text-xs" aria-label="حالة التقرير"><span className="rounded-lg bg-ink-50 px-2 py-1">{freshness.status === 'LIVE_READ_MODEL' ? 'قراءة حية من read model' : 'لا توجد قرارات محفوظة'}</span><span className="rounded-lg bg-ink-50 px-2 py-1">أحدث نشاط: {new Date(freshness.asOf).toLocaleString('ar')}</span></div>
    <div className="mt-4 space-y-3">{report.rows.length === 0 && <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500">لا توجد قرارات محفوظة لهذا المستأجر حتى الآن.</p>}{report.rows.map((row) => { const refs = evidenceRefs(row); return <article key={row.decision.id} className="rounded-xl border border-ink-100 p-4 print:break-inside-avoid"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold">{row.recommendation?.title ?? row.decision.decision_key ?? 'قرار بدون عنوان'}</p><p className="mt-1 text-xs text-ink-500">{row.decision.decision_type ?? 'نوع غير محدد'} · {row.decision.status ?? 'حالة غير محددة'}</p></div><span className="rounded-lg bg-ink-50 px-2 py-1 text-xs">{row.approval.status}</span></div><div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4"><div><span className="text-ink-500">الموافقة</span><p className="font-semibold">{row.approval.approved_at ? new Date(row.approval.approved_at).toLocaleString('ar') : 'غير مسجلة'}</p></div><div><span className="text-ink-500">التنفيذ</span><p className="font-semibold">{row.work_items.length} مهمة · {row.work_items.filter((w) => w.status === 'COMPLETED').length} مكتملة</p></div><div><span className="text-ink-500">النتيجة</span><p className="font-semibold">{row.decision_outcome?.label ?? row.recommendation_outcome?.status ?? 'غير مسجلة'}</p></div><div><span className="text-ink-500">التعلم</span><p className="font-semibold">{row.learning.sample_size} ملاحظة · {row.learning.correct} صحيحة</p></div></div>{(row.decision_outcome || row.recommendation_outcome) && <div className="mt-3 rounded-lg bg-ink-50 p-3 text-xs">{row.decision_outcome && <>Actual: {row.decision_outcome.actual_value ?? 'غير متاح'} · Expected: {row.decision_outcome.expected_value ?? 'غير متاح'} · Impact: {row.decision_outcome.impact_value ?? 'غير متاح'} · Evidence: {row.decision_outcome.evidence_snapshot_id ?? 'غير متاح'}</>}{row.recommendation_outcome && <>{row.decision_outcome ? ' · ' : ''}Outcome quality: {row.recommendation_outcome.outcome_quality ?? 'غير متاح'}</>}</div>}<div className="mt-3 rounded-lg border border-ink-100 p-3 text-xs"><p className="font-semibold">Evidence / lineage references</p>{refs.length ? <div className="mt-2 flex flex-wrap gap-2">{refs.map((ref) => <code key={ref} className="rounded bg-ink-50 px-2 py-1 break-all">{ref}</code>)}</div> : <p className="mt-1 text-ink-500">لا توجد مراجع evidence محفوظة في هذا السجل.</p>}</div></article>; })}</div>
  </section>;
}
