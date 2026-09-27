import { ArrowLeft, CheckCircle2, Eye, FileSearch, GitBranch, History, Landmark, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { fetchDataQualitySnapshot } from '@/lib/data-quality-snapshot';
import { fetchImportEvidenceSnapshot, type ImportEvidenceSnapshot } from '@/lib/queries';
import { specialtyLabel } from '@/lib/import/canonical-labels';

const states = [
  { title: 'VERIFIED', text: 'بيانات قابلة للإثبات من المسار الكانوني.', tone: 'bg-success-50 text-success-700', icon: CheckCircle2 },
  { title: 'TRUSTED', text: 'حالة ثقة قابلة للاستخدام عندما يثبت المصدر والسياق المطلوب.', tone: 'bg-primary-50 text-primary-700', icon: ShieldCheck },
  { title: 'PARTIAL', text: 'متاحة جزئيًا مع حدود معلنة.', tone: 'bg-primary-50 text-primary-700', icon: GitBranch },
  { title: 'REVIEW', text: 'تحتاج مراجعة قبل استخدامها في قرار.', tone: 'bg-warning-50 text-warning-700', icon: FileSearch },
  { title: 'BLOCKED', text: 'محجوبة عن القرار حتى معالجة السبب.', tone: 'bg-danger-50 text-danger-700', icon: ShieldCheck },
  { title: 'INSUFFICIENT DATA', text: 'المصدر الحالي لا يملك ما يكفي لإصدار نتيجة موثوقة.', tone: 'bg-ink-100 text-ink-700', icon: Eye },
] as const;

const evidenceSurfaces = [
  { title: 'Evidence Passport', detail: 'هوية الدليل ومصدره وسياقه عند توفر السجل.', path: '/trust', available: true, icon: Landmark },
  { title: 'Provenance / Lineage', detail: 'تتبع انتقال الحقيقة من المصدر إلى التحليل.', path: '/data-quality', available: true, icon: GitBranch },
  { title: 'Snapshots / As-of', detail: 'سياق As Of ظاهر داخل Evidence Passport؛ لا يوجد مستكشف snapshots مستقل حتى الآن.', path: '/trust', available: true, icon: History },
  { title: 'Decision Evidence', detail: 'الدليل المرتبط بمساحة القرار الحالية.', path: '/decision-experience?stage=evidence', available: true, icon: ShieldCheck },
  { title: 'Benchmark Governance', detail: 'يتطلب سجل مقارنة وعينة كافية؛ لا تُعرض نتيجة مختلقة.', path: '', available: false, icon: FileSearch },
  { title: 'Metric Inspector', detail: 'فحص المؤشر وحدود الحساب ومصدره.', path: '/metrics', available: true, icon: Eye },
];

export function TrustEvidencePage() {
  const [params] = useSearchParams();
  const importJobId = params.get('import');
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchDataQualitySnapshot>> | null>(null);
  const [sourceSnapshot, setSourceSnapshot] = useState<ImportEvidenceSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSnapshot = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const [next, source] = await Promise.all([
        fetchDataQualitySnapshot(),
        importJobId ? fetchImportEvidenceSnapshot(importJobId) : Promise.resolve(null),
      ]);
      setSnapshot(next);
      setSourceSnapshot(source);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر قراءة حالة الثقة');
    } finally {
      setRefreshing(false);
    }
  }, [importJobId]);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  const status = snapshot?.status ?? 'INSUFFICIENT DATA';
  const issueTotal = useMemo(
    () => snapshot?.entities?.reduce((sum, entity) => sum + (entity.issues ?? 0), 0) ?? null,
    [snapshot],
  );
  const totalRecords = useMemo(
    () => snapshot?.entities?.reduce((sum, entity) => sum + (entity.total ?? 0), 0) ?? null,
    [snapshot],
  );
  const criticalIssueTotal = useMemo(
    () => snapshot?.issues?.filter((issue) => issue.severity === 'critical').reduce((sum, issue) => sum + issue.count, 0) ?? 0,
    [snapshot],
  );
  const sourceEvidenceStatus = useMemo(() => {
    if (!sourceSnapshot) return 'PARTIAL' as const;
    if (String(sourceSnapshot.analysis_status).toLowerCase() !== 'analyzed') return 'PARTIAL' as const;
    if (criticalIssueTotal > 0) return 'REVIEW' as const;
    return 'VERIFIED' as const;
  }, [sourceSnapshot, criticalIssueTotal]);
  const effectiveStatus = importJobId ? sourceEvidenceStatus : status;
  const statusLabel = effectiveStatus === 'OK'
    ? 'الحالة قابلة للاستخدام'
    : effectiveStatus === 'EMPTY'
      ? 'لا توجد بيانات مثبتة بعد'
      : effectiveStatus === 'PARTIAL'
        ? 'PARTIAL / NOT PROVEN'
        : effectiveStatus;
  const nextStep = !importJobId
    ? snapshot?.status === 'EMPTY'
      ? { label: 'ابدأ من المصدر', detail: 'أضف ملفًا أو مصدرًا حتى يمكن بناء حالة حقيقة وأدلة فعلية.', path: '/import' }
      : criticalIssueTotal > 0
        ? { label: 'أغلق المشكلات الحرجة', detail: 'ابدأ من جودة البيانات قبل استخدام النتائج في قرار.', path: '/data-quality' }
        : issueTotal && issueTotal > 0
          ? { label: 'مراجعة جودة البيانات', detail: 'راجع الحالات التي تمنع الثقة الكاملة قبل الانتقال إلى القرار.', path: '/data-quality' }
          : { label: 'فحص مصدر الدليل', detail: 'راجع المصدر وسياقه قبل الانتقال إلى القرار.', path: '/import/analyze' }
    : !sourceSnapshot
      ? { label: 'إثبات Snapshot المصدر', detail: 'هذا الاستيراد لا يملك Evidence Passport مثبتًا بعد؛ ابقَ في حالة PARTIAL حتى يظهر الدليل.', path: '/trust?import=' + encodeURIComponent(importJobId) }
      : sourceEvidenceStatus === 'PARTIAL'
        ? { label: 'إكمال إثبات التحليل', detail: 'سجل الدليل موجود، لكن حالة التحليل الحالية ليست analyzed؛ لا تنتقل إلى القرار حتى تُثبت الحالة التشغيلية.', path: '/trust?import=' + encodeURIComponent(importJobId) }
        : criticalIssueTotal > 0
          ? { label: 'مراجعة جودة البيانات', detail: 'الدليل موجود، لكن توجد مشكلات حرجة تمنع الانتقال الآمن إلى القرار.', path: '/data-quality' }
          : { label: 'متابعة إلى القرار', detail: 'الدليل المرتبط بالمصدر مثبت والجودة الحالية لا تعرض حرجًا يمنع القرار.', path: '/decision-experience?stage=evidence&import=' + encodeURIComponent(importJobId) };

  if (!snapshot && !error) return <LoadingState message="جارٍ قراءة حالة الثقة من المصدر..." />;
  if (error) return <ErrorState message={error} onRetry={() => void loadSnapshot()} />;

  return <div dir="rtl" className="ag-trust-evidence-surface space-y-6 animate-fade-in pb-10">
    <PageHeader
      title="مركز الثقة والأدلة"
      subtitle="طبقة واحدة لفهم مصدر الرقم، حالته، حدوده، وما إذا كان صالحًا للاستخدام في قرار."
      actions={
        <button
          type="button"
          onClick={() => void loadSnapshot()}
          disabled={refreshing}
          className="btn-secondary inline-flex items-center gap-2 disabled:cursor-wait disabled:opacity-60"
          aria-label="تحديث حالة الثقة"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'جارٍ التحديث' : 'تحديث الحالة'}
        </button>
      }
    />
    <section className="ag-command-hero overflow-hidden rounded-[1.75rem] p-6 text-white lg:p-8">
      <div className="max-w-4xl">
        <div className="text-[10px] font-black tracking-[.14em] text-primary-200">TRUTH CONTROL PLANE</div>
        <h2 className="mt-3 text-2xl font-black lg:text-3xl">لا رقم بلا سياق، ولا قرار بلا دليل.</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">الواجهة لا ترفع درجة الثقة من تلقاء نفسها. كل حالة مرتبطة بجودة المصدر أو حدود البيانات الفعلية.</p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-4" role="status" aria-live="polite">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-[9px] font-black text-ink-300">CURRENT STATUS</div><div className="mt-1 text-lg font-black">{statusLabel}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-[9px] font-black text-ink-300">RECORDS CHECKED</div><div className="mt-1 text-lg font-black">{totalRecords == null ? 'غير متاح' : totalRecords}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-[9px] font-black text-ink-300">ISSUES REPORTED</div><div className="mt-1 text-lg font-black">{issueTotal ?? 'غير متاح'}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-[9px] font-black text-ink-300">CRITICAL</div><div className="mt-1 text-lg font-black">{criticalIssueTotal}</div></div>
      </div>
    </section>

    {importJobId && (
      <section className="overflow-hidden rounded-[16px] border border-primary-200 bg-white shadow-card">
        <div className="border-b border-primary-100 bg-primary-50/60 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[9px] font-black tracking-[.12em] text-primary-700">EVIDENCE PASSPORT</div>
              <h2 className="mt-1 text-lg font-black text-ink-950">دليل المصدر المستورد</h2>
              <p className="mt-1 text-[11px] text-ink-600">هذه المساحة مرتبطة مباشرة بعملية الاستيراد الحالية، وليست قراءة عامة من مصدر آخر.</p>
            </div>
            <span className={
              sourceEvidenceStatus === 'VERIFIED'
                ? 'rounded-full bg-success-50 px-2.5 py-1 text-[9px] font-black text-success-700'
                : sourceEvidenceStatus === 'REVIEW'
                  ? 'rounded-full bg-warning-50 px-2.5 py-1 text-[9px] font-black text-warning-800'
                  : 'rounded-full bg-ink-100 px-2.5 py-1 text-[9px] font-black text-ink-700'
            }>
              {sourceEvidenceStatus}
            </span>
          </div>
        </div>
        {sourceSnapshot ? (
          <>
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-6">
            <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-3"><div className="text-[9px] text-ink-400">المصدر</div><div className="mt-1 break-all text-[11px] font-black text-ink-900">{String(sourceSnapshot.metadata.fileName ?? sourceSnapshot.source_path)}</div></div>
            <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-3"><div className="text-[9px] text-primary-700">AS OF</div><time dateTime={sourceSnapshot.created_at} className="mt-1 block text-[11px] font-black text-ink-900">{sourceSnapshot.created_at ? new Date(sourceSnapshot.created_at).toLocaleString('ar-YE') : 'غير متاح'}</time><div className="mt-1 text-[8px] text-ink-400">وقت إنشاء Snapshot الدليل</div></div>
            <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-3"><div className="text-[9px] text-ink-400">الجودة</div><div className="mt-1 text-[15px] font-black text-ink-900">{sourceSnapshot.quality_score == null ? 'غير متاح' : sourceSnapshot.quality_score + '%'}</div></div>
            <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-3"><div className="text-[9px] text-ink-400">الصفوف</div><div className="mt-1 text-[15px] font-black text-ink-900">{sourceSnapshot.row_count}</div></div>
            <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-3"><div className="text-[9px] text-ink-400">حالة التحليل</div><div className="mt-1 text-[11px] font-black text-ink-900">{sourceSnapshot.analysis_status || 'غير متاح'}</div></div>
            <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-3"><div className="text-[9px] text-ink-400">مجموعات البيانات</div><div className="mt-1 text-[15px] font-black text-ink-900">{sourceSnapshot.datasets.length}</div></div>
            <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-3"><div className="text-[9px] text-ink-400">البصمة</div><div className="mt-1 break-all font-mono text-[9px] text-ink-700">{sourceSnapshot.source_hash}</div></div>
          </div>
          <div className="border-t border-primary-100 p-4">
            <div className="text-[9px] font-black tracking-[.12em] text-primary-700">DATASET UNDERSTANDING</div>
            <div className="mt-2 space-y-2">
              {sourceSnapshot.datasets.length ? sourceSnapshot.datasets.slice(0, 8).map((dataset, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-xl border border-ink-100 bg-ink-50/35 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-black text-ink-900">{String(dataset.name ?? dataset.sheet ?? ('Dataset ' + (index + 1)))}</div>
                    <div className="mt-1 text-[9px] text-ink-400">{String(dataset.specialty ?? 'other')} · {dataset.columnCount == null ? 'غير متاح' : String(dataset.columnCount)} أعمدة</div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[9px] font-bold text-ink-600">
                    <span className="rounded-full bg-white px-2 py-1">الصفوف {dataset.rowCount == null ? 'غير متاح' : String(dataset.rowCount)}</span>
                    <span className="rounded-full bg-white px-2 py-1">ثقة {dataset.specialtyConfidence == null ? 'غير متاح' : String(dataset.specialtyConfidence) + '%'}</span>
                    <span className="rounded-full bg-white px-2 py-1">الجودة {String(dataset.qualityScore ?? 'غير متاحة')}</span>
                  </div>
                </div>
              )) : <div className="rounded-xl border border-warning-200 bg-warning-50 p-3 text-[10px] text-warning-900">لا توجد ملخصات Dataset مثبتة.</div>}
            </div>
            {!!sourceSnapshot.warnings.length && <div className="mt-3 rounded-xl border border-warning-200 bg-warning-50/70 p-3 text-[10px] leading-5 text-warning-900"><strong>تحذيرات المصدر:</strong> {sourceSnapshot.warnings.join(' · ')}</div>}
          </div>
          </>
        ) : (
          <div className="p-4">
            <div className="rounded-xl border border-warning-200 bg-warning-50/70 p-4 text-[11px] leading-6 text-warning-900">
              تم تمرير العملية إلى المسار التشغيلي، لكن Snapshot الدليل المرتبط بهذا الاستيراد غير مثبت. لن تُرفع الثقة ولن تُعتبر هذه العملية دليلًا مكتملًا.
            </div>
          </div>
        )}
      </section>
    )}

    <section className="ag-decision-strip" aria-label="ملخص الثقة">
      <div className="ag-decision-cell"><span className="ag-decision-label">الحالة الحالية</span><span className="ag-decision-value">{statusLabel}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">السجلات</span><span className="ag-decision-value">{totalRecords == null ? 'غير متاح' : totalRecords}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">المشكلات</span><span className="ag-decision-value">{issueTotal ?? 'غير متاح'}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">الحرجة</span><span className="ag-decision-value">{criticalIssueTotal}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">الخطوة التالية</span><span className="ag-decision-value">{nextStep.label}</span></div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {states.map(({ title, text, tone, icon: Icon }) => <Card key={title} className="ag-dashboard-module"><CardBody>
        <div className="flex items-center justify-between gap-3"><span className={'rounded-full px-2.5 py-1 text-[9px] font-black '+tone}>{title}</span><Icon size={18} className="text-ink-400"/></div>
        <p className="mt-4 text-xs leading-6 text-ink-500">{text}</p>
      </CardBody></Card>)}
    </section>

    <section className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
      <Card>
        <CardHeader title="حالة جودة البيانات الحالية" subtitle={snapshot?.status === 'EMPTY' ? 'لا توجد بيانات بعد' : 'قراءة المصدر الحالية'} />
        <CardBody>
          {snapshot?.entities?.length ? (
            <div className="space-y-2.5">
              {snapshot.entities.slice(0, 8).map(entity => (
                <div key={entity.name} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-ink-50/40 px-3 py-3">
                  <span className="min-w-0 text-xs font-bold text-ink-800">{entity.name}</span>
                  <span className="shrink-0 text-xs font-black text-ink-500">{entity.issues ?? 'غير متاح'} مشكلة</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="لا توجد بيانات مثبتة بعد"
              message="ابدأ بمصدر حقيقي حتى تتحول هذه المساحة إلى حالة جودة وأدلة قابلة للفحص."
              action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="مسارات الإثبات" subtitle="كل مسار موصول بما هو متاح فعليًا، وما لم يثبت يبقى معلنًا." />
        <CardBody className="grid gap-2.5 sm:grid-cols-2">
          {evidenceSurfaces.map(surface => surface.available
            ? <Link key={surface.title} to={surface.path} className="group flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-3 transition hover:border-primary-200 hover:bg-primary-50/40">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700"><surface.icon size={15}/></div>
                <span className="min-w-0 flex-1"><strong className="block text-xs text-ink-800">{surface.title}</strong><span className="mt-1 block text-[10px] leading-5 text-ink-400">{surface.detail}</span><span className="mt-2 block text-[9px] font-black text-primary-700">فتح المسار <ArrowLeft size={11} className="inline"/></span></span>
              </Link>
            : <div key={surface.title} className="rounded-xl border border-warning-200 bg-warning-50/50 p-3">
                <div className="flex items-start gap-3"><surface.icon size={15} className="mt-0.5 shrink-0 text-warning-700"/><div><div className="text-xs font-black text-ink-800">{surface.title}</div><div className="mt-1 text-[10px] leading-5 text-warning-900">{surface.detail}</div><span className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[8px] font-black text-warning-800">غير مثبت</span></div></div>
              </div>)}
        </CardBody>
      </Card>
    </section>

    <Link to={nextStep.path} className="block rounded-[16px] border border-primary-200 bg-primary-50/60 p-4 transition hover:border-primary-300 hover:bg-primary-50" aria-label={'الخطوة التالية: ' + nextStep.label}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="text-[9px] font-black tracking-[.12em] text-primary-700">NEXT TRUST ACTION</div><div className="mt-1 text-sm font-black text-ink-950">{nextStep.label}</div><div className="mt-1 text-[10px] leading-5 text-ink-600">{nextStep.detail}</div></div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-ink-950 px-3 py-2 text-[10px] font-black text-white">فتح الآن <ArrowLeft size={13}/></span>
      </div>
    </Link>

    <div className="rounded-2xl border border-warning-200 bg-warning-50/60 p-4 text-xs leading-6 text-warning-800">
      الثقة لا تُستنتج من شكل الواجهة. أي غياب في المصدر أو السلسلة أو العينة يبقى ظاهرًا كـ REVIEW / BLOCKED / INSUFFICIENT DATA.
    </div>
  </div>;
}