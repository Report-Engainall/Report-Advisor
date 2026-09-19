import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import type { InvestigationTarget } from '@/components/BusinessInvestigationDrawer';
const BusinessInvestigationDrawer = lazy(async () => ({ default: (await import('@/components/BusinessInvestigationDrawer')).BusinessInvestigationDrawer }));
import { fetchProfitabilitySnapshot, type ProfitabilitySnapshot } from '@/lib/dashboard-canonical';
import { formatCurrency, formatNumber } from '@/lib/format';

function knownCount(a: number | null, b: number | null): string { if (a == null || b == null) return 'غير متاح'; return formatNumber(a + b); }

export function ProfitabilityReportCanonicalPage() {
  const [snapshot, setSnapshot] = useState<ProfitabilitySnapshot | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [investigation, setInvestigation] = useState<InvestigationTarget | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setSnapshot(await fetchProfitabilitySnapshot()); } catch (e: unknown) { setError(e instanceof Error ? e.message : 'تعذر تحميل الربحية'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]); if (loading) return <LoadingState />; if (error) return <ErrorState message={error} onRetry={load} />; if (!snapshot) return null;
  const calculated = snapshot.status === 'CALCULATED' && snapshot.revenue != null && snapshot.cost != null && snapshot.gross_profit != null;
  const openMetric = (title: string, label: string, value: string, formula?: string) => setInvestigation({
    title,
    eyebrow: 'Money Lens · الربحية',
    severity: calculated ? 'info' : 'warning',
    summary: calculated ? 'القيمة محسوبة من اللقطة المالية المعتمدة. التفسير التجاري يحتاج أدلة إضافية من التفاصيل قبل نسبة السبب أو الأثر.' : 'القيمة المالية غير قابلة للإثبات بالكامل من اللقطة الحالية؛ لن يتم تحويل نقص الدليل إلى صفر.',
    facts: [{ label, value }, { label: 'الحالة', value: calculated ? 'محسوبة' : 'بيانات غير كافية' }, { label: 'العملة', value: snapshot.currency || 'غير محددة' }, { label: 'الفواتير', value: formatNumber(snapshot.invoice_count) }],
    confirmedReasons: calculated ? ['القيمة مشتقة من مسار الربحية المعتمد.'] : [],
    missingEvidence: ['تفاصيل الصفوف التي تمنع اكتمال الدليل إن وجدت.', 'السبب التجاري لأي تغير في الرقم.', 'النتيجة الفعلية لأي إجراء لاحق.'],
    actions: [{ label: 'افتح مركز العمل', path: '/work-center', hint: 'راجع الاستثناءات والبيانات التي تحتاج معالجة.' }, { label: 'افتح تجربة القرار', path: '/decision-experience?stage=evidence', hint: 'افحص الدليل قبل تحويل المؤشر إلى قرار.' }],
    evidence: { source: 'fetchProfitabilitySnapshot', asOf: snapshot.as_of, status: snapshot.status, formula },
  });
  return <div dir="rtl" className="report-page space-y-5 animate-fade-in">
    <PageHeader title="الربحية والهامش" subtitle="Money Lens: الإيراد ← التكلفة ← الهامش ← الثقة، ثم التحقيق في ما تغيّر." actions={<button type="button" onClick={() => window.print()} className="btn-primary print-hide text-xs">طباعة التقرير</button>} />
    <section className="hero-surface p-4">
      <div className="flex flex-wrap items-center gap-3"><span className={`badge ${calculated ? 'badge-success' : 'badge-warning'}`}>{calculated ? 'محسوب من المصدر' : 'بيانات غير كافية'}</span><span className="text-[11px] font-semibold text-ink-500">العملة: {snapshot.currency || 'غير محددة'}</span><span className="text-[11px] font-semibold text-ink-500">حالة العملة: {snapshot.currency_status === 'CONSISTENT' ? 'متسقة' : 'غير كافية'}</span></div>
      <div className="report-meta mt-3"><span>حتى {snapshot.as_of}</span><span>الحسابات المالية من المسار المعتمد</span><span>الأصفار لا تُستخدم لتعويض الدليل المفقود</span></div>
    </section>
    <section className="rounded-[18px] border border-ink-200 bg-white p-4 shadow-card"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="surface-label">MONEY → TRUST → ACTION</div><h2 className="mt-1 text-lg font-black text-ink-900">ما قيمة الربح التي نستطيع إثباتها الآن؟</h2><p className="mt-1 max-w-2xl text-[11px] leading-5 text-ink-500">الرقم المالي لا يكفي وحده؛ النتيجة تحتفظ بحالتها ثم تفتح التحقيق دون اختلاق سبب للتغير.</p></div><button type="button" onClick={() => openMetric('سلسلة إثبات الربحية','حالة الربحية',calculated ? 'موثقة حسابيًا' : 'غير مكتملة','الإيراد − التكلفة = الربح الإجمالي')} className="btn-secondary text-xs">افحص سلسلة الإثبات</button></div><div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-xl border border-ink-100 bg-ink-50 p-3"><div className="surface-label">الهامش</div><div className="mt-1 text-xl font-black">{calculated && snapshot.gross_margin != null ? String(snapshot.gross_margin.toFixed(2)) + '%' : 'غير متاح'}</div></div><div className="rounded-xl border border-ink-100 bg-ink-50 p-3"><div className="surface-label">العملة</div><div className="mt-1 text-sm font-black">{snapshot.currency || 'غير محددة'}</div></div><div className="rounded-xl border border-ink-100 bg-ink-50 p-3"><div className="surface-label">حالة الدليل</div><div className="mt-1 text-sm font-black">{calculated ? 'مسار حسابي مكتمل' : 'تحتاج مراجعة'}</div></div></div></section>
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Card hover onClick={() => openMetric('الإيراد','الإيراد',calculated ? formatCurrency(snapshot.revenue) : 'غير متاح','الإيراد من السجل المالي المعتمد')}><CardBody><div className="surface-label">الإيراد</div><div className="display-number mt-1">{calculated ? formatCurrency(snapshot.revenue) : 'غير متاح'}</div><div className="mt-1 text-[11px] text-ink-400">انقر للتحقيق في سلسلة الرقم</div></CardBody></Card>
      <Card hover onClick={() => openMetric('التكلفة','التكلفة',calculated ? formatCurrency(snapshot.cost) : 'غير متاح','التكلفة من السجل المالي المعتمد')}><CardBody><div className="surface-label">التكلفة</div><div className="display-number mt-1">{calculated ? formatCurrency(snapshot.cost) : 'غير متاح'}</div><div className="mt-1 text-[11px] text-ink-400">لا تُفترض التكلفة عند نقص المصدر</div></CardBody></Card>
      <Card className="hero-surface" hover onClick={() => openMetric('الربح الإجمالي','الربح الإجمالي',calculated ? formatCurrency(snapshot.gross_profit) : 'غير متاح','الإيراد − التكلفة = الربح الإجمالي')}><CardBody><div className="surface-label">الربح الإجمالي</div><div className="display-number mt-1">{calculated ? formatCurrency(snapshot.gross_profit) : 'غير متاح'}</div><div className="mt-1 text-[11px] text-ink-400">نقطة دخول للتحقيق</div></CardBody></Card>
    </section>
    <Card><CardBody><div className="grid grid-cols-2 gap-4 md:grid-cols-4"><div><div className="surface-label">الهامش</div><div className="mt-1 text-lg font-black text-ink-900">{calculated && snapshot.gross_margin != null ? `${snapshot.gross_margin.toFixed(2)}%` : 'غير متاح'}</div></div><div><div className="surface-label">الفواتير</div><div className="mt-1 text-lg font-black text-ink-900">{formatNumber(snapshot.invoice_count)}</div></div><div><div className="surface-label">صفوف مالية ناقصة</div><div className="mt-1 text-lg font-black text-ink-900">{knownCount(snapshot.bad_invoice_rows, snapshot.bad_sale_item_rows)}</div></div><div><div className="surface-label">اختلاف العملة</div><div className="mt-1 text-lg font-black text-ink-900">{formatNumber(snapshot.currency_mismatch_rows)}</div></div></div>{snapshot.reasons.length > 0 && <div className="warning-callout mt-5 text-xs text-warning-800"><div className="font-bold mb-1">أسباب عدم كفاية الدليل</div><ul className="list-disc pr-5 space-y-1">{snapshot.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></div>}</CardBody></Card>
  <Suspense fallback={null}><BusinessInvestigationDrawer target={investigation} onClose={() => setInvestigation(null)} /></Suspense>
  </div>;
}