import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchImportEvidenceSnapshot, type ImportEvidenceSnapshot } from '@/lib/queries';
import { entityLabel, specialtyLabel } from '@/lib/import/canonical-labels';
import { formatDateTime, formatNumber } from '@/lib/format';

export function ImportedReportContext() {
  const [searchParams] = useSearchParams();
  const importId = searchParams.get('import')?.trim() ?? '';
  const [snapshot, setSnapshot] = useState<ImportEvidenceSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!importId) {
      setSnapshot(null);
      setError(null);
      setLoading(false);
      return () => { cancelled = true; };
    }
    setLoading(true);
    setError(null);
    void fetchImportEvidenceSnapshot(importId)
      .then((value) => {
        if (!cancelled) setSnapshot(value);
      })
      .catch((cause) => {
        if (!cancelled) {
          setSnapshot(null);
          setError(cause instanceof Error ? cause.message : 'تعذر قراءة لقطة المصدر.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [importId]);

  if (!importId) return null;

  if (loading) {
    return (
      <section dir="rtl" className="rounded-2xl border border-primary-200 bg-primary-50/50 p-4 shadow-sm" aria-label="سياق المصدر المستورد">
        <div className="flex items-center gap-2 text-xs font-black text-primary-800"><Loader2 size={15} className="animate-spin" /> جارٍ قراءة لقطة المصدر الموثقة...</div>
      </section>
    );
  }

  if (error || !snapshot) {
    return (
      <section dir="rtl" className="rounded-2xl border border-warning-200 bg-warning-50 p-4" aria-label="حالة سياق المصدر المستورد">
        <div className="flex items-start gap-2 text-warning-900"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><div><div className="text-xs font-black">سياق المصدر غير مثبت بالكامل</div><p className="mt-1 text-[11px] leading-5">لا تُنسب مؤشرات التقرير إلى هذا الملف دون لقطة Evidence صالحة. {error ? String(error) : 'لم يتم العثور على لقطة لهذا الاستيراد.'}</p></div></div>
        <Link to={`/trust?import=${encodeURIComponent(importId)}`} className="mt-3 inline-flex min-h-10 items-center rounded-xl border border-warning-300 bg-white px-3 text-[10px] font-black text-warning-900">مراجعة Evidence Passport</Link>
      </section>
    );
  }

  return (
    <section dir="rtl" className="rounded-2xl border border-success-200 bg-success-50/45 p-4 shadow-sm" aria-label="سياق التقرير المرتبط بالمصدر">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-success-200 bg-white/80 px-2 py-1 text-[9px] font-black text-success-800"><ShieldCheck size={12} /> SOURCE-BOUND EVIDENCE</span>
            <span className="rounded-full border border-success-200 bg-white/80 px-2 py-1 text-[9px] font-black text-success-800">VERIFIED SNAPSHOT</span>
          </div>
          <h2 className="mt-2 truncate text-sm font-black text-ink-950">{snapshot.source_path.split('/').pop() || snapshot.source_path}</h2>
          <p className="mt-1 text-[10px] leading-5 text-ink-600">هذه اللقطة تثبت المصدر والبيانات المرتبطة بالاستيراد. مؤشرات التقرير أدناه تبقى مؤشرات الحقيقة الكانونية الحالية ما لم يحدد التقرير نطاقًا خاصًا بالمصدر؛ لا يتم تصنيع KPI من الملف لمجرد فتح الرابط.</p>
        </div>
        <Link to={`/trust?import=${encodeURIComponent(importId)}`} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-success-300 bg-white px-3 text-[10px] font-black text-success-800 hover:bg-success-50">فتح Evidence Passport</Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-white/90 bg-white/80 p-2.5"><div className="text-[8px] text-ink-400">التخصص</div><div className="mt-1 text-[10px] font-black text-ink-900">{specialtyLabel(snapshot.metadata?.sourceSpecialty as string | undefined)} / {entityLabel(snapshot.entity_type)}</div></div>
        <div className="rounded-xl border border-white/90 bg-white/80 p-2.5"><div className="text-[8px] text-ink-400">الصفوف</div><div className="mt-1 text-[10px] font-black text-ink-900">{formatNumber(snapshot.row_count)}</div></div>
        <div className="rounded-xl border border-white/90 bg-white/80 p-2.5"><div className="text-[8px] text-ink-400">الجودة</div><div className="mt-1 text-[10px] font-black text-ink-900">{snapshot.quality_score == null ? 'غير متاح' : `${snapshot.quality_score}%`}</div></div>
        <div className="rounded-xl border border-white/90 bg-white/80 p-2.5"><div className="text-[8px] text-ink-400">Evidence Snapshot</div><div className="mt-1 flex items-center gap-1 text-[10px] font-black text-success-800"><CheckCircle2 size={12} /> {formatDateTime(snapshot.created_at)}</div></div>
      </div>
      <div className="mt-2 break-all font-mono text-[8px] text-ink-400">import={importId} · source_hash={snapshot.source_hash}</div>
    </section>
  );
}
