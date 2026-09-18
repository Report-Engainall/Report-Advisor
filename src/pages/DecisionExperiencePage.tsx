import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bell, FileSearch, Lightbulb, ShieldCheck, Target, Workflow } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { fetchAlerts, fetchRecommendations } from '@/lib/queries';
import type { Alert, Recommendation } from '@/lib/types';

type Stage = 'command' | 'evidence' | 'decision' | 'approval' | 'work' | 'outcome';
const stages: { id: Stage; label: string; description: string }[] = [
  { id: 'command', label: 'مركز القيادة', description: 'المعلومة والأولوية' },
  { id: 'evidence', label: 'الدليل', description: 'المصدر والسياق' },
  { id: 'decision', label: 'القرار', description: 'التوصية والسبب' },
  { id: 'approval', label: 'الموافقة', description: 'المسؤولية والاعتماد' },
  { id: 'work', label: 'التنفيذ', description: 'العمل والمتابعة' },
  { id: 'outcome', label: 'النتيجة والتعلّم', description: 'المتوقع → الفعلي' },
];

const priorityLabel = (value: string) => {
  const mapped = { critical: 'يتطلب تدخلًا', high: 'أولوية عالية', medium: 'أولوية متوسطة', low: 'متابعة' }[value.toLowerCase() as 'critical' | 'high' | 'medium' | 'low'];
  return mapped ?? (value || 'غير محددة');
};

const statusLabel = (value: string) => {
  const mapped = { new: 'جديدة', accepted: 'مقبولة للمراجعة التشغيلية', rejected: 'مرفوضة', pending: 'قيد المراجعة' }[value.toLowerCase() as 'new' | 'accepted' | 'rejected' | 'pending'];
  return mapped ?? (value || 'غير محددة');
};

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString('ar-YE') : 'غير متاح';
}

function formatNumber(value: number | null) {
  return value == null ? 'غير متاح' : new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 2 }).format(value);
}

function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-6 text-center"><p className="font-semibold text-ink-800">{title}</p><p className="mt-2 text-xs leading-6 text-ink-500">{detail}</p></div>;
}

function Blocked({ children }: { children: string }) {
  return <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{children}</div>;
}

