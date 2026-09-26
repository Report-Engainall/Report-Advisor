import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock3, Filter, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { fetchImportRecords, fetchWorkerHealthSnapshot, type WorkerHealthSnapshot } from '@/lib/queries';
import type { ImportRecord } from '@/lib/types';
import { formatNumber } from '@/lib/format';

type FilterKey = 'all' | 'active' | 'review' | 'completed' | 'failed';
const statusLabel = (s: string | null) => ({ queued: 'بالانتظار', processing: 'قيد التنفيذ', completed: 'مكتمل', partial: 'مكتمل جزئيًا', failed: 'فشل', cancelled: 'ملغى' }[s ?? ''] ?? 'غير معروف');
const statusClass = (s: string | null) => s === 'completed' ? 'bg-success-50 text-success-700' : s === 'failed' ? 'bg-danger-50 text-danger-700' : s === 'partial' ? 'bg-warning-50 text-warning-700' : s === 'processing' ? 'bg-primary-50 text-primary-700' : 'bg-ink-50 text-ink-600';
function matches(row: ImportRecord, filter: FilterKey) {
  if (filter === 'all') return true;
  if (filter === 'active') return row.status === 'queued' || row.status === 'processing';
  if (filter === 'review') return row.status === 'partial' || (row.invalid_rows ?? 0) > 0 || (row.quarantined_rows ?? 0) > 0;
  if (filter === 'completed') return row.status === 'completed';
  return row.status === 'failed' || row.status === 'cancelled';
}

