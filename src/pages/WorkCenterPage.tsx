import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock3, Filter, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
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
  const counts = useMemo(() => ({
    active: rows.filter(r => r.status === 'queued' || r.status === 'processing').length,
    review: rows.filter(r => r.status === 'partial' || (r.invalid_rows ?? 0) > 0 || (r.quarantined_rows ?? 0) > 0).length,
    completed: rows.filter(r => r.status === 'completed').length,
    failed: rows.filter(r => r.status === 'failed' || r.status === 'cancelled').length,
  }), [rows]);
  const nextAction = useMemo(() => {
    if ((workerHealth?.expiredActive ?? 0) > 0) return { key: 'review', title: 'راجع الحالات المتعثرة', detail: 'توجد leases منتهية؛ اعرض السجل النشط لمراجعة الحالات قبل recovery التشغيلي.', filter: 'active' as FilterKey, tone: 'danger' };
    if (counts.review > 0) return { key: 'review', title: 'ابدأ من الاستثناءات', detail: 'هناك عمليات تحتاج مراجعة بسبب صفوف غير صالحة أو معزولة.', filter: 'review' as FilterKey, tone: 'warning' };
    if (counts.failed > 0) return { key: 'failed', title: 'افحص العمليات الفاشلة', detail: 'هناك عمليات نهائية فاشلة أو ملغاة تحتاج معرفة سببها قبل إعادة التشغيل.', filter: 'failed' as FilterKey, tone: 'danger' };
    if (counts.active > 0) return { key: 'active', title: 'تابع العمليات النشطة', detail: 'هناك عمليات قيد التنفيذ أو الانتظار لم تصل بعد إلى حالة نهائية.', filter: 'active' as FilterKey, tone: 'primary' };
    return { key: 'clear', title: 'لا توجد متابعة عاجلة', detail: 'السجل الحالي لا يحتوي على استثناءات أو عمليات نشطة ظاهرة في هذه اللقطة.', filter: 'all' as FilterKey, tone: 'success' };
  }, [counts, workerHealth]);

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
          <div className={`mb-5 rounded-2xl border p-4 ${nextAction.tone === 'danger' ? 'border-danger-200 bg-danger-50/70' : nextAction.tone === 'warning' ? 'border-warning-200 bg-warning-50/70' : nextAction.tone === 'primary' ? 'border-primary-200 bg-primary-50/70' : 'border-success-200 bg-success-50/70'}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-[9px] font-black tracking-[.12em] text-ink-400">NEXT OPERATIONAL ACTION</div>
                <div className="mt-1 text-sm font-black text-ink-900">{nextAction.title}</div>
                <p className="mt-1 text-[10px] leading-5 text-ink-600">{nextAction.detail}</p>
              </div>
              <button type="button" aria-label={`الخطوة التالية: ${nextAction.title}`} onClick={() => setFilter(nextAction.filter)} className="shrink-0 rounded-xl bg-ink-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-ink-800">
                فتح الحالات ذات الصلة ←
              </button>
            </div>
          </div>
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
        <CardHeader title="صحة العامل" subtitle="قراءة مباشرة من مسار التنفيذ durable؛ لا تُعلن الحالة سليمة إذا بقيت lease منتهية." action={workerHealth ? <span className={`badge ${workerHealth.expiredActive > 0 ? 'badge-danger' : workerHealth.activeReadComplete ? 'badge-success' : 'badge-warning'}`}>{workerHealth.expiredActive > 0 ? 'تحتاج تدخل' : workerHealth.activeReadComplete ? 'لا توجد leases منتهية' : 'قراءة جزئية'}</span> : undefined}/>
        <CardBody>
          {workerHealth ? <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4"><div className="text-[10px] text-ink-400">بالانتظار</div><div className="mt-2 text-2xl font-black text-ink-950">{formatNumber(workerHealth.queued)}</div></div>
            <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4"><div className="text-[10px] text-ink-400">قيد التنفيذ</div><div className="mt-2 text-2xl font-black text-ink-950">{formatNumber(workerHealth.active)}</div></div>
            <div className={`rounded-2xl border p-4 ${workerHealth.expiredActive > 0 ? 'border-danger-200 bg-danger-50/60' : 'border-success-200 bg-success-50/60'}`}><div className="text-[10px] text-ink-500">leases منتهية</div><div className={`mt-2 text-2xl font-black ${workerHealth.expiredActive > 0 ? 'text-danger-700' : 'text-success-700'}`}>{formatNumber(workerHealth.expiredActive)}</div></div>
          </div> : <div className="text-xs text-ink-400">لم تتوفر قراءة العامل بعد.</div>}
          {workerHealth && !workerHealth.activeReadComplete && <div className="mt-3 rounded-xl border border-warning-200 bg-warning-50/70 px-3 py-2 text-[10px] leading-5 text-warning-900">القراءة محدودة بـ500 lease نشطة؛ لا تُفسَّر كحكم كامل على العامل.</div>}
        </CardBody>
      </Card>
      <Card variant={workerHealth?.expiredActive ? 'alert' : 'evidence'}>
        <CardHeader title="قرار الحالة" subtitle="المعالجة الفعلية للـlease تتم عبر مسار recovery الكانوني، وليس من هذه الواجهة." />
        <CardBody>
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className={workerHealth?.expiredActive ? 'text-danger-700 mt-0.5' : 'text-success-700 mt-0.5'} />
            <div className="text-[11px] leading-5 text-ink-600">{workerHealth?.expiredActive ? 'هناك leases منتهية تحتاج recovery من مسار التشغيل.' : 'لا توجد leases منتهية في القراءة الحالية؛ العامل لا يملك حالة عالقة مثبتة في هذه اللحظة.'}</div>
          </div>
        </CardBody>
      </Card>
    </section>

    <section className="ag-decision-strip" aria-label="ملخص التشغيل">
      <div className="ag-decision-cell"><span className="ag-decision-label">إجمالي السجل</span><span className="ag-decision-value">{formatNumber(rows.length)}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">نشطة</span><span className="ag-decision-value">{formatNumber(counts.active)}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">تحتاج مراجعة</span><span className="ag-decision-value">{formatNumber(counts.review)}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">مكتملة</span><span className="ag-decision-value">{formatNumber(counts.completed)}</span></div>
      <div className="ag-decision-cell"><span className="ag-decision-label">فشل / إلغاء</span><span className="ag-decision-value">{formatNumber(counts.failed)}</span></div>
    </section>

    <Card>
      <CardHeader title="طابور العمل" subtitle="ابدأ من الاستثناءات والحالات النشطة، ثم انتقل إلى السجل الكامل عند الحاجة."/>
      <CardBody>
        <div className="mb-5 flex flex-wrap items-center gap-2" role="toolbar" aria-label="تصفية العمليات">
          <Filter size={16} className="text-ink-400"/>
          {(['all','active','review','completed','failed'] as FilterKey[]).map(k => (
            <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === k ? 'bg-ink-950 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'}`}>
              {k === 'all' ? 'الكل' : k === 'active' ? 'النشطة' : k === 'review' ? 'المراجعة' : k === 'completed' ? 'المكتملة' : 'الفاشلة'}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="لا توجد عمليات مطابقة" message={rows.length === 0 ? 'لا توجد عمليات استيراد مسجلة لهذا المستأجر حتى الآن.' : 'غيّر عامل التصفية لرؤية عمليات أخرى.'}/>
        ) : (
          <DataTable
            data={filtered}
            emptyMessage="لا توجد عمليات"
            columns={[
              { key: 'file', label: 'المصدر', render: (r: ImportRecord) => <div><div className="font-semibold text-ink-800">{r.file_name}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-ink-400"><span>{r.source_type || 'مصدر عام'}</span><span>•</span><span>المعرّف التشغيلي محفوظ داخليًا</span></div></div> },
              { key: 'status', label: 'الحالة', align: 'center', render: (r: ImportRecord) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(r.status)}`}>{statusLabel(r.status)}</span> },
              { key: 'progress', label: 'التقدم', align: 'center', render: (r: ImportRecord) => r.progress == null ? '—' : <div className="min-w-24"><div className="text-xs font-bold">{Math.max(0, Math.min(100, r.progress))}%</div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.max(0, Math.min(100, r.progress))}%` }}/></div></div> },
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
