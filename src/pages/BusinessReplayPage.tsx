import { History, ShieldCheck, ArrowUpLeft, Database, Target } from 'lucide-react';
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
      {!hasReplay && <section className="rounded-[16px] border border-warning-200 bg-warning-50 p-5">
        <div className="text-sm font-black text-warning-950">INSUFFICIENT DATA</div>
        <p className="mt-2 text-[11px] leading-6 text-warning-900">لتمكين Business Replay يلزم وجود business snapshots ونتائج توصيات بعد إتمام عناصر العمل. لا يتم استنتاج تاريخ تشغيلي من السجلات الحالية وحدها.</p>
        <div className="mt-4 flex flex-wrap gap-2"><Link to="/import" className="btn-primary text-[11px]">إدخال مصدر <ArrowUpLeft size={13}/></Link><Link to="/decision-experience" className="btn-secondary text-[11px]">مساحة القرار <ArrowUpLeft size={13}/></Link></div>
      </section>}
    </div>
  );
}
