import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowUpLeft, CalendarClock, CheckCircle2, ChevronLeft, FileSearch, Lightbulb,
  ShieldCheck, Target, UserRound, Workflow, XCircle
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfidenceBadge, PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { fetchAlerts, fetchRecommendations } from '@/lib/queries';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Alert, Recommendation } from '@/lib/types';

type Stage = 'command' | 'evidence' | 'decision' | 'approval' | 'work' | 'outcome';

const STAGES: { id: Stage; label: string; description: string }[] = [
  { id: 'command', label: 'الإشارة', description: 'ما الذي يحتاج انتباهًا؟' },
  { id: 'evidence', label: 'الدليل', description: 'ما الذي يثبت ذلك؟' },
  { id: 'decision', label: 'القرار', description: 'ما الإجراء المقترح؟' },
  { id: 'approval', label: 'الموافقة', description: 'من يعتمد الإجراء؟' },
  { id: 'work', label: 'التنفيذ', description: 'ماذا تم فعليًا؟' },
  { id: 'outcome', label: 'النتيجة', description: 'ما الذي حدث بعد ذلك؟' },
];


function statusLabel(status: string | null): string {
  if (!status) return 'غير متاح';
  const labels: Record<string, string> = {
    pending: 'قيد المراجعة',
    proposed: 'مقترح',
    approved: 'معتمد',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    rejected: 'مرفوض',
    cancelled: 'ملغى',
  };
  return labels[status] ?? status;
}

function decisionReadiness(recommendation: Recommendation | null): { label: string; tone: string; detail: string } {
  if (!recommendation) return { label: 'لا توجد توصية', tone: 'text-ink-500 bg-ink-50', detail: 'لا يوجد عنصر حقيقي لبدء مسار القرار.' };
  if (!recommendation.owner) return { label: 'ينقص المسؤول', tone: 'text-warning-700 bg-warning-50', detail: 'التوصية موجودة، لكن لا يظهر مسؤول فعلي مرتبط بها.' };
  if (!recommendation.deadline) return { label: 'ينقص الموعد', tone: 'text-warning-700 bg-warning-50', detail: 'التوصية لها مسؤول، لكن الموعد غير مثبت بعد.' };
  if (recommendation.expected_impact == null) return { label: 'الأثر غير متاح', tone: 'text-warning-700 bg-warning-50', detail: 'لا يوجد أثر متوقع قابل للعرض على هذه التوصية.' };
  return { label: 'سياق القرار مكتمل', tone: 'text-success-700 bg-success-50', detail: 'المسؤول والموعد والأثر المتوقع متاحة في سجل التوصية.' };
}

