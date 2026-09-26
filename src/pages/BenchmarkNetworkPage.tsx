import { Database, ShieldCheck, Upload, ArrowUpLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';

export function BenchmarkNetworkPage() {
  return (
    <div dir="rtl" className="space-y-5 animate-fade-in">
      <PageHeader title="شبكة المقارنة" subtitle="Benchmark Network — مقارنة خارجية لا تظهر إلا عندما تتوفر عينة نظيرة ودليل مصدر قابل للمراجعة." />
      <section className="rounded-[20px] border border-warning-200 bg-warning-50/70 p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="section-kicker">BENCHMARK NETWORK</span><Badge variant="warning">INSUFFICIENT_SAMPLE</Badge></div>
            <h1 className="mt-2 text-[24px] font-black text-ink-950">لا توجد عينة نظيرة كافية للمقارنة</h1>
            <p className="mt-2 max-w-3xl text-[12px] leading-6 text-ink-600">لا يعرض الأغبري ترتيبًا أو نسبة مئوية من دون cohort نظير مثبت ومصدر يمكن تتبعه. هذه الحالة ليست صفرًا وليست نتيجة سلبية؛ إنها نقص عينة موثق.</p>
          </div>
          <ShieldCheck className="shrink-0 text-warning-700" size={34} />
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <Card><CardBody><div className="text-[10px] text-ink-400">حجم العينة النظيرة</div><div className="mt-2 text-2xl font-black text-ink-900">غير متاح</div><div className="mt-1 text-[10px] text-ink-500">لا يوجد مصدر benchmark مسجل.</div></CardBody></Card>
        <Card><CardBody><div className="text-[10px] text-ink-400">الرتبة/المئين</div><div className="mt-2 text-2xl font-black text-ink-900">غير متاح</div><div className="mt-1 text-[10px] text-ink-500">لن يتم حساب ترتيب من بيانات الشركة وحدها.</div></CardBody></Card>
        <Card><CardBody><div className="text-[10px] text-ink-400">حالة الدليل</div><div className="mt-2 text-2xl font-black text-warning-800">INSUFFICIENT_SAMPLE</div><div className="mt-1 text-[10px] text-ink-500">انتظر عينة نظيرة قابلة للمراجعة.</div></CardBody></Card>
      </section>
      <section className="rounded-[16px] border border-ink-200 bg-white p-5 shadow-card">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 text-primary-700" size={19} />
          <div>
            <h2 className="text-sm font-black text-ink-900">ما الذي ينقص لتفعيل المقارنة؟</h2>
            <p className="mt-1 text-[11px] leading-6 text-ink-500">يحتاج المسار إلى مصدر benchmark/peer cohort موثق ونافذة زمنية وهوية قطاعية واضحة، ثم يمر عبر طبقة الثقة قبل استخدامه في القرار. لا يوجد جدول benchmark فعلي في مخطط الـstaging الحالي، لذلك لا يتم تصنيع أي percentile أو مقارنة.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/import" className="btn-primary text-[11px]"><Upload size={13}/> إدخال مصدر</Link>
          <Link to="/trust" className="btn-secondary text-[11px]">فحص الثقة <ArrowUpLeft size={13}/></Link>
        </div>
      </section>
    </div>
  );
}