export function WorkCenterPage() {
  const [rows, setRows] = useState<ImportRecord[]>([]);
  const [workerHealth, setWorkerHealth] = useState<WorkerHealthSnapshot | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [imports, health] = await Promise.all([fetchImportRecords(), fetchWorkerHealthSnapshot()]);
      setRows(imports);
      setWorkerHealth(health);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل مركز العمليات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => rows.filter(r => matches(r, filter)), [rows, filter]);
  const queueEmptyState = rows.length === 0
    ? { title: 'لا توجد عمليات تشغيل مثبتة', message: 'لا توجد عمليات استيراد مسجلة لهذا المستأجر حتى الآن؛ ابدأ بالمصدر الموحد لبناء أول دورة تشغيل قابلة للتتبع.' }
    : { title: 'لا توجد عمليات مطابقة', message: 'غيّر عامل التصفية أو اعرض السجل الكامل للوصول إلى العمليات المسجلة.' };
  const counts = useMemo(() => ({
    active: rows.filter(r => r.status === 'queued' || r.status === 'processing').length,
    review: rows.filter(r => r.status === 'partial' || (r.invalid_rows ?? 0) > 0 || (r.quarantined_rows ?? 0) > 0).length,
    completed: rows.filter(r => r.status === 'completed').length,
    failed: rows.filter(r => r.status === 'failed' || r.status === 'cancelled').length,
  }), [rows]);
  const zeroProgressActive = useMemo(
    () => rows.filter(r => (r.status === 'queued' || r.status === 'processing') && Number(r.progress ?? 0) === 0).length,
    [rows],
  );
  const historyWindowNotice = rows.length >= 500
    ? 'المعروض هو أحدث 500 عملية ضمن نافذة القراءة الحالية؛ لا يُستخدم كإجمالي تاريخي كامل.'
    : 'المعروض هو السجل الذي أعادته نافذة القراءة الحالية.';

  const nextAction = (workerHealth?.expiredActive ?? 0) > 0
    ? { kind: 'refresh' as const, tone: 'danger' as const, title: 'إعادة فحص العامل الآن', message: 'هناك leases منتهية مثبتة في القراءة الحالية؛ أعد قراءة الحالة بعد دورة recovery التشغيلية بدل اعتبار الطابور سليمًا.', label: 'إعادة فحص العامل' }
    : workerHealth && !workerHealth.activeReadComplete
      ? { kind: 'refresh' as const, tone: 'warning' as const, title: 'قراءة العامل جزئية', message: 'لم تُقرأ كل leases النشطة؛ لا يمكن تحويل القراءة الجزئية إلى حكم سلامة كامل. أعد الفحص عند الحاجة.', label: 'إعادة قراءة العامل' }
      : zeroProgressActive > 0
        ? { kind: 'filter' as const, filter: 'active' as FilterKey, tone: 'warning' as const, title: 'تحقق من العمليات دون تقدم', message: 'هناك عمليات نشطة بتقدم 0%. هذه إشارة تشغيلية للمراجعة وليست دليل نجاح أو فشل تلقائي.', label: 'عرض العمليات دون تقدم' }
        : counts.review > 0
        ? { kind: 'filter' as const, filter: 'review' as FilterKey, tone: 'warning' as const, title: 'راجع الاستثناءات أولًا', message: 'هناك عمليات تحتوي على مراجعة أو صفوف غير صالحة/معزولة؛ ابدأ بها قبل اعتبار الطابور مستقرًا.', label: 'عرض المراجعة' }
        : counts.failed > 0
          ? { kind: 'filter' as const, filter: 'failed' as FilterKey, tone: 'danger' as const, title: 'راجع عمليات الفشل', message: 'هناك عمليات فاشلة أو ملغاة؛ افتحها قبل بدء دورة جديدة حتى لا يضيع سبب التعثر.', label: 'عرض الفشل' }
          : counts.active > 0
            ? { kind: 'filter' as const, filter: 'active' as FilterKey, tone: 'primary' as const, title: 'تابع العمليات النشطة', message: 'هناك عمليات في الطابور أو التنفيذ. اعرضها مباشرة بدل القفز إلى سجل مكتمل.', label: 'عرض النشطة' }
            : rows.length === 0
              ? { kind: 'import' as const, tone: 'primary' as const, title: 'ابدأ أول دورة تشغيل من المصدر الموحد', message: 'لا توجد عمليات مسجلة لهذا المستأجر بعد؛ نقطة البدء الصحيحة هي الاستيراد الكانوني الموحد.', label: 'إدخال مصدر' }
              : { kind: 'import' as const, tone: 'success' as const, title: 'لا يوجد استثناء حرج مثبت الآن', message: 'السجل الحالي لا يحتوي على حالات نشطة أو مراجعة أو فشل؛ يمكنك بدء مصدر جديد دون إنشاء مسار بديل.', label: 'إدخال مصدر جديد' };

  if (loading) return <LoadingState message="جارٍ تحميل حالة العمليات..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return <div dir="rtl" className="space-y-5 animate-fade-in pb-10">
    <PageHeader
      title="مركز العمل"
      subtitle="طابور العمل والاستثناءات: ما الذي ينتظر، ما الذي يحتاج مراجعة، وما الذي اكتمل فعليًا."
      actions={<button type="button" onClick={() => void load()} className="btn-secondary inline-flex items-center gap-2"><RefreshCw size={16}/> تحديث</button>}
    />

    <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <Card className="ag-operational-hero hero-surface overflow-hidden">
        <CardBody>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary-700"><Activity size={15}/> الحقيقة التشغيلية</div>
              <h2 className="mt-2 text-xl font-black tracking-tight text-ink-950">كل عملية مرتبطة بمصدر وحالة فعلية</h2>
              <p className="mt-2 max-w-2xl text-[12px] leading-6 text-ink-500">هذه الصفحة تقرأ حالة الاستيراد المعتمدة فقط؛ لا تنشئ حالة بديلة ولا تعتبر العرض المحلي دليلًا على نجاح قاعدة البيانات.</p>
            </div>
            <div className="card-subtle px-4 py-3 text-xs text-ink-600">
              <div className="flex items-center gap-2 font-bold text-ink-800"><ShieldCheck size={15} className="text-primary-600"/> مصدر الحالة</div>
              <div className="mt-1 font-semibold text-ink-700">مسار المصدر والحالة الكانونية</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([
              ['النشطة', counts.active, Activity, 'primary'],
              ['المراجعة', counts.review, AlertTriangle, 'warning'],
              ['المكتملة', counts.completed, CheckCircle2, 'success'],
              ['الفشل / الإلغاء', counts.failed, XCircle, 'danger'],
            ] as const).map(([label, value, Icon]) => (
              <button key={label} type="button" onClick={() => setFilter(label === 'النشطة' ? 'active' : label === 'المراجعة' ? 'review' : label === 'المكتملة' ? 'completed' : 'failed')} className="card-subtle p-3 text-right transition-colors hover:border-ink-300 hover:bg-white">
                <Icon size={16} className="mb-2 text-primary-600"/>
                <div className="display-number text-[1.45rem]">{formatNumber(value)}</div>
                <div className="mt-1 text-[11px] font-semibold text-ink-500">{label}</div>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="منطق الحالة" subtitle="قراءة فقط؛ لا يوجد مسار موازٍ للحالة."/>
        <CardBody>
          <div className="space-y-3">
            {[
              ['المصدر', 'الملف/العملية الأصلية', 'text-primary-600'],
              ['المعالجة', 'queued → processing', 'text-accent-600'],
              ['التحقق', 'صالح / مراجعة / مرفوض', 'text-warning-600'],
              ['النتيجة', 'اكتمل فقط عند وجود حالة نهائية مصدرية', 'text-success-600'],
            ].map(([label, detail, tone]) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-3">
                <span className={`mt-0.5 h-2 w-2 rounded-full bg-current ${tone}`}/>
                <div><div className="text-xs font-bold text-ink-800">{label}</div><div className="mt-1 text-xs text-ink-500">{detail}</div></div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
      <Card>
        <CardHeader title="صحة العامل" subtitle="قراءة مباشرة من مسار التنفيذ durable؛ لا تُعلن الحالة سليمة إذا بقيت lease منتهية." action={workerHealth ? <span className={`badge ${workerHealth.expiredActive > 0 ? 'badge-danger' : workerHealth.activeReadComplete ? 'badge-success' : 'badge-warning'}`}>{(workerHealth.expiredActive ?? 0) > 0 ? 'تحتاج تدخل' : workerHealth.activeReadComplete ? 'لا توجد leases منتهية' : 'قراءة جزئية'}</span> : undefined}/>
        <CardBody>
          {workerHealth ? <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4"><div className="text-[10px] text-ink-400">بالانتظار</div><div className="mt-2 text-2xl font-black text-ink-950">{formatNumber(workerHealth.queued)}</div></div>
            <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4"><div className="text-[10px] text-ink-400">قيد التنفيذ</div><div className="mt-2 text-2xl font-black text-ink-950">{formatNumber(workerHealth.active)}</div></div>
            <div className={`rounded-2xl border p-4 ${(workerHealth.expiredActive ?? 0) > 0 ? 'border-danger-200 bg-danger-50/60' : 'border-success-200 bg-success-50/60'}`}><div className="text-[10px] text-ink-500">leases منتهية</div><div className={`mt-2 text-2xl font-black ${(workerHealth.expiredActive ?? 0) > 0 ? 'text-danger-700' : 'text-success-700'}`}>{formatNumber(workerHealth.expiredActive)}</div></div>
          </div> : <div className="text-xs text-ink-400">لم تتوفر قراءة العامل بعد.</div>}
          {workerHealth && !workerHealth.activeReadComplete && <div className="mt-3 rounded-xl border border-warning-200 bg-warning-50/70 px-3 py-2 text-[10px] leading-5 text-warning-900">القراءة محدودة بـ500 lease نشطة؛ لا تُفسَّر كحكم كامل على العامل.</div>}
        </CardBody>
      </Card>
      <Card variant={nextAction.tone === 'danger' ? 'alert' : nextAction.tone === 'warning' ? 'alert' : nextAction.tone === 'success' ? 'evidence' : 'standard'}>
        <CardHeader title="الإجراء التالي" subtitle="يُشتق مباشرة من الحالة التشغيلية الحالية؛ المعالجة الفعلية تبقى داخل المسارات الكانونية." />
        <CardBody>
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className={nextAction.tone === 'danger' ? 'text-danger-700 mt-0.5' : nextAction.tone === 'warning' ? 'text-warning-700 mt-0.5' : nextAction.tone === 'success' ? 'text-success-700 mt-0.5' : 'text-primary-700 mt-0.5'} />
            <div className="min-w-0">
              <div className="text-sm font-black text-ink-900">{nextAction.title}</div>
              <div aria-live="polite" className="mt-1 text-[11px] leading-5 text-ink-600">{nextAction.message}</div>
              <div className="mt-4">
                {nextAction.kind === 'refresh' && (
                  <button type="button" onClick={() => void load()} className="btn-secondary text-xs">{nextAction.label}</button>
                )}
                {nextAction.kind === 'filter' && (
                  <button type="button" onClick={() => setFilter(nextAction.filter)} className="btn-secondary text-xs">{nextAction.label}</button>
                )}
                {nextAction.kind === 'import' && (
                  <Link to="/import" className="btn-primary inline-flex text-xs">{nextAction.label}</Link>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>

    <section className="ag-decision-strip" aria-label="ملخص التشغيل">
      <div className="ag-decision-cell"><span className="ag-decision-label">{rows.length >= 500 ? 'نافذة العرض' : 'السجل المعروض'}</span><span className="ag-decision-value">{rows.length >= 500 ? 'أحدث 500' : formatNumber(rows.length)}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">نشطة</span><span className="ag-decision-value">{formatNumber(counts.active)}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">تحتاج مراجعة</span><span className="ag-decision-value">{formatNumber(counts.review)}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">مكتملة</span><span className="ag-decision-value">{formatNumber(counts.completed)}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">فشل / إلغاء</span><span className="ag-decision-value">{formatNumber(counts.failed)}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">نشطة بلا تقدم</span><span className="ag-decision-value">{formatNumber(zeroProgressActive)}</span></div>
    </section>

    <Card>
      <CardHeader title="طابور العمل" subtitle="ابدأ من الاستثناءات والحالات النشطة، ثم استخدم نافذة العرض الحالية دون اعتبارها إجمالي التاريخ."/>
      <CardBody>
        <div role="status" className="mb-4 rounded-xl border border-ink-200 bg-ink-50/70 px-3 py-2 text-[10px] leading-5 text-ink-500">
          {historyWindowNotice}
        </div>
        <div className="mb-5 flex flex-wrap items-center gap-2" role="toolbar" aria-label="تصفية العمليات">
          <Filter size={16} className="text-ink-400"/>
          {(['all','active','review','completed','failed'] as FilterKey[]).map(k => (
            <button key={k} type="button" onClick={() => setFilter(k)} aria-pressed={filter === k} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === k ? 'bg-ink-950 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'}`}>
              {k === 'all' ? 'الكل' : k === 'active' ? 'النشطة' : k === 'review' ? 'المراجعة' : k === 'completed' ? 'المكتملة' : 'الفاشلة'}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            title={queueEmptyState.title}
            message={queueEmptyState.message}
            action={rows.length === 0 ? (
              <Link to="/import" className="btn-primary mt-1 inline-flex items-center gap-2">إدخال مصدر من المسار الموحد</Link>
            ) : (
              <button type="button" onClick={() => setFilter('all')} className="btn-secondary mt-1">عرض كل العمليات</button>
            )}
          />
        ) : (
          <DataTable
            data={filtered}
            emptyMessage="لا توجد عمليات"
            columns={[
              { key: 'file', label: 'المصدر', render: (r: ImportRecord) => <div><div className="font-semibold text-ink-800">{r.file_name}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-ink-400"><span>{r.source_type || 'مصدر عام'}</span><span>•</span><span>المعرّف التشغيلي محفوظ داخليًا</span></div></div> },
              { key: 'status', label: 'الحالة', align: 'center', render: (r: ImportRecord) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(r.status)}`}>{statusLabel(r.status)}</span> },
              { key: 'progress', label: 'التقدم', align: 'center', render: (r: ImportRecord) => r.progress == null ? '—' : <div className="min-w-24" aria-label={'تقدم العملية ' + Math.max(0, Math.min(100, r.progress)) + '%'}><div className="text-xs font-bold">{Math.max(0, Math.min(100, r.progress))}%</div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, r.progress))} aria-label="نسبة اكتمال العملية"><div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.max(0, Math.min(100, r.progress))}%` }}/></div></div> },
              { key: 'valid', label: 'البيانات المقبولة', align: 'center', render: (r: ImportRecord) => r.valid_rows == null ? 'غير متاح' : formatNumber(r.valid_rows) },
              { key: 'exceptions', label: 'الاستثناءات', align: 'center', render: (r: ImportRecord) => <span className={(r.invalid_rows ?? 0) + (r.quarantined_rows ?? 0) > 0 ? 'font-semibold text-warning-700' : 'text-ink-500'}>{formatNumber((r.invalid_rows ?? 0) + (r.quarantined_rows ?? 0))}</span> },
              { key: 'updated', label: 'آخر تحديث', align: 'center', render: (r: ImportRecord) => <span className="inline-flex items-center gap-1 text-xs text-ink-500"><Clock3 size={13}/>{new Date(r.completed_at ?? r.created_at).toLocaleString('ar-YE')}</span> },
            ]}
          />
        )}
      </CardBody>
    </Card>
  </div>;
}
