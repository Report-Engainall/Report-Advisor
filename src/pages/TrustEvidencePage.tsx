import { ArrowLeft, CheckCircle2, FileSearch, GitBranch, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { fetchDataQualitySnapshot } from '@/lib/data-quality-snapshot';

const states = [
  { key: 'verified', title: 'VERIFIED', text: 'بيانات قابلة للإثبات من المسار الكانوني.', tone: 'bg-success-50 text-success-700', icon: CheckCircle2 },
  { key: 'review', title: 'REVIEW', text: 'تحتاج مراجعة قبل استخدامها في قرار.', tone: 'bg-warning-50 text-warning-700', icon: FileSearch },
  { key: 'blocked', title: 'BLOCKED', text: 'محجوبة عن القرار حتى معالجة السبب.', tone: 'bg-danger-50 text-danger-700', icon: ShieldCheck },
  { key: 'partial', title: 'PARTIAL', text: 'متاحة جزئيًا مع حدود معلنة.', tone: 'bg-primary-50 text-primary-700', icon: GitBranch },
] as const;

export function TrustEvidencePage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchDataQualitySnapshot>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { fetchDataQualitySnapshot().then(setSnapshot).catch(e => setError(e instanceof Error ? e.message : 'تعذر قراءة حالة الثقة')); }, []);
  if (!snapshot && !error) return <LoadingState message="جارٍ قراءة حالة الثقة من المصدر..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  return <div dir="rtl" className="space-y-6 animate-fade-in">
    <PageHeader title="مركز الثقة والأدلة" subtitle="طبقة واحدة لفهم مصدر الرقم، حالته، حدوده، وما إذا كان صالحًا للاستخدام في قرار." />
    <section className="ag-command-hero rounded-[1.75rem] p-6 text-white lg:p-8">
      <div className="max-w-3xl">
        <div className="text-[10px] font-black tracking-[.14em] text-primary-200">TRUTH CONTROL PLANE</div>
        <h2 className="mt-3 text-2xl font-black lg:text-3xl">لا رقم بلا سياق، ولا قرار بلا دليل.</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">الواجهة لا ترفع درجة الثقة من تلقاء نفسها. كل حالة مرتبطة بحالة المصدر أو جودة البيانات الفعلية.</p>
      </div>
    </section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {states.map(({ key, title, text, tone, icon: Icon }) => <Card key={key} className="ag-dashboard-module"><CardBody><div className="flex items-center justify-between"><span className={'rounded-full px-2.5 py-1 text-[9px] font-black '+tone}>{title}</span><Icon size={18} className="text-ink-400"/></div><p className="mt-4 text-xs leading-6 text-ink-500">{text}</p></CardBody></Card>)}
    </section>
    <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <Card><CardHeader title="حالة جودة البيانات الحالية" subtitle={snapshot?.status ?? 'غير متاح'} /><CardBody className="space-y-3">{snapshot?.entities?.slice(0,6).map(entity => <div key={entity.key} className="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/40 px-3 py-3"><span className="text-xs font-bold text-ink-800">{entity.label}</span><span className="text-xs font-black text-ink-500">{entity.issues} مشكلة</span></div>)}</CardBody></Card>
      <Card><CardHeader title="مسارات الإثبات" /><CardBody className="space-y-2">
        <Link to="/metrics" className="flex items-center justify-between rounded-xl border border-ink-100 p-3 text-xs font-bold hover:border-primary-200 hover:bg-primary-50"><span>تفسير المؤشرات</span><ArrowLeft size={14}/></Link>
        <Link to="/data-quality" className="flex items-center justify-between rounded-xl border border-ink-100 p-3 text-xs font-bold hover:border-primary-200 hover:bg-primary-50"><span>جودة البيانات</span><ArrowLeft size={14}/></Link>
        <Link to="/import/analyze" className="flex items-center justify-between rounded-xl border border-ink-100 p-3 text-xs font-bold hover:border-primary-200 hover:bg-primary-50"><span>أدلة المستندات</span><ArrowLeft size={14}/></Link>
      </CardBody></Card>
    </section>
  </div>;
}
