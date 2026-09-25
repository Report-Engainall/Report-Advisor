import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowUpLeft, CheckCircle2, ClipboardCheck, Clock3, Target, UserRound, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfidenceBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { fetchRecommendations, updateRecommendationStatus } from '@/lib/queries';
import { formatCurrency, relativeTime } from '@/lib/format';
import type { Recommendation } from '@/lib/types';

type Filter = 'all' | 'new' | 'accepted' | 'rejected';

function statusLabel(status: string): string {
  if (status === 'new') return 'جديدة';
  if (status === 'accepted') return 'مقبولة';
  if (status === 'rejected') return 'مرفوضة';
  return status || 'غير محددة';
}

function impactLabel(item: Recommendation): string {
  if (item.impact_result) return 'نتيجة أثر مسجلة';
  if (item.expected_impact !== null) return 'أثر متوقع مسجل';
  return 'الأثر غير مثبت';
}

function deadlineLabel(value: string | null): string {
  if (!value) return 'الموعد غير محدد';
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime())
    ? new Intl.DateTimeFormat('ar-YE', { year: 'numeric', month: 'short', day: 'numeric' }).format(parsed)
    : 'الموعد غير قابل للقراءة';
}

function Stage({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/70 p-3">
      <div className="flex items-center gap-2 text-[10px] font-black text-ink-400">{icon}{title}</div>
      <div className="mt-1 text-[11px] font-black text-ink-800">{value}</div>
    </div>
  );
}

export function DecisionPlaybooksPage() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await fetchRecommendations());
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل التوصيات لبناء مسارات القرار');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => ({
    all: items.length,
    new: items.filter(item => item.status === 'new').length,
    accepted: items.filter(item => item.status === 'accepted').length,
    rejected: items.filter(item => item.status === 'rejected').length,
    owner: items.filter(item => Boolean(item.owner)).length,
    impact: items.filter(item => item.expected_impact !== null || item.impact_result !== null).length,
  }), [items]);

  const visibleItems = filter === 'all' ? items : items.filter(item => item.status === filter);

  const handleStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      setPendingId(id);
      setError(null);
      await updateRecommendationStatus(id, status);
      setItems(current => current.map(item => item.id === id ? { ...item, status } : item));
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحديث حالة القرار');
    } finally {
      setPendingId(null);
    }
  };

  if (loading) return <LoadingState message="جارٍ تجميع مسارات القرار من سجل التوصيات..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div dir="rtl" className="space-y-5 animate-fade-in pb-10">
      <section className="rounded-[20px] border border-ink-800 bg-ink-950 p-5 text-white shadow-elevated lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] font-black text-primary-300"><ClipboardCheck size={16}/>الذكاء والقرار</div>
            <h1 className="mt-2 text-[25px] font-black tracking-tight lg:text-[31px]">مسارات القرار</h1>
            <p className="mt-2 text-[12px] leading-6 text-ink-300">عرض تنفيذي يحول سجل التوصيات الحالي إلى مسار قابل للمراجعة: الدليل → القرار → المالك والموعد → النتيجة. هذه الشاشة لا تنشئ حالات تنفيذية جديدة.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/intelligence" className="btn-secondary border-white/15 bg-white/10 text-white hover:bg-white/15 text-[11px]">مركز الذكاء <ArrowUpLeft size={13}/></Link>
            <Link to="/decision-experience" className="btn-primary text-[11px]">مساحة القرار <ArrowUpLeft size={13}/></Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="ملخص مسارات القرار">
        {[
          ['التوصيات', counts.all, 'السجل الحالي'],
          ['بانتظار القرار', counts.new, 'حالة جديدة'],
          ['مع مالك', counts.owner, 'مسؤول محفوظ'],
          ['مع أثر', counts.impact, 'أثر متوقع أو نتيجة مسجلة'],
        ].map(([label, value, note]) => (
          <div key={String(label)} className="rounded-[14px] border border-ink-200 bg-white p-4 shadow-card">
            <div className="text-[10px] font-black text-ink-400">{label}</div>
            <div className="mt-2 text-[24px] font-black tabular-nums text-ink-950">{value}</div>
            <div className="mt-1 text-[10px] text-ink-400">{note}</div>
          </div>
        ))}
      </section>

      <Card>
        <CardHeader
          title="مرشح المسارات"
          subtitle={visibleItems.length + ' من ' + items.length + ' توصية'}
          action={
            <div className="flex flex-wrap gap-1.5" aria-label="تصفية مسارات القرار">
              {([['all','الكل'],['new','الجديدة'],['accepted','المقبولة'],['rejected','المرفوضة']] as const).map(([key, label]) => (
                <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={filter === key ? 'min-h-9 rounded-full bg-ink-950 px-3 py-1.5 text-[10px] font-bold text-white' : 'min-h-9 rounded-full bg-ink-50 px-3 py-1.5 text-[10px] font-bold text-ink-600 hover:bg-ink-100'}>
                  {label} ({counts[key]})
                </button>
              ))}
            </div>
          }
        />
        <CardBody>
          {visibleItems.length ? (
            <div className="space-y-3">
              {visibleItems.map(item => (
                <article key={item.id} className="rounded-[16px] border border-ink-200 bg-white p-4 transition hover:border-primary-200 hover:shadow-card">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Target size={18}/></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[14px] font-black text-ink-900">{item.title}</h2>
                        <ConfidenceBadge confidence={item.confidence}/>
                        <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-bold text-ink-600">{statusLabel(item.status)}</span>
                        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold text-primary-800">{item.category || 'فئة غير محددة'}</span>
                      </div>
                      {item.description && <p className="mt-2 text-[11px] leading-5 text-ink-500">{item.description}</p>}
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                        <Stage title="الدليل" value="افتح مسار الدليل والقرار" icon={<ClipboardCheck size={13}/>}/>
                        <Stage title="القرار" value={statusLabel(item.status)} icon={<CheckCircle2 size={13}/>}/>
                        <Stage title="المالك" value={item.owner || 'غير محدد'} icon={<UserRound size={13}/>}/>
                        <Stage title="الموعد" value={deadlineLabel(item.deadline)} icon={<Clock3 size={13}/>}/>
                        <Stage title="النتيجة" value={impactLabel(item)} icon={<Target size={13}/>}/>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-ink-400">
                        {item.expected_impact !== null && <span>أثر متوقع: {formatCurrency(item.expected_impact)}</span>}
                        {item.impact_result && <span>نتيجة الأثر: {item.impact_result}</span>}
                        <span>آخر تحديث: {relativeTime(item.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 xl:w-[220px] xl:justify-end">
                      {item.status === 'new' && (
                        <>
                          <button type="button" disabled={pendingId === item.id} onClick={() => void handleStatus(item.id, 'accepted')} className="btn-primary text-[11px]"><CheckCircle2 size={13}/>{pendingId === item.id ? 'جارٍ الحفظ…' : 'قبول القرار'}</button>
                          <button type="button" disabled={pendingId === item.id} onClick={() => void handleStatus(item.id, 'rejected')} className="btn-secondary text-[11px]"><XCircle size={13}/>{pendingId === item.id ? 'جارٍ الحفظ…' : 'رفض القرار'}</button>
                        </>
                      )}
                      <Link to={'/decision-experience?stage=evidence&recommendationId=' + encodeURIComponent(item.id)} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-[11px] font-semibold text-ink-700 hover:bg-ink-50">فتح الدليل والقرار <ArrowUpLeft size={13}/></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <EmptyState title={items.length ? 'لا توجد توصيات في هذا المرشح' : 'لا توجد توصيات يمكن تحويلها إلى مسار قرار'} message={items.length ? 'غيّر عامل التصفية لرؤية الحالات الأخرى.' : 'السجل الحالي لا يحتوي على توصيات مصدرية قابلة للمراجعة. لن يتم اختلاق مسارات أو أرقام بديلة.'}/>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/intelligence" className="btn-secondary text-[11px]">العودة إلى مركز الذكاء <ArrowUpLeft size={13}/></Link>
                <Link to="/trust" className="btn-ghost text-[11px]">فحص الثقة والأدلة <ArrowUpLeft size={13}/></Link>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <section className="rounded-[16px] border border-warning-200 bg-warning-50/60 p-4">
        <div className="flex items-start gap-3">
          <Target size={17} className="mt-0.5 shrink-0 text-warning-700"/>
          <div>
            <div className="text-xs font-black text-warning-900">حدود المسار التنفيذي</div>
            <p className="mt-1 text-[10px] leading-5 text-warning-800">هذه الشاشة لا تسجل موافقة أو تنفيذًا مستقلًا. الحالة، المسؤول، الموعد، الأثر، والثقة مأخوذة من السجل القائم فقط. الإجراء الحساس يبقى عبر مساحة القرار ومساراته المعتمدة.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
