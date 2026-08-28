import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowLeft, Bell, CheckCircle2, ChevronLeft, CircleDot,
  FileSearch, Lightbulb, LockKeyhole, ShieldCheck, Target, UserRound, Workflow,
} from 'lucide-react';
import { fetchAlerts, fetchRecommendations } from '@/lib/queries';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Alert, Recommendation } from '@/lib/types';

type Stage = 'command' | 'evidence' | 'decision' | 'approval' | 'work' | 'outcome';

const stages: Array<{ id: Stage; label: string; icon: typeof Workflow }> = [
  { id: 'command', label: 'مركز القيادة', icon: Workflow },
  { id: 'evidence', label: 'الأدلة', icon: FileSearch },
  { id: 'decision', label: 'القرار', icon: CircleDot },
  { id: 'approval', label: 'الموافقة', icon: ShieldCheck },
  { id: 'work', label: 'التنفيذ', icon: Target },
  { id: 'outcome', label: 'النتيجة والتعلّم', icon: Lightbulb },
];

type CommandStat = { label: string; value: number; icon: typeof Workflow };

function RuntimeBlocked({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4" role="status">
      <div className="flex items-start gap-3">
        <LockKeyhole size={19} className="mt-0.5 shrink-0 text-amber-700" />
        <div>
          <p className="text-sm font-semibold text-amber-900">{label}: التنفيذ الحقيقي غير متاح حاليًا</p>
          <p className="mt-1 text-xs leading-6 text-amber-800">
            واجهة المنتج مرتبطة بالعقود الحقيقية، لكن لا تعرض نجاحًا وهميًا. يلزم Auth/Tenant runtime authority لإجراء mutation فعلي.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DecisionExperiencePage() {
  const [stage, setStage] = useState<Stage>('command');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextRecommendations, nextAlerts] = await Promise.all([fetchRecommendations(), fetchAlerts()]);
      setRecommendations(nextRecommendations);
      setAlerts(nextAlerts);
      setSelectedId(current => current ?? nextRecommendations[0]?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل بيانات تجربة القرار.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(
    () => recommendations.find(item => item.id === selectedId) ?? null,
    [recommendations, selectedId],
  );

  const commandStats: CommandStat[] = [
    { label: 'التوصيات', value: recommendations.length, icon: Lightbulb },
    { label: 'التنبيهات', value: alerts.length, icon: Bell },
    { label: 'بانتظار القرار', value: recommendations.filter(item => item.status === 'new').length, icon: CircleDot },
    { label: 'نتائج موثقة', value: recommendations.filter(item => item.status === 'done').length, icon: CheckCircle2 },
  ];

  return (
    <div dir="rtl" className="space-y-5 animate-fade-in">
      <header className="rounded-3xl bg-ink-950 p-6 text-white lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary-300 text-sm font-medium">
              <Workflow size={17} /> تجربة القرار التنفيذية
            </div>
            <h1 className="mt-2 text-2xl font-bold lg:text-3xl">من الدليل إلى القرار ثم النتيجة</h1>
            <p className="mt-2 text-sm leading-7 text-ink-300">
              مسار بصري واحد فوق مصادر Report-Advisor المعتمدة. لا توجد بيانات نجاح ثابتة ولا mutations وهمية.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-xs text-ink-200">
            <span className="font-semibold text-white">Runtime:</span> جاهز للربط عند توفر Auth/Tenant authority
          </div>
        </div>
      </header>

      <nav aria-label="مراحل القرار" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {stages.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setStage(id)}
            className={`rounded-2xl border p-3 text-right transition ${stage === id ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'}`}
          >
            <Icon size={18} />
            <span className="mt-2 block text-xs font-semibold">{label}</span>
          </button>
        ))}
      </nav>

      {error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2"><AlertTriangle size={18} /> {error}</div>
          <button type="button" onClick={() => void load()} className="mt-3 rounded-xl border border-red-300 px-3 py-1.5 text-xs font-semibold">إعادة المحاولة</button>
        </div>
      )}

      {stage === 'command' && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {commandStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
                <Icon size={19} className="text-primary-600" />
                <p className="mt-3 text-xs text-ink-500">{label}</p>
                <strong className="mt-1 block text-2xl text-ink-900">{loading ? '—' : value}</strong>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <div className="flex items-center justify-between"><div><h2 className="font-bold text-ink-900">التوصيات الحالية</h2><p className="mt-1 text-xs text-ink-500">من `fetchRecommendations`؛ لا توجد توصيات مولّدة داخل الواجهة.</p></div><Lightbulb size={20} /></div>
              <div className="mt-4 space-y-2">
                {!loading && recommendations.length === 0 && <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-500">لا توجد توصيات متاحة.</p>}
                {recommendations.slice(0, 6).map(rec => (
                  <button key={rec.id} type="button" onClick={() => { setSelectedId(rec.id); setStage('evidence'); }} className="flex w-full items-center gap-3 rounded-xl border border-ink-100 p-3 text-right hover:bg-ink-50">
                    <div className="rounded-lg bg-primary-50 p-2 text-primary-600"><Lightbulb size={16} /></div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink-800">{rec.title}</p><p className="mt-1 text-xs text-ink-500">{rec.expected_impact ? `الأثر المتوقع: ${formatCurrency(rec.expected_impact)}` : 'الأثر المتوقع غير متاح'}</p></div>
                    <ChevronLeft size={17} className="shrink-0 text-ink-400" />
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <div className="flex items-center gap-2"><Bell size={19} /><h2 className="font-bold">إشارات مهمة</h2></div>
              <div className="mt-4 space-y-2">
                {alerts.slice(0, 5).map(alert => <div key={alert.id} className="rounded-xl bg-ink-50 p-3"><p className="text-sm font-semibold">{alert.title}</p><p className="mt-1 text-xs text-ink-500">{relativeTime(alert.created_at)}</p></div>)}
                {!loading && alerts.length === 0 && <p className="text-sm text-ink-500">لا توجد تنبيهات.</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {stage === 'evidence' && (
        <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
          <div className="rounded-2xl border border-ink-200 bg-white p-5">
            <h2 className="font-bold">اختر التوصية</h2>
            <div className="mt-4 space-y-2">{recommendations.map(rec => <button key={rec.id} type="button" onClick={() => setSelectedId(rec.id)} className={`w-full rounded-xl border p-3 text-right ${selectedId === rec.id ? 'border-primary-400 bg-primary-50' : 'border-ink-100'}`}><p className="text-sm font-semibold">{rec.title}</p><p className="mt-1 text-xs text-ink-500">{rec.status}</p></button>)}</div>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-5">
            <div className="flex items-center gap-2"><FileSearch size={20} /><h2 className="font-bold">Evidence Inspector</h2></div>
            {selected ? <div className="mt-5 space-y-4"><div><p className="text-xs text-ink-500">WHY?</p><h3 className="mt-1 text-lg font-bold">{selected.title}</h3><p className="mt-2 text-sm leading-7 text-ink-600">{selected.description || 'وصف التوصية غير متاح من المصدر الحالي.'}</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-ink-50 p-4"><span className="text-xs text-ink-500">Calculation / Metric</span><p className="mt-1 text-sm font-semibold">يُعرض من evidence payload عند توفره</p></div><div className="rounded-xl bg-ink-50 p-4"><span className="text-xs text-ink-500">Expected Impact</span><p className="mt-1 text-sm font-semibold">{selected.expected_impact ? formatCurrency(selected.expected_impact) : 'غير متاح'}</p></div></div><div className="rounded-xl border border-dashed border-ink-300 p-4 text-sm text-ink-500">المصدر/الحساب/الدليل التفصيلي لا يتم اختلاقه إذا لم يرسله العقد canonical.</div><button type="button" onClick={() => setStage('decision')} className="btn-primary text-xs">متابعة إلى القرار <ArrowLeft size={14} /></button></div> : <p className="mt-5 text-sm text-ink-500">اختر توصية لفحصها.</p>}
          </div>
        </section>
      )}

      {stage === 'decision' && (
        <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><h2 className="font-bold">Decision Inspector</h2>{selected ? <div className="mt-4 grid gap-4 md:grid-cols-3"><div><p className="text-xs text-ink-500">Recommendation</p><p className="mt-1 text-sm font-semibold">{selected.title}</p></div><div><p className="text-xs text-ink-500">Expected Impact</p><p className="mt-1 text-sm font-semibold">{selected.expected_impact ? formatCurrency(selected.expected_impact) : 'غير متاح'}</p></div><div><p className="text-xs text-ink-500">Decision</p><p className="mt-1 text-sm font-semibold">بانتظار قرار runtime</p></div></div> : <p className="mt-4 text-sm text-ink-500">لا يوجد اختيار حالي.</p>}</div><RuntimeBlocked label="القرار" /><div className="flex justify-end"><button type="button" onClick={() => setStage('approval')} className="btn-secondary text-xs">عرض مسار الموافقة <ArrowLeft size={14} /></button></div></section>
      )}

      {stage === 'approval' && <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><ShieldCheck size={20} /><h2 className="font-bold">Approval Center</h2></div><p className="mt-2 text-sm text-ink-500">لا يُعرض زر نجاح أو تغيير حالة محلي؛ approval يجب أن يمر عبر canonical runtime mutation وبـactor مصادق.</p><div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-amber-50 p-4"><p className="text-xs text-amber-700">الحالة</p><p className="mt-1 font-semibold text-amber-900">PENDING / غير متاحة</p></div><div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">Approver</p><p className="mt-1 font-semibold">غير متاح</p></div><div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">Evidence</p><p className="mt-1 font-semibold">مرتبطة عند runtime</p></div></div></div><RuntimeBlocked label="الموافقة" /></section>}

      {stage === 'work' && <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><Target size={20} /><h2 className="font-bold">Personal Workbench</h2></div><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-xl bg-ink-50 p-4"><UserRound size={17} /><p className="mt-2 text-xs text-ink-500">My Tasks</p><p className="mt-1 font-semibold">غير متاح runtime</p></div><div className="rounded-xl bg-ink-50 p-4"><Workflow size={17} /><p className="mt-2 text-xs text-ink-500">In Progress</p><p className="mt-1 font-semibold">غير متاح runtime</p></div><div className="rounded-xl bg-ink-50 p-4"><CheckCircle2 size={17} /><p className="mt-2 text-xs text-ink-500">Completed</p><p className="mt-1 font-semibold">غير متاح runtime</p></div><div className="rounded-xl bg-ink-50 p-4"><AlertTriangle size={17} /><p className="mt-2 text-xs text-ink-500">Overdue</p><p className="mt-1 font-semibold">غير متاح runtime</p></div></div></div><RuntimeBlocked label="التنفيذ" /></section>}

      {stage === 'outcome' && <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><Lightbulb size={20} /><h2 className="font-bold">Outcome & Learning</h2></div><p className="mt-2 text-sm leading-7 text-ink-600">الحلقة المصممة: Expected → Actual → Delta → Impact/Quality → Feedback → Learning Signal → Future Recommendation.</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl border border-ink-100 p-4"><p className="text-xs text-ink-500">Expected</p><p className="mt-1 font-semibold">بانتظار outcome runtime</p></div><div className="rounded-xl border border-ink-100 p-4"><p className="text-xs text-ink-500">Actual</p><p className="mt-1 font-semibold">بانتظار outcome runtime</p></div><div className="rounded-xl border border-ink-100 p-4"><p className="text-xs text-ink-500">Delta</p><p className="mt-1 font-semibold">يُحسب من canonical outcome</p></div><div className="rounded-xl border border-ink-100 p-4"><p className="text-xs text-ink-500">Learning</p><p className="mt-1 font-semibold">Repository contract جاهز</p></div></div></div><RuntimeBlocked label="Outcome / Learning" /></section>}
    </div>
  );
}