function formatDeadline(value: string | null): string {
  if (!value) return 'غير متاح';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ar-YE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function BlockedState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[14px] border border-warning-200 bg-warning-50/70 p-4" role="status">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-800"><ShieldCheck size={17}/></div>
        <div className="min-w-0">
          <div className="text-[12px] font-black text-warning-950">{title}</div>
          <p className="mt-1 text-[11px] leading-5 text-warning-900/80">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function StageHeader({ label, description }: { label: string; description: string }) {
  return (
    <div>
      <div className="section-kicker">{label}</div>
      <h2 className="mt-1 text-xl font-black text-ink-950">{description}</h2>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  active,
  onClick,
}: {
  recommendation: Recommendation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={'w-full rounded-[14px] border p-4 text-right transition ' + (active ? 'border-primary-300 bg-primary-50/50 shadow-sm' : 'border-ink-200 bg-white hover:border-primary-200 hover:bg-primary-50/20')}
    >
      <div className="flex items-start gap-3">
        <span className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ' + (active ? 'bg-primary-100 text-primary-700' : 'bg-ink-50 text-ink-500')}>
          <Lightbulb size={17}/>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2"><span className="text-[13px] font-black text-ink-900">{recommendation.title}</span><PriorityBadge priority={recommendation.priority}/></span>
          {recommendation.description && <span className="mt-1 block text-[11px] leading-5 text-ink-500">{recommendation.description}</span>}
          <span className="mt-2 flex flex-wrap items-center gap-2">
            <ConfidenceBadge confidence={recommendation.confidence}/>
            {recommendation.expected_impact !== undefined && recommendation.expected_impact !== null && <span className="text-[10px] font-bold text-success-700">أثر متوقع: {formatCurrency(recommendation.expected_impact)}</span>}
          </span>
        </span>
        <ChevronLeft size={16} className="mt-1 shrink-0 text-ink-300"/>
      </div>
    </button>
  );
}

export function DecisionExperiencePage() {
  const [params, setParams] = useSearchParams();
  const requestedStage = params.get('stage') as Stage | null;
  const [stage, setStage] = useState<Stage>(STAGES.some((item) => item.id === requestedStage) ? requestedStage! : 'command');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(params.get('recommendationId'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [nextRecommendations, nextAlerts] = await Promise.all([fetchRecommendations(), fetchAlerts()]);
      setRecommendations(nextRecommendations);
      setAlerts(nextAlerts);
      setSelectedId((current) => current && nextRecommendations.some((item) => item.id === current) ? current : nextRecommendations[0]?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل سياق القرار');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (requestedStage && STAGES.some((item) => item.id === requestedStage)) setStage(requestedStage); }, [requestedStage]);

  const selected = recommendations.find((item) => item.id === selectedId) ?? null;
  const currentStageIndex = Math.max(0, STAGES.findIndex((item) => item.id === stage));
  const activeAlerts = useMemo(() => alerts.filter((item) => !item.is_read).slice(0, 6), [alerts]);
  const selectedStatus = selected?.status ?? null;

  const navigateStage = (next: Stage, id = selectedId) => {
    setStage(next);
    const nextParams = new URLSearchParams(params);
    nextParams.set('stage', next);
    if (id) nextParams.set('recommendationId', id);
    else nextParams.delete('recommendationId');
    setParams(nextParams, { replace: true });
  };

  const selectRecommendation = (id: string, next: Stage = 'evidence') => {
    setSelectedId(id);
    navigateStage(next, id);
  };

  if (loading) return <LoadingState message="جارٍ تحميل سياق القرار..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  const readiness = decisionReadiness(selected);

  return (
    <div dir="rtl" className="ag-decision-experience-surface space-y-5 animate-fade-in pb-10">
      <section className="ag-command-hero rounded-[20px] border border-ink-200 bg-ink-950 p-5 text-white shadow-elevated lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] font-black text-primary-300"><Workflow size={15}/> تجربة القرار</div>
            <h1 className="mt-2 text-[25px] font-black tracking-tight lg:text-[31px]">من الإشارة إلى النتيجة — دون فقدان الدليل</h1>
            <p className="mt-2 text-[12px] leading-6 text-ink-300">المسار يحفظ السياق ويُظهر بوضوح ما هو موجود، وما يحتاج إثباتًا، وما لم يُنفذ بعد.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-ink-200">المرحلة {String(currentStageIndex + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}</span>
            <Link to="/command-center" className="inline-flex items-center gap-2 rounded-[9px] border border-white/15 bg-white/10 px-3.5 py-2.5 text-[11px] font-bold text-white hover:bg-white/15">العودة لمركز القيادة <ArrowUpLeft size={13}/></Link>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-6 gap-1" aria-label="مراحل القرار" role="progressbar" aria-valuemin={1} aria-valuemax={STAGES.length} aria-valuenow={currentStageIndex + 1} aria-valuetext={`${STAGES[currentStageIndex]?.label}: ${STAGES[currentStageIndex]?.description}`}>
          {STAGES.map((item, index) => <button key={item.id} type="button" onClick={() => navigateStage(item.id)} aria-current={stage === item.id ? 'step' : undefined} className={'h-1.5 rounded-full transition-colors ' + (index <= currentStageIndex ? 'bg-primary-400' : 'bg-white/15')} title={item.label} aria-label={`${index + 1}. ${item.label}: ${item.description}`}/>)}
        </div>
      </section>

      <section className="ag-decision-strip" aria-label="ملخص القرار">
        <div className="ag-decision-cell"><span className="ag-decision-label">التوصية المحددة</span><span className="ag-decision-value">{selected?.title ?? 'لم تُحدد بعد'}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">الثقة</span><span className="ag-decision-value">{selected?.confidence ?? 'غير متاح'}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">الحالة</span><span className="ag-decision-value">{statusLabel(selectedStatus)}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">المسؤول</span><span className="ag-decision-value">{selected?.owner ?? 'غير متاح'}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">الموعد</span><span className="ag-decision-value">{formatDeadline(selected?.deadline ?? null)}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">المرحلة</span><span className="ag-decision-value">{STAGES[currentStageIndex]?.label}</span></div>
      </section>

      <nav aria-label="مراحل القرار" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((item, index) => (
          <button key={item.id} type="button" onClick={() => navigateStage(item.id)} className={'stage-pill ' + (stage === item.id ? 'stage-pill-active' : 'hover:border-ink-300 hover:bg-ink-50')} aria-current={stage === item.id ? 'step' : undefined}>
            <span className="block text-xs font-bold">{index + 1}. {item.label}</span>
            <span className="mt-1 block text-[10px] text-ink-500">{item.description}</span>
          </button>
        ))}
      </nav>

      {stage === 'command' && (
        <>
          <section className="rounded-[16px] border border-ink-200 bg-white p-4 shadow-card">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="section-kicker">DECISION READINESS</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${readiness.tone}`}>{readiness.label}</span>
                <span className="text-[10px] text-ink-400">{readiness.detail}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-ink-600">
              <span className="inline-flex items-center gap-1 rounded-xl bg-ink-50 px-2.5 py-2"><UserRound size={13}/> {selected?.owner ?? 'مسؤول غير مثبت'}</span>
              <span className="inline-flex items-center gap-1 rounded-xl bg-ink-50 px-2.5 py-2"><CalendarClock size={13}/> {formatDeadline(selected?.deadline ?? null)}</span>
              <span className="inline-flex items-center gap-1 rounded-xl bg-ink-50 px-2.5 py-2">الأثر: {selected?.expected_impact == null ? 'غير متاح' : formatCurrency(selected.expected_impact)}</span>
            </div>
          </div>
        </section>

          <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
          <Card>
            <CardHeader title="الإشارات التي تستدعي قرارًا" subtitle="اختر الإشارة التي تريد تحويلها إلى مسار قرار." />
            <CardBody>
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <article key={alert.id} className="rounded-[14px] border border-ink-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-700"><AlertTriangle size={17}/></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><SeverityBadge severity={alert.severity}/><span className="text-[10px] text-ink-400">{relativeTime(alert.created_at)}</span></div>
                        <div className="mt-2 text-[13px] font-black text-ink-900">{alert.title}</div>
                        {alert.description && <p className="mt-1 text-[11px] leading-5 text-ink-500">{alert.description}</p>}
                        <Link to="/trust" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary-700">فحص المصدر أولًا <ArrowUpLeft size={13}/></Link>
                      </div>
                    </div>
                  </article>
                ))}
                {!activeAlerts.length && <EmptyState title="لا توجد إشارات نشطة" message="لا توجد تنبيهات غير مقروءة في المصدر الحالي." action={<Link to="/trust" className="btn-secondary text-[11px]">فحص الثقة</Link>}/>} 
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="مرشحات القرار" subtitle="التوصية هي مرشح، وليست نتيجة تنفيذية محفوظة." />
            <CardBody>
              <div className="space-y-3">
                {recommendations.slice(0, 6).map((recommendation) => <RecommendationCard key={recommendation.id} recommendation={recommendation} active={selectedId === recommendation.id} onClick={() => selectRecommendation(recommendation.id)} />)}
                {!recommendations.length && <EmptyState title="لا توجد توصيات" message="لا يتم إنشاء توصية بديلة عند غياب بيانات المصدر." action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>}/>} 
              </div>
            </CardBody>
          </Card>
          </section>
        </>
      )}

      {stage === 'evidence' && (
        <section className="grid gap-4 xl:grid-cols-[.82fr_1.18fr]">
          <Card>
            <CardHeader title="اختيار التوصية" subtitle="حدد عنصرًا حقيقيًا من المصدر." />
            <CardBody>
              <div className="space-y-2">
                {recommendations.map((recommendation) => <RecommendationCard key={recommendation.id} recommendation={recommendation} active={selectedId === recommendation.id} onClick={() => selectRecommendation(recommendation.id, 'evidence')} />)}
                {!recommendations.length && <EmptyState title="لا توجد توصيات" message="لا يمكن فحص دليل لعنصر غير موجود." action={<Link to="/import" className="btn-primary text-[11px]">إضافة مصدر</Link>}/>} 
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="مساحة الدليل" subtitle="المصدر، السياق، والثقة قبل القرار." action={selected ? <ConfidenceBadge confidence={selected.confidence} /> : undefined} />
            <CardBody>
              {selected ? (
                <div className="space-y-4">
                  <div className="rounded-[14px] border border-ink-200 bg-ink-50/70 p-4">
                    <div className="surface-label">موضوع القرار</div>
                    <h2 className="mt-1 text-lg font-black text-ink-950">{selected.title}</h2>
                    {selected.description && <p className="mt-2 text-[12px] leading-6 text-ink-600">{selected.description}</p>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[12px] border border-ink-100 bg-white p-3"><div className="text-[10px] text-ink-400">الحالة</div><div className="mt-1 text-[12px] font-black text-ink-900">{selectedStatus ?? 'غير متاح'}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-3"><div className="text-[10px] text-ink-400">الثقة</div><div className="mt-1"><ConfidenceBadge confidence={selected.confidence}/></div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-3"><div className="text-[10px] text-ink-400">الأثر المتوقع</div><div className="mt-1 text-[12px] font-black text-ink-900">{selected.expected_impact == null ? 'غير متاح' : formatCurrency(selected.expected_impact)}</div></div>
                  </div>
                  <BlockedState title="الدليل التشغيلي غير مثبت هنا" detail="لا تُعرض بيانات مصدرية مصطنعة ولا يتم تحويل وصف التوصية إلى دليل. الانتقال إلى القرار يحافظ على حالة المراجعة بدل الادعاء بوجود إثبات غير متاح." />
                  <div className="flex flex-wrap gap-2"><button type="button" onClick={() => navigateStage('decision')} className="btn-primary text-[11px]">متابعة إلى القرار <ArrowUpLeft size={13}/></button><Link to="/metrics" className="btn-secondary text-[11px]">فحص تعريف المؤشر <FileSearch size={13}/></Link></div>
                </div>
              ) : <EmptyState title="اختر توصية" message="اختر عنصرًا موجودًا لفحص سياق الدليل." action={<Link to="/command-center" className="btn-secondary text-[11px]">العودة إلى الإشارات</Link>}/>} 
            </CardBody>
          </Card>
        </section>
      )}

      {stage === 'decision' && (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
          <Card>
            <CardHeader title="صياغة القرار" subtitle="حوّل الإشارة إلى إجراء مقترح دون تسجيل نتيجة لم تحدث." />
            <CardBody>
              {selected ? (
                <div className="space-y-4">
                  <div className="rounded-[14px] border border-primary-100 bg-primary-50/40 p-4">
                    <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black text-primary-700">التوصية المختارة</span><PriorityBadge priority={selected.priority}/><ConfidenceBadge confidence={selected.confidence}/></div>
                    <h2 className="mt-2 text-lg font-black text-ink-950">{selected.title}</h2>
                    {selected.description && <p className="mt-1 text-[11px] leading-5 text-ink-600">{selected.description}</p>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">ما نعرفه</div><div className="mt-2 text-[12px] font-bold text-ink-900">{statusLabel(selected.status)}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">المسؤول</div><div className="mt-2 text-[12px] font-bold text-ink-900">{selected.owner ?? 'غير مثبت'}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">الموعد</div><div className="mt-2 text-[12px] font-bold text-ink-900">{formatDeadline(selected.deadline)}</div></div>
                    <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">ما لا نعرفه بعد</div><div className="mt-2 text-[12px] font-bold text-ink-900">نتيجة تشغيلية مثبتة بعد التنفيذ.</div></div>
                  </div>
                </div>
              ) : <EmptyState title="لا يوجد مرشح قرار" message="اختر توصية من خطوة الدليل أولًا." />}
            </CardBody>
          </Card>
          <div className="space-y-4">
            <BlockedState title="القرار المحفوظ غير متاح من هذه الواجهة" detail="لا تتم كتابة حالة قرار محلية أو إنشاء موافقة اصطناعية. يتطلب الحفظ مسار الصلاحية والـDML المعتمدين." />
            <div className="grid gap-3">
              <div className="rounded-[12px] border border-ink-200 bg-white p-4"><div className="flex items-center gap-2 text-[12px] font-black"><CheckCircle2 size={15} className="text-success-700"/> التوصية</div><p className="mt-1 text-[10px] text-ink-400">موجودة في المصدر</p></div>
              <div className="rounded-[12px] border border-ink-200 bg-white p-4"><div className="flex items-center gap-2 text-[12px] font-black"><ShieldCheck size={15} className="text-warning-700"/> الموافقة</div><p className="mt-1 text-[10px] text-ink-400">تحتاج مسارًا تشغيليًا موثقًا</p></div>
              <div className="rounded-[12px] border border-ink-200 bg-white p-4"><div className="flex items-center gap-2 text-[12px] font-black"><XCircle size={15} className="text-ink-400"/> النتيجة</div><p className="mt-1 text-[10px] text-ink-400">ليست مثبتة بعد</p></div>
            </div>
            <button type="button" onClick={() => navigateStage('approval')} className="btn-secondary w-full justify-center text-[11px]">عرض مرحلة الموافقة <ArrowUpLeft size={13}/></button>
          </div>
        </section>
      )}

      {stage === 'approval' && (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="الموافقة والمسؤولية" subtitle="من يعتمد؟ وعلى أي دليل؟" />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">المسؤول المعتمد</div><div className="mt-2 text-[12px] font-black text-ink-900">غير متاح</div></div>
                <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">وقت الاعتماد</div><div className="mt-2 text-[12px] font-black text-ink-900">غير متاح</div></div>
                <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">الصلاحية</div><div className="mt-2 text-[12px] font-black text-ink-900">يتطلب جلسة موثقة</div></div>
                <div className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">الدليل</div><div className="mt-2 text-[12px] font-black text-ink-900">يحتاج إثباتًا حيًا</div></div>
              </div>
            </CardBody>
          </Card>
          <BlockedState title="الموافقة محجوبة عمدًا" detail="المنتج لا يختلق صاحب موافقة، توقيتًا، أو حالة اعتماد. عند توفر المسار التشغيلي الموثق، تبقى هذه المرحلة مكانًا واضحًا للمسؤولية قبل التنفيذ." />
        </section>
      )}

      {stage === 'work' && (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
          <Card>
            <CardHeader title="التنفيذ والمتابعة" subtitle="ما تم فعليًا، وليس ما تتمنى المنظومة حدوثه." />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['المسؤول الحالي', selected?.owner ?? 'غير مثبت'],
                  ['الموعد', formatDeadline(selected?.deadline ?? null)],
                  ['حالة التوصية', statusLabel(selectedStatus)],
                  ['الأثر المتوقع', selected?.expected_impact == null ? 'غير متاح' : formatCurrency(selected.expected_impact)],
                  ['الأثر الفعلي', selected?.impact_result ?? 'غير متاح بعد'],
                  ['الإشارة التالية', selected?.impact_result ? 'الانتقال إلى النتيجة والتعلّم' : 'انتظار سجل تنفيذ موثق'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[12px] border border-ink-100 bg-white p-4"><div className="text-[10px] text-ink-400">{label}</div><div className="mt-2 text-[12px] font-black text-ink-900">{value}</div></div>
                ))}
              </div>
            </CardBody>
          </Card>
          <BlockedState title="لا يوجد سجل تنفيذ مُثبت" detail="لن يتم إنشاء مهمة أو حالة إنجاز من واجهة القرار. التنفيذ يجب أن يأتي من المسار التشغيلي المعتمد ويعود هنا كحالة persisted." />
        </section>
      )}

      {stage === 'outcome' && (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
          <Card>
            <CardHeader title="النتيجة والتعلّم" subtitle="المتوقع مقابل الفعلي لا يظهر إلا بعد وجود نتيجة حقيقية." />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['المتوقع', selected?.expected_impact == null ? 'غير متاح' : formatCurrency(selected.expected_impact)],
                  ['الفعلي', 'غير متاح بعد'],
                  ['الفارق', 'لا يمكن حسابه بعد'],
                  ['جودة النتيجة', 'غير متاحة'],
                  ['ملاحظات التنفيذ', 'غير متاحة'],
                  ['إشارة التعلّم', 'غير مثبتة'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[12px] border border-ink-100 bg-white p-4">
                    <div className="text-[10px] text-ink-400">{label}</div>
                    <div className="mt-2 text-[12px] font-black text-ink-900">{value}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
          <BlockedState title="النتيجة الفعلية غير موجودة بعد" detail="عدم توفر النتيجة ليس فشلًا في العرض؛ إنه حد حقيقي في الدليل. لن تُحوّل التوصية إلى نتيجة أو تعلّم تشغيلي قبل وجود سجل تنفيذ موثق." />
        </section>
      )}

      {selected && stage !== 'command' && (
        <div className="flex flex-col gap-3 rounded-[14px] border border-ink-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><div className="surface-label">السياق الحالي</div><div className="mt-1 truncate text-sm font-black text-ink-900">{selected.title}</div></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => navigateStage(STAGES[Math.max(0, currentStageIndex - 1)].id)} className="btn-secondary text-[11px]" disabled={currentStageIndex === 0}>السابق <ChevronLeft size={13}/></button><button type="button" onClick={() => navigateStage(STAGES[Math.min(STAGES.length - 1, currentStageIndex + 1)].id)} className="btn-primary text-[11px]" disabled={currentStageIndex === STAGES.length - 1}>التالي <ArrowUpLeft size={13}/></button></div>
        </div>
      )}
    </div>
  );
}