export function DecisionExperiencePage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('stage') as Stage | null;
  const [stage, setStage] = useState<Stage>(stages.some(s => s.id === requested) ? requested! : 'command');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedId, setSelectedId] = useState(params.get('recommendationId'));
  const [selectedAlertId, setSelectedAlertId] = useState(params.get('alertId'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recs, alertRows] = await Promise.all([fetchRecommendations(), fetchAlerts()]);
      setRecommendations(recs);
      setAlerts(alertRows);
      setSelectedId(current => current && recs.some(x => x.id === current)
        ? current
        : recs.find(x => x.status === 'new' || x.status === 'accepted')?.id ?? recs[0]?.id ?? null);
      setSelectedAlertId(current => current && alertRows.some(x => x.id === current)
        ? current
        : alertRows[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل بيانات القرار.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (requested && stages.some(s => s.id === requested)) setStage(requested);
    const requestedId = params.get('recommendationId');
    const requestedAlertId = params.get('alertId');
    if (requestedId) {
      setSelectedId(requestedId);
      setSelectedAlertId(null);
    } else if (requestedAlertId) {
      setSelectedAlertId(requestedAlertId);
      setSelectedId(null);
    }
  }, [params, requested]);

  const selected = recommendations.find(r => r.id === selectedId) ?? null;
  const selectedAlert = alerts.find(a => a.id === selectedAlertId) ?? null;
  const selectedSignal = selected || selectedAlert;
  const primarySignal = (() => {
    const rank = (value: string) => ({ critical: 4, high: 3, warning: 2, medium: 2, low: 1, opportunity: 1 }[value.toLowerCase()] ?? 0);
    const alert = [...alerts].sort((a, b) => rank(b.severity) - rank(a.severity))[0];
    const recommendation = [...recommendations].filter(r => r.status === 'new' || r.status === 'accepted').sort((a, b) => rank(b.priority) - rank(a.priority))[0] ?? [...recommendations].sort((a, b) => rank(b.priority) - rank(a.priority))[0];
    if (!alert && !recommendation) return null;
    if (!recommendation) return { kind: 'alert' as const, item: alert! };
    if (!alert) return { kind: 'recommendation' as const, item: recommendation };
    return rank(alert.severity) >= rank(recommendation.priority)
      ? { kind: 'alert' as const, item: alert }
      : { kind: 'recommendation' as const, item: recommendation };
  })();
  const stageIndex = Math.max(0, stages.findIndex(s => s.id === stage));

  const go = (next: Stage, recommendationId = selectedId, alertId = selectedAlertId) => {
    setStage(next);
    const p = new URLSearchParams(params);
    p.set('stage', next);
    if (recommendationId) p.set('recommendationId', recommendationId); else p.delete('recommendationId');
    if (alertId) p.set('alertId', alertId); else p.delete('alertId');
    setParams(p, { replace: true });
  };

  const selectRecommendation = (id: string, next: Stage = 'evidence') => {
    setSelectedId(id);
    setSelectedAlertId(null);
    go(next, id, null);
  };

  const selectAlert = (id: string, next: Stage = 'evidence') => {
    setSelectedAlertId(id);
    setSelectedId(null);
    go(next, null, id);
  };

  return <div dir="rtl" className="space-y-5 pb-8">
    <header className="hero-surface overflow-hidden p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-primary-700"><Workflow size={17}/> منظومة القرار التنفيذية</div>
        <span className="badge-neutral">المرحلة {String(stageIndex + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}</span>
      </div>
      <h1 className="mt-2 text-[24px] font-black tracking-tight text-ink-950 lg:text-[28px]">من الإشارة إلى الدليل، ثم القرار والنتيجة</h1>
      <p className="mt-2 max-w-3xl text-[12px] leading-6 text-ink-500">الصفحة تحمل الإشارة من المصدر الكانوني إلى مسار القرار، لكنها لا ترفع التوصية أو التنبيه إلى مرتبة الدليل التشغيلي تلقائيًا.</p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-ink-100" aria-label="تقدم دورة القرار" role="progressbar" aria-valuemin={1} aria-valuemax={stages.length} aria-valuenow={stageIndex + 1}>
        <div className="h-full rounded-full bg-primary-600 transition-all duration-300" style={{ width: ((stageIndex + 1) / stages.length) * 100 + '%' }} />
      </div>
      {primarySignal && <div className="mt-4 flex flex-col gap-3 rounded-[10px] border border-primary-200 bg-primary-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><div className="surface-label">هدف القرار الأول</div><div className="mt-1 truncate text-sm font-bold text-ink-900">{primarySignal.item.title}</div><div className="mt-1 text-[10px] text-primary-800">{primarySignal.kind === 'alert' ? priorityLabel((primarySignal.item as Alert).severity) : priorityLabel((primarySignal.item as Recommendation).priority)} · من المصدر الكانوني</div></div>
        <button type="button" onClick={() => primarySignal.kind === 'alert' ? selectAlert(primarySignal.item.id) : selectRecommendation(primarySignal.item.id)} className="btn-primary shrink-0 text-xs">افتح الدليل</button>
      </div>}
      {selectedSignal && <div className="mt-4 flex flex-col gap-2 rounded-[10px] border border-warning-200 bg-warning-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><div className="surface-label">{selected ? 'التوصية المحددة' : 'التنبيه المحدد'}</div><div className="mt-1 truncate text-sm font-bold text-ink-900">{selectedSignal.title}</div></div>
        <span className="shrink-0 text-[10px] font-bold text-warning-800">الإشارة المصدرية ليست بديلًا عن evidence</span>
      </div>}
    </header>

    <nav aria-label="مراحل دورة القرار" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {stages.map(s => <button key={s.id} type="button" aria-current={stage === s.id ? 'step' : undefined} onClick={() => go(s.id)} className={'stage-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ' + (stage === s.id ? 'stage-pill-active' : 'hover:border-ink-300 hover:bg-ink-50')}>
        <span className="block text-xs font-bold">{s.label}</span><span className="mt-1 block text-[10px] text-ink-500">{s.description}</span>
      </button>)}
    </nav>

    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><div className="flex items-center gap-2 font-semibold"><AlertTriangle size={17}/> تعذر تحميل البيانات</div><p className="mt-1">{error}</p><button type="button" onClick={() => void load()} className="mt-3 rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-semibold">إعادة المحاولة</button></div>}

    {stage === 'command' && <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><Lightbulb size={19}/><h2 className="font-bold">التوصيات</h2></div>
        <div className="mt-4 space-y-2">
          {!loading && recommendations.length === 0 && <Empty title="لا توجد توصيات" detail="لا يتم إنشاء بيانات تجريبية."/>}
          {recommendations.slice(0, 8).map(r => <button key={r.id} type="button" onClick={() => selectRecommendation(r.id)} className="w-full rounded-xl border border-ink-100 p-3 text-right hover:bg-ink-50">
            <p className="text-sm font-semibold">{r.title}</p><p className="mt-1 text-xs text-ink-500">{priorityLabel(r.priority)} · {statusLabel(r.status)} · ثقة {r.confidence || 'غير محددة'}</p>
          </button>)}
        </div>
      </div>
      <div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><Bell size={18}/><h2 className="font-bold">التنبيهات</h2></div>
        <div className="mt-4 space-y-2">
          {!loading && alerts.length === 0 && <Empty title="لا توجد تنبيهات" detail="لا توجد تنبيهات في المصدر الحالي."/>}
          {alerts.slice(0, 6).map(a => <button key={a.id} type="button" onClick={() => selectAlert(a.id)} className="w-full rounded-xl border border-ink-100 p-3 text-right hover:bg-ink-50">
            <p className="text-sm font-semibold">{a.title}</p><p className="mt-1 text-xs text-ink-500">{priorityLabel(a.severity)} · {a.category || 'تنبيه أعمال'} · {formatDate(a.created_at)}</p>
          </button>)}
        </div>
      </div>
    </section>}

    {stage === 'evidence' && <section className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="font-bold">اختيار الإشارة</h2>
        <div className="mt-4 space-y-2">
          {recommendations.map(r => <button key={'r-' + r.id} type="button" aria-pressed={selectedId === r.id} onClick={() => selectRecommendation(r.id)} className={'w-full rounded-xl border p-3 text-right ' + (selectedId === r.id ? 'border-primary-400 bg-primary-50' : 'border-ink-100')}>{r.title}<span className="mt-1 block text-[10px] text-ink-400">توصية · {priorityLabel(r.priority)}</span></button>)}
          {alerts.map(a => <button key={'a-' + a.id} type="button" aria-pressed={selectedAlertId === a.id} onClick={() => selectAlert(a.id)} className={'w-full rounded-xl border p-3 text-right ' + (selectedAlertId === a.id ? 'border-warning-400 bg-warning-50' : 'border-ink-100')}>{a.title}<span className="mt-1 block text-[10px] text-ink-400">تنبيه · {a.category || 'غير محدد'} · {priorityLabel(a.severity)}</span></button>)}
          {recommendations.length === 0 && alerts.length === 0 && <Empty title="لا توجد إشارة مصدرية" detail="لا يمكن فحص دليل لإشارة غير موجودة."/>}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <div className="flex items-center gap-2"><FileSearch size={19}/><h2 className="font-bold">سلسلة الدليل</h2></div>
        {!selectedSignal && <div className="mt-5"><Empty title="اختر توصية أو تنبيهًا" detail="سيظهر هنا ما هو معروف من المصدر وما يزال يحتاج evidence إضافيًا."/></div>}
        {selected && <div className="mt-5 space-y-4">
          <h3 className="text-lg font-bold">{selected.title}</h3>
          <p className="text-sm leading-7 text-ink-600">{selected.description || 'الوصف غير متاح من المصدر الحالي.'}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">المصدر</p><p className="mt-1 font-bold">get_dashboard_intelligence</p></div>
            <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">الحالة المصدرية</p><p className="mt-1 font-bold">{statusLabel(selected.status)}</p></div>
            <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">الأولوية</p><p className="mt-1 font-bold">{priorityLabel(selected.priority)}</p></div>
            <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">الثقة</p><p className="mt-1 font-bold">{selected.confidence || 'غير محددة'}</p></div>
            <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">الأثر المتوقع</p><p className="mt-1 font-bold">{formatNumber(selected.expected_impact)}</p></div>
            <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">وقت إنشاء الإشارة</p><p className="mt-1 font-bold">{formatDate(selected.created_at)}</p></div>
          </div>
          <Blocked>الدليل التشغيلي التفصيلي غير مثبت هنا. لا نعتبر وجود التوصية نفسها evidence، ولا ننشئ raw evidence أو نتيجة تنفيذ من الواجهة.</Blocked>
          <button type="button" onClick={() => go('decision', selected.id, null)} className="rounded-xl bg-ink-950 px-4 py-2.5 text-xs font-bold text-white">متابعة إلى القرار</button>
        </div>}
        {selectedAlert && !selected && <div className="mt-5 space-y-4">
          <h3 className="text-lg font-bold">{selectedAlert.title}</h3>
          <p className="text-sm leading-7 text-ink-600">{selectedAlert.description || 'وصف التنبيه غير متاح من المصدر الحالي.'}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">المصدر</p><p className="mt-1 font-bold">get_dashboard_intelligence</p></div>
            <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">النوع</p><p className="mt-1 font-bold">{selectedAlert.category || 'غير محدد'}</p></div>
            <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">الشدة</p><p className="mt-1 font-bold">{priorityLabel(selectedAlert.severity)}</p></div>
            <div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">القيمة مقابل الحد</p><p className="mt-1 font-bold">{formatNumber(selectedAlert.metric_value)} مقابل {formatNumber(selectedAlert.threshold)}</p></div>
            <div className="rounded-xl bg-ink-50 p-4 sm:col-span-2"><p className="text-xs text-ink-500">وقت الإشارة</p><p className="mt-1 font-bold">{formatDate(selectedAlert.created_at)}</p></div>
          </div>
          <Blocked>التنبيه يثبت وجود إشارة من المصدر، لكنه لا يثبت السبب الجذري أو الأثر المالي أو قرار التنفيذ. يلزم evidence إضافي قبل تحويله إلى قرار.</Blocked>
          <button type="button" onClick={() => go('decision', selectedId, selectedAlert.id)} className="rounded-xl bg-ink-950 px-4 py-2.5 text-xs font-bold text-white">عرض حدود القرار</button>
        </div>}
      </div>
    </section>}

    {stage === 'decision' && <section className="space-y-4">
      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <div className="flex items-center gap-2"><ShieldCheck size={19}/><h2 className="font-bold">مساحة القرار</h2></div>
        {selected ? <div className="mt-4"><p className="font-semibold">{selected.title}</p><div className="mt-3 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-ink-50 p-3"><span className="text-xs text-ink-500">الحالة</span><p className="mt-1 font-bold">{statusLabel(selected.status)}</p></div><div className="rounded-xl bg-ink-50 p-3"><span className="text-xs text-ink-500">الثقة</span><p className="mt-1 font-bold">{selected.confidence}</p></div><div className="rounded-xl bg-ink-50 p-3"><span className="text-xs text-ink-500">الأثر المتوقع</span><p className="mt-1 font-bold">{formatNumber(selected.expected_impact)}</p></div></div><p className="mt-3 text-sm text-ink-500">هذا مرشح قرار مصدره الذكاء الكانوني؛ لا يُعد حالة قرار محفوظة أو موافقة تشغيلية.</p></div>
          : selectedAlert ? <div className="mt-4"><p className="font-semibold">{selectedAlert.title}</p><p className="mt-2 text-sm text-ink-500">هذا تنبيه مصدره الذكاء الكانوني. وجوده لا ينشئ توصية أو قرارًا تلقائيًا.</p></div>
          : <Empty title="لا يوجد سياق قرار" detail="اختر توصية أو تنبيهًا مصدرية أولًا."/>}
      </div>
      <Blocked>صلاحية المستخدم وسياق الشركة ودليل الاعتماد مطلوبة قبل أي موافقة أو تعديل. لا يتم تحويل الإشارة إلى حالة معتمدة محليًا.</Blocked>
      <div className="grid gap-3 sm:grid-cols-3">{['مقترح','بانتظار الموافقة','معتمد / مرفوض'].map(s => <div key={s} className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs font-bold">{s}</p><p className="mt-2 text-xs text-ink-500">تصميم lifecycle فقط، وليس دليل حالة persisted.</p></div>)}</div>
    </section>}

    {stage === 'approval' && <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><ShieldCheck size={19}/><h2 className="font-bold">مركز الموافقة</h2></div><p className="mt-3 text-sm leading-7 text-ink-600">الموافقة تحتاج صلاحية تشغيلية ودليلًا حيًا موثقًا.</p></div><Blocked>إجراء الموافقة غير متاح — لا يتم إنشاء صاحب موافقة أو توقيت أو موافقة محلية.</Blocked></section>}

    {stage === 'work' && <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><Target size={19}/><h2 className="font-bold">مساحة العمل الشخصية</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{['موافقاتي','مهامي','قيد التنفيذ','متأخر','مكتمل','متابعة النتيجة'].map(s => <div key={s} className="rounded-xl border border-ink-100 p-4"><p className="text-xs font-bold">{s}</p><p className="mt-2 text-xs text-ink-500">لا توجد بيانات تشغيلية متاحة.</p></div>)}</div></div><Blocked>لا يمكن اختلاق مهام أو حالات إنجاز. يتطلب هذا المسار جلسة موثقة وسياق الشركة.</Blocked></section>}

    {stage === 'outcome' && <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><h2 className="font-bold">النتيجة والتعلّم</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[['المتوقع', selected?.expected_impact == null ? 'الأثر المتوقع غير متاح' : String(selected.expected_impact)], ['الفعلي', 'النتيجة الفعلية غير متاحة بعد'], ['الفارق', 'لا يمكن حساب الفارق بعد'], ['جودة النتيجة', 'جودة النتيجة غير متاحة بعد'], ['الملاحظات', 'الملاحظات غير متاحة بعد'], ['إشارة التعلّم', 'إشارة التعلّم غير مثبتة بعد']].map(([l, v]) => <div key={l} className="rounded-xl border border-ink-100 p-4"><p className="text-xs font-bold">{l}</p><p className="mt-2 text-sm font-semibold">{v}</p></div>)}</div></div><Blocked>تعلم المستودع لا يساوي تعلّم التشغيل. لا توجد نتيجة فعلية أو ملاحظات أو أدلة تعلّم تشغيلية موثقة.</Blocked></section>}
  </div>;
}
