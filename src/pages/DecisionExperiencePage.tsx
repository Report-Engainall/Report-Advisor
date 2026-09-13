import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileSearch, Lightbulb, ShieldCheck, Target, Workflow } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAlerts } from '@/lib/queries';
import { getAuthenticatedUser } from '@/lib/auth-session';
import {
  completeDecisionWorkItem,
  createDecisionWorkItem,
  createRuntimeDecision,
  decideApproval,
  fetchDecisionRecommendations,
  linkRecommendationToDecision,
  requestDecisionApproval,
  type DecisionRecommendation,
} from '@/lib/decision-lifecycle';
import type { Alert, User } from '@/lib/types';

type Stage = 'command' | 'evidence' | 'decision' | 'approval' | 'work' | 'outcome';
const stages: Array<{ id: Stage; label: string; description: string }> = [
  { id: 'command', label: 'مركز القيادة', description: 'المعلومة والأولوية' },
  { id: 'evidence', label: 'الدليل', description: 'المصدر والسياق' },
  { id: 'decision', label: 'القرار', description: 'التوصية والسبب' },
  { id: 'approval', label: 'الموافقة', description: 'المسؤولية والاعتماد' },
  { id: 'work', label: 'التنفيذ', description: 'العمل والمتابعة' },
  { id: 'outcome', label: 'النتيجة والتعلّم', description: 'Expected → Actual' },
];

function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-6 text-center"><p className="font-semibold text-ink-800">{title}</p><p className="mt-2 text-xs leading-6 text-ink-500">{detail}</p></div>;
}
function Blocked({ children }: { children: string }) {
  return <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{children}</div>;
}
function ActionButton({ disabled, busy, children, onClick }: { disabled?: boolean; busy?: boolean; children: string; onClick: () => void }) {
  return <button type="button" disabled={disabled || busy} onClick={onClick} className="rounded-xl bg-ink-950 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy ? 'جارٍ التنفيذ…' : children}</button>;
}

