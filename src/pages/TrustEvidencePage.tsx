import { ArrowLeft, CheckCircle2, Eye, FileSearch, GitBranch, History, Landmark, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { fetchDataQualitySnapshot } from '@/lib/data-quality-snapshot';

const states = [
  { title: 'VERIFIED', text: 'بيانات قابلة للإثبات من المسار الكانوني.', tone: 'bg-success-50 text-success-700', icon: CheckCircle2 },
  { title: 'TRUSTED', text: 'حالة ثقة قابلة للاستخدام عندما يثبت المصدر والسياق المطلوب.', tone: 'bg-primary-50 text-primary-700', icon: ShieldCheck },
  { title: 'PARTIAL', text: 'متاحة جزئيًا مع حدود معلنة.', tone: 'bg-primary-50 text-primary-700', icon: GitBranch },
  { title: 'REVIEW', text: 'تحتاج مراجعة قبل استخدامها في قرار.', tone: 'bg-warning-50 text-warning-700', icon: FileSearch },
  { title: 'BLOCKED', text: 'محجوبة عن القرار حتى معالجة السبب.', tone: 'bg-danger-50 text-danger-700', icon: ShieldCheck },
  { title: 'INSUFFICIENT DATA', text: 'المصدر الحالي لا يملك ما يكفي لإصدار نتيجة موثوقة.', tone: 'bg-ink-100 text-ink-700', icon: Eye },
] as const;

const evidenceSurfaces = [
  { title: 'Evidence Passport', detail: 'هوية الدليل ومصدره وسياقه عند توفر السجل.', path: '/import/analyze', available: true, icon: Landmark },
  { title: 'Provenance / Lineage', detail: 'تتبع انتقال الحقيقة من المصدر إلى التحليل.', path: '/data-quality', available: true, icon: GitBranch },
  { title: 'Snapshots / As-of', detail: 'السجل الزمني المعتمد ليس شاشة مستقلة مثبتة حاليًا.', path: '', available: false, icon: History },
  { title: 'Decision Evidence', detail: 'الدليل المرتبط بمساحة القرار الحالية.', path: '/decision-experience?stage=evidence', available: true, icon: ShieldCheck },
  { title: 'Benchmark Governance', detail: 'يتطلب سجل مقارنة وعينة كافية؛ لا تُعرض نتيجة مختلقة.', path: '', available: false, icon: FileSearch },
  { title: 'Metric Inspector', detail: 'فحص المؤشر وحدود الحساب ومصدره.', path: '/metrics', available: true, icon: Eye },
];export function TrustEvidencePage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchDataQualitySnapshot>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchDataQualitySnapshot()
      .then(setSnapshot)
      .catch(e => setError(e instanceof Error ? e.message : 'تعذر قراءة حالة الثقة'));
  }, []);

  const status = snapshot?.status ?? 'INSUFFICIENT DATA';
  const issueTotal = useMemo(() => snapshot?.entities?.reduce((sum, entity) => sum + (entity.issues ?? 0), 0) ?? null, [snapshot]);

  if (!snapshot && !error) return <LoadingState message="جارٍ قراءة حالة الثقة من المصدر..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return <div dir="rtl" className="ag-trust-evidence-surface space-y-6 animate-fade-in pb-10">
    <PageHeader title="مركز الثقة والأدلة" subtitle="طبقة واحدة لفهم مصدر الرقم، حالته، حدوده، وما إذا كان صالحًا للاستخدام في قرار." />
    <section className="ag-command-hero overflow-hidden rounded-[1.75rem] p-6 text-white lg:p-8">
      <div className="max-w-4xl">
        <div className="text-[10px] font-black tracking-[.14em] text-primary-200">TRUTH CONTROL PLANE</div>
        <h2 className="mt-3 text-2xl font-black lg:text-3xl">لا رقم بلا سياق، ولا قرار بلا دليل.</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">الواجهة لا ترفع درجة الثقة من تلقاء نفسها. كل حالة مرتبطة بجودة المصدر أو حدود البيانات الفعلية.</p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-[9px] font-black text-ink-300">CURRENT STATUS</div><div className="mt-1 text-lg font-black">{status}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-[9px] font-black text-ink-300">ENTITIES CHECKED</div><div className="mt-1 text-lg font-black">{snapshot?.entities?.length ?? 0}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-[9px] font-black text-ink-300">ISSUES REPORTED</div><div className="mt-1 text-lg font-black">{issueTotal ?? 'غير متاح'}</div></div>
      </div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {states.map(({ title, text, tone, icon: Icon }) => <Card key={title} className="ag-dashboard-module"><CardBody>
        <div className="flex items-center justify-between gap-3"><span className={'rounded-full px-2.5 py-1 text-[9px] font-black '+tone}>{title}</span><Icon size={18} className="text-ink-400"/></div>
        <p className="mt-4 text-xs leading-6 text-ink-500">{text}</p>
      </CardBody></Card>)}
    </section>    <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
      <Card>
        <CardHeader title="حالة جودة البيانات الحالية" subtitle={snapshot?.status ?? 'غير متاح'} />
        <CardBody className="space-y-2.5">
          {snapshot?.entities?.slice(0, 8).map(entity => <div key={entity.name} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-ink-50/40 px-3 py-3">
            <span className="min-w-0 text-xs font-bold text-ink-800">{entity.name}</span>
            <span className="shrink-0 text-xs font-black text-ink-500">{entity.issues ?? 'غير متاح'} مشكلة</span>
          </div>)}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="مسارات الإثبات" subtitle="الوصول المباشر إلى الأدلة المتاحة فعليًا." />
        <CardBody className="space-y-2.5">
          {evidenceSurfaces.slice(0, 3).map(surface => surface.available
            ? <Link key={surface.title} to={surface.path} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 hover:border-primary-200 hover:bg-primary-50/40">
                <surface.icon size={16} className="text-primary-700"/><span className="min-w-0 flex-1"><strong className="block text-xs">{surface.title}</strong><span className="text-[10px] text-ink-400">{surface.detail}</span></span><ArrowLeft size={13}/>
              </Link>
            : <div key={surface.title} className="rounded-xl border border-warning-200 bg-warning-50/50 p-3">
                <div className="flex items-center gap-2 text-xs font-black text-ink-800"><surface.icon size={16}/>{surface.title}</div><div className="mt-1 text-[10px] leading-5 text-warning-900">{surface.detail}</div>
              </div>)}
        </CardBody>
      </Card>
    </section>    <section className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader title="خريطة الدليل" subtitle="الحالة التشغيلية لكل طبقة تُقرأ من المصدر، وليست شهادة بصرية بحد ذاتها." />
        <CardBody>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {['Source', 'Extraction', 'Normalization', 'Validation', 'Canonical Truth', 'Evidence', 'Signal', 'Decision'].map((stage, index) => <div key={stage} className="relative rounded-xl border border-ink-100 bg-white p-3">
              <div className="text-[9px] font-black tracking-[.12em] text-ink-400">{String(index + 1).padStart(2, '0')}</div>
              <div className="mt-1 text-xs font-black text-ink-800">{stage}</div>
              <div className="mt-1 text-[9px] text-ink-400">الحالة تُحسم من المصدر</div>
            </div>)}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="سطوح الحوكمة" subtitle="ما يتطلب سجلًا إضافيًا يُعرض كغير متاح بدل اختلاق نتيجة." />
        <CardBody className="grid gap-2">
          {evidenceSurfaces.map(surface => surface.available
            ? <Link key={surface.title} to={surface.path} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 hover:border-primary-200 hover:bg-primary-50/40">
                <surface.icon size={15} className="text-primary-700"/><span className="min-w-0 flex-1 text-xs font-bold text-ink-800">{surface.title}</span><ArrowLeft size={13}/>
              </Link>
            : <div key={surface.title} className="flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50/40 p-3">
                <surface.icon size={15} className="text-warning-700"/><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-ink-800">{surface.title}</span><span className="text-[10px] text-warning-900">غير متاح دون سجل موثق كافٍ.</span></span><span className="rounded-full bg-white px-2 py-1 text-[8px] font-black text-warning-800">BLOCKED</span>
              </div>)}
        </CardBody>
      </Card>
    </section>

    <div className="rounded-2xl border border-warning-200 bg-warning-50/60 p-4 text-xs leading-6 text-warning-800">
      الثقة لا تُستنتج من شكل الواجهة. أي غياب في المصدر أو السلسلة أو العينة يبقى ظاهرًا كـ REVIEW / BLOCKED / INSUFFICIENT DATA.
    </div>
  </div>;
}
