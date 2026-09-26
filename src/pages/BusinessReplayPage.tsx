import { History, ShieldCheck, ArrowUpLeft, Database, Target, CheckCircle2, CircleAlert, Clock3, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader, ErrorState, LoadingState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';
import { fetchBusinessReplaySnapshot, type BusinessReplaySnapshot } from '@/lib/queries';
import { formatNumber } from '@/lib/format';

export function BusinessReplayPage() {
  const [snapshot, setSnapshot] = useState<BusinessReplaySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSnapshot(await fetchBusinessReplaySnapshot());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل سجل إعادة التشغيل');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState message="جارٍ قراءة snapshots ونتائج التنفيذ..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  const hasReplay = Boolean(snapshot && snapshot.snapshotCount > 0 && snapshot.outcomeCount > 0);
  const eventTone = (kind: BusinessReplaySnapshot['events'][number]['kind']) => kind === 'OUTCOME' ? 'bg-success-50 text-success-700' : kind === 'WORK' ? 'bg-primary-50 text-primary-700' : 'bg-ink-100 text-ink-600';
  const eventLabel = (kind: BusinessReplaySnapshot['events'][number]['kind']) => kind === 'OUTCOME' ? 'نتيجة' : kind === 'WORK' ? 'تنفيذ' : 'لقطة';
  const eventIcon = (kind: BusinessReplaySnapshot['events'][number]['kind']) => kind === 'OUTCOME' ? CheckCircle2 : kind === 'WORK' ? Clock3 : Layers3;
  return (
    <div dir="rtl" className="space-y-5 animate-fade-in">
      <PageHeader title="Business Replay" subtitle="إعادة قراءة ما حدث فعليًا من snapshots ونتائج تنفيذ محفوظة، دون إعادة بناء تاريخ غير موجود." />
      <section className="rounded-[20px] border border-primary-100 bg-primary-50/50 p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="section-kicker">BUSINESS REPLAY</span><Badge variant={hasReplay ? 'success' : 'warning'}>{hasReplay ? 'AVAILABLE' : 'INSUFFICIENT_DATA'}</Badge></div>
            <h1 className="mt-2 text-[24px] font-black text-ink-950">{hasReplay ? 'يوجد تاريخ تشغيلي قابل لإعادة القراءة' : 'لا يوجد تاريخ تشغيلي كافٍ لإعادة التشغيل'}</h1>
            <p className="mt-2 max-w-3xl text-[12px] leading-6 text-ink-600">{hasReplay ? 'إعادة التشغيل تقرأ snapshots ونتائج outcome محفوظة فقط.' : 'لا توجد أحداث أو نتائج سابقة محفوظة لإعادة التشغيل. غياب snapshots/outcomes حالة حقيقية وليست فشلًا مخفيًا.'}</p>
          </div>
          <History className={hasReplay ? 'text-primary-700' : 'text-warning-700'} size={36} />
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <Card><CardBody><div className="flex items-center gap-2 text-[10px] text-ink-400"><Database size={14}/> snapshots</div><div className="mt-2 text-2xl font-black text-ink-900">{formatNumber(snapshot?.snapshotCount ?? 0)}</div><div className="mt-1 text-[10px] text-ink-500">آخر لقطة: {snapshot?.latestSnapshotAt ?? 'غير متاح'}</div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-2 text-[10px] text-ink-400"><Target size={14}/> outcomes</div><div className="mt-2 text-2xl font-black text-ink-900">{formatNumber(snapshot?.outcomeCount ?? 0)}</div><div className="mt-1 text-[10px] text-ink-500">آخر نتيجة: {snapshot?.latestOutcomeAt ?? 'غير متاح'}</div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-2 text-[10px] text-ink-400"><ShieldCheck size={14}/> عناصر العمل</div><div className="mt-2 text-2xl font-black text-ink-900">{formatNumber(snapshot?.workItemCount ?? 0)}</div><div className="mt-1 text-[10px] text-ink-500">تُقرأ كدليل تنفيذ فقط، لا كتوقع.</div></CardBody></Card>
      </section>
      <section className="rounded-[16px] border border-ink-200 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="section-kicker">REPLAY TIMELINE</div>
            <h2 className="mt-1 text-lg font-black text-ink-950">ما الذي حدث فعليًا؟</h2>
            <p className="mt-1 max-w-3xl text-[11px] leading-6 text-ink-500">السجل التالي يعرض نافذة قراءة محدودة من snapshots والتنفيذ والنتائج المحفوظة. لا يتم استنتاج أحداث مفقودة أو ترتيب خارجي غير مثبت.</p>
          </div>
          {snapshot && <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-3 py-1.5 text-[10px] font-bold text-ink-600"><Layers3 size={13}/> نافذة القراءة: أحدث {formatNumber(snapshot.windowLimit)}</span>}
        </div>
        {snapshot?.hasMoreHistory && <div role="status" className="mt-4 rounded-xl border border-ink-200 bg-ink-50/70 px-3 py-2 text-[10px] leading-5 text-ink-600">توجد سجلات أقدم خارج نافذة القراءة الحالية؛ المعروض ليس إجمالي التاريخ.</div>}
        {snapshot?.events.length ? (
          <div className="mt-5 space-y-3">
            {snapshot.events.map((event) => {
              const Icon = eventIcon(event.kind);
              return <article key={`${event.kind}-${event.id}`} className="rounded-[14px] border border-ink-100 bg-ink-50/40 p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${eventTone(event.kind)}`}><Icon size={17}/></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-[9px] font-black ${eventTone(event.kind)}`}>{eventLabel(event.kind)}</span>
                      {event.status && <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-ink-600">{event.status}</span>}
                      {event.evidencePresent ? <span className="rounded-full bg-success-50 px-2 py-1 text-[9px] font-black text-success-700"><ShieldCheck size={11} className="inline-block ml-1"/>دليل مرتبط</span> : <span className="rounded-full bg-warning-50 px-2 py-1 text-[9px] font-black text-warning-800"><CircleAlert size={11} className="inline-block ml-1"/>دليل غير ظاهر</span>}
                      <time className="mr-auto text-[9px] text-ink-400" dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString('ar-YE')}</time>
                    </div>
                    <h3 className="mt-2 text-[13px] font-black text-ink-900">{event.title}</h3>
                    {event.detail && <p className="mt-1 text-[10px] leading-5 text-ink-500">{event.detail}</p>}
                    {(event.expectedImpact !== null || event.actualImpact !== null || event.qualityScore !== null) && <div className="mt-3 flex flex-wrap gap-2">
                      {event.expectedImpact !== null && <span className="rounded-lg bg-white px-2.5 py-1 text-[9px] font-bold text-ink-600">المتوقع: {formatNumber(event.expectedImpact)}</span>}
                      {event.actualImpact !== null && <span className="rounded-lg bg-white px-2.5 py-1 text-[9px] font-bold text-success-700">الفعلي: {formatNumber(event.actualImpact)}</span>}
                      {event.qualityScore !== null && <span className="rounded-lg bg-white px-2.5 py-1 text-[9px] font-bold text-primary-700">جودة: {Math.round(event.qualityScore * 100)}%</span>}
                    </div>}
                  </div>
                </div>
              </article>;
            })}
          </div>
        ) : <div className="mt-5 rounded-[14px] border border-dashed border-ink-200 bg-ink-50/50 p-8 text-center">
          <History className="mx-auto text-ink-300" size={26}/>
          <div className="mt-2 text-sm font-black text-ink-700">لا توجد أحداث محفوظة لإعادة القراءة</div>
          <p className="mt-1 text-[10px] leading-5 text-ink-400">لا يتم تركيب خط زمني افتراضي من أي مصدر آخر.</p>
        </div>}
      </section>
      {!hasReplay && <section className="rounded-[16px] border border-warning-200 bg-warning-50 p-5">
        <div className="text-sm font-black text-warning-950">INSUFFICIENT DATA</div>
        <p className="mt-2 text-[11px] leading-6 text-warning-900">لتمكين Business Replay يلزم وجود business snapshots ونتائج توصيات بعد إتمام عناصر العمل. لا يتم استنتاج تاريخ تشغيلي من السجلات الحالية وحدها.</p>
        <div className="mt-4 flex flex-wrap gap-2"><Link to="/import" className="btn-primary text-[11px]">إدخال مصدر <ArrowUpLeft size={13}/></Link><Link to="/decision-experience" className="btn-secondary text-[11px]">مساحة القرار <ArrowUpLeft size={13}/></Link></div>
      </section>}
    </div>
  );
}