export function DecisionExperiencePage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('stage') as Stage | null;
  const [stage, setStage] = useState<Stage>(stages.some(s => s.id === requested) ? requested! : 'command');
  const [recommendations, setRecommendations] = useState<DecisionRecommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(params.get('recommendationId'));
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [workItemId, setWorkItemId] = useState<string | null>(null);
  const [actualImpact, setActualImpact] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, a, u] = await Promise.all([fetchDecisionRecommendations(), fetchAlerts(), getAuthenticatedUser()]);
      setRecommendations(r);
      setAlerts(a);
      setUser(u);
      setSelectedId(current => current && r.some(x => x.id === current) ? current : r[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل دورة القرار.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => recommendations.find(r => r.id === selectedId) ?? null, [recommendations, selectedId]);
  const evidenceId = selected?.evidence_snapshot_id ?? null;
  const go = (next: Stage, id = selectedId) => {
    setStage(next);
    const p = new URLSearchParams(params);
    p.set('stage', next);
    if (id) p.set('recommendationId', id); else p.delete('recommendationId');
    setParams(p, { replace: true });
  };
  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true); setError(null); setNotice(null);
    try { await action(); setNotice(success); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تنفيذ العملية.'); } finally { setBusy(false); }
  };

  const createDecision = () => {
    if (!selected || !evidenceId) return;
    void run(async () => {
      const id = await createRuntimeDecision({
        decisionKey: `recommendation:${selected.id}`,
        decisionType: selected.category || 'BUSINESS_DECISION',
        confidence: Math.max(0, Math.min(1, Number(selected.confidence) || 0)),
        expectedImpact: selected.expected_impact,
        evidence: { evidence_snapshot_id: evidenceId, source: 'recommendation.evidence_snapshot_id', recommendation_id: selected.id },
      });
      await linkRecommendationToDecision(selected.id, id);
      setDecisionId(id);
    }, 'تم إنشاء القرار وربطه بالتوصية عبر RPC الحقيقي.');
  };

  const requestApproval = () => {
    if (!decisionId) return;
    void run(async () => { setApprovalId(await requestDecisionApproval(decisionId, 'مراجعة قرار مدعوم بدليل runtime')); }, 'تم طلب الموافقة.');
  };

  const approve = (approved: boolean) => {
    if (!approvalId) return;
    void run(async () => { await decideApproval(approvalId, approved, approved ? 'اعتماد بعد مراجعة الدليل' : 'رفض القرار'); }, approved ? 'تم تسجيل الموافقة عبر RPC.' : 'تم تسجيل الرفض عبر RPC.');
  };

  const createWork = () => {
    if (!decisionId || !selected || !evidenceId || !user) return;
    void run(async () => {
      const id = await createDecisionWorkItem({
        decisionId,
        recommendationId: selected.id,
        department: 'business',
        assigneeId: user.id,
        assigneeLabel: user.email ?? user.id,
        title: selected.title,
        description: selected.description ?? 'تنفيذ القرار ومتابعة الأثر الفعلي.',
        priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(selected.priority.toUpperCase()) ? selected.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' : 'MEDIUM',
        dueAt: selected.deadline,
        expectedImpact: selected.expected_impact,
        evidenceRefs: [{ evidence_snapshot_id: evidenceId, recommendation_id: selected.id }],
      });
      setWorkItemId(id);
    }, 'تم إنشاء Work Item من القرار المعتمد.');
  };

  const completeWork = () => {
    if (!workItemId || !evidenceId) return;
    const parsed = actualImpact.trim() === '' ? null : Number(actualImpact);
    if (parsed !== null && !Number.isFinite(parsed)) { setError('ACTUAL_IMPACT_INVALID'); return; }
    void run(async () => {
      await completeDecisionWorkItem(workItemId, parsed, { evidence_snapshot_id: evidenceId, source: 'authenticated_decision_experience' });
    }, 'تم إغلاق Work Item وتسجيل Outcome عبر RPC.');
  };

  return <div dir="rtl" className="space-y-5 pb-8">
    <header className="rounded-3xl bg-ink-950 p-6 text-white lg:p-8"><div className="flex items-center gap-2 text-sm font-semibold text-primary-300"><Workflow size={17} /> منظومة القرار التنفيذية</div><h1 className="mt-2 text-2xl font-bold lg:text-3xl">من البيانات إلى الدليل، ثم القرار والنتيجة</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-ink-300">كل mutation يمر عبر RPC المعياري والـtenant الحالي، ولا يتم عرض نجاح محلي بديل عن الحالة persisted.</p></header>
    <nav aria-label="مراحل دورة القرار" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">{stages.map(s => <button key={s.id} type="button" aria-current={stage === s.id ? 'step' : undefined} onClick={() => go(s.id)} className={`rounded-2xl border p-3 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${stage === s.id ? 'border-primary-500 bg-primary-50' : 'border-ink-200 bg-white hover:bg-ink-50'}`}><span className="block text-xs font-bold">{s.label}</span><span className="mt-1 block text-[11px] text-ink-500">{s.description}</span></button>)}</nav>
    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><div className="flex items-center gap-2 font-semibold"><AlertTriangle size={17} /> تعذر تنفيذ العملية</div><p className="mt-1 break-words">{error}</p><button type="button" onClick={() => void load()} className="mt-3 rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-semibold">إعادة تحميل</button></div>}
    {notice && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={17} /> {notice}</div></div>}

    {stage === 'command' && <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><Lightbulb size={19} /><h2 className="font-bold">التوصيات الحقيقية</h2></div><div className="mt-4 space-y-2">{!loading && recommendations.length === 0 && <Empty title="لا توجد توصيات" detail="لا يتم إنشاء بيانات تجريبية." />}{recommendations.slice(0, 8).map(r => <button key={r.id} type="button" onClick={() => { setSelectedId(r.id); go('evidence', r.id); }} className="w-full rounded-xl border border-ink-100 p-3 text-right hover:bg-ink-50"><p className="text-sm font-semibold">{r.title}</p><p className="mt-1 text-xs text-ink-500">{r.evidence_snapshot_id ? 'دليل مرتبط' : 'لا يوجد دليل runtime'}</p></button>)}</div></div><div className="rounded-2xl border border-ink-200 bg-white p-5"><h2 className="font-bold">التنبيهات</h2><div className="mt-4 space-y-2">{!loading && alerts.length === 0 && <Empty title="لا توجد تنبيهات" detail="لا توجد تنبيهات في المصدر الحالي." />}{alerts.slice(0, 6).map(a => <Link key={a.id} to={`/decision-experience?stage=decision${selectedId ? `&recommendationId=${encodeURIComponent(selectedId)}` : ''}`} className="block rounded-xl border border-ink-100 p-3 hover:bg-ink-50"><p className="text-sm font-semibold">{a.title}</p></Link>)}</div></div></section>}

    {stage === 'evidence' && <section className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-2xl border border-ink-200 bg-white p-5"><h2 className="font-bold">اختيار التوصية</h2><div className="mt-4 space-y-2">{recommendations.length === 0 ? <Empty title="لا توجد توصيات" detail="لا يمكن فحص دليل لتوصية غير موجودة." /> : recommendations.map(r => <button key={r.id} type="button" aria-pressed={selectedId === r.id} onClick={() => { setSelectedId(r.id); go('evidence', r.id); }} className={`w-full rounded-xl border p-3 text-right ${selectedId === r.id ? 'border-primary-400 bg-primary-50' : 'border-ink-100'}`}>{r.title}</button>)}</div></div><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><FileSearch size={19} /><h2 className="font-bold">Evidence Workspace</h2></div>{selected ? <div className="mt-5 space-y-4"><h3 className="text-lg font-bold">{selected.title}</h3><p className="text-sm leading-7 text-ink-600">{selected.description || 'الوصف غير متاح من المصدر الحالي.'}</p><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">Evidence ID</p><p className="mt-1 break-all font-mono text-xs font-bold">{evidenceId ?? 'NOT_AVAILABLE'}</p></div><div className="rounded-xl bg-ink-50 p-4"><p className="text-xs text-ink-500">Recommendation ID</p><p className="mt-1 break-all font-mono text-xs font-bold">{selected.id}</p></div></div>{evidenceId ? <div className="flex flex-wrap gap-2"><ActionButton busy={busy} onClick={createDecision}>إنشاء القرار الحقيقي</ActionButton></div> : <Blocked>RUNTIME_REQUIRED — لا يمكن إنشاء Decision بدون evidence_snapshot_id حقيقي.</Blocked>}</div> : <Empty title="اختر توصية" detail="اختر عنصرًا موجودًا لفحص الدليل." />}</div></section>}

    {stage === 'decision' && <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><ShieldCheck size={19} /><h2 className="font-bold">Decision Workspace</h2></div>{selected ? <div className="mt-4 space-y-3"><p className="font-semibold">{selected.title}</p><p className="text-xs text-ink-500">Decision ID: {decisionId ?? 'NOT_CREATED'}</p><div className="flex flex-wrap gap-2"><ActionButton disabled={!evidenceId || !!decisionId} busy={busy} onClick={createDecision}>إنشاء وربط القرار</ActionButton><ActionButton disabled={!decisionId || !!approvalId} busy={busy} onClick={requestApproval}>طلب الموافقة</ActionButton></div></div> : <Empty title="لا يوجد مرشح قرار" detail="لا يوجد قرار يمكن ربطه بتوصية حالية." />}</div>{!evidenceId && <Blocked>لا يوجد Evidence runtime موثق؛ mutation مغلق fail-closed.</Blocked>}{decisionId && <div className="rounded-2xl border border-ink-200 bg-white p-5"><p className="text-sm font-semibold">الخطوة التالية</p><p className="mt-2 text-xs text-ink-500">Approval ID: {approvalId ?? 'PENDING_REQUEST'}</p><button type="button" onClick={() => go('approval')} className="mt-4 rounded-xl border border-ink-200 px-4 py-2.5 text-xs font-bold">فتح مركز الموافقة</button></div>}</section>}

    {stage === 'approval' && <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><ShieldCheck size={19} /><h2 className="font-bold">Approval Center</h2></div>{approvalId ? <div className="mt-4 space-y-3"><p className="break-all font-mono text-xs">{approvalId}</p><div className="flex flex-wrap gap-2"><ActionButton busy={busy} onClick={() => approve(true)}>اعتماد عبر RPC</ActionButton><ActionButton busy={busy} onClick={() => approve(false)}>رفض عبر RPC</ActionButton></div></div> : <Blocked>Approval action unavailable حتى يتم إنشاء Decision وطلب approval حقيقي.</Blocked>}</div>{approvalId && <div className="rounded-2xl border border-ink-200 bg-white p-5"><ActionButton disabled={!decisionId} busy={busy} onClick={() => go('work')}>متابعة إلى التنفيذ</ActionButton></div>}</section>}

    {stage === 'work' && <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><div className="flex items-center gap-2"><Target size={19} /><h2 className="font-bold">Personal Workbench</h2></div>{workItemId ? <div className="mt-4 space-y-4"><p className="break-all font-mono text-xs">Work Item ID: {workItemId}</p><div><label className="text-xs font-semibold text-ink-600" htmlFor="actual-impact">Actual impact — اتركه فارغًا إذا كان غير متاح</label><input id="actual-impact" inputMode="decimal" value={actualImpact} onChange={e => setActualImpact(e.target.value)} className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm" /></div><ActionButton busy={busy} onClick={completeWork}>إكمال Work Item وتسجيل Outcome</ActionButton></div> : decisionId ? <div className="mt-4 space-y-3"><p className="text-sm text-ink-600">لا يتم إنشاء المهمة إلا بعد APPROVED persisted وبوجود دليل.</p><ActionButton busy={busy} onClick={createWork}>إنشاء Work Item الحقيقي</ActionButton></div> : <Blocked>لا توجد Decision approved persisted.</Blocked>}</div></section>}

    {stage === 'outcome' && <section className="space-y-4"><div className="rounded-2xl border border-ink-200 bg-white p-5"><h2 className="font-bold">Outcome & Learning</h2>{workItemId ? <div className="mt-4 space-y-3"><p className="text-sm text-ink-600">Outcome يعتمد على Evidence حقيقي وعلى completion persisted.</p><p className="text-xs text-ink-500">Actual impact: {actualImpact === '' ? 'غير متاح' : actualImpact}</p><Blocked>Final evidence لا يُنشأ محليًا؛ يتم إثباته فقط من الحالة persisted بعد complete_decision_work_item.</Blocked></div> : <Empty title="لا توجد نتيجة persisted" detail="أكمل Work Item أولًا عبر RPC الحقيقي." />}</div></section>}
  </div>;
}
