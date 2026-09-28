import { Database, ShieldCheck, Upload, ArrowUpLeft, CheckCircle2, Clock3, Fingerprint, Scale, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';
import { ReportSurfaceContext } from '@/components/ReportSurfaceContext';

export function BenchmarkNetworkPage() {
  return (
    <div dir="rtl" className="space-y-5 animate-fade-in">
      <PageHeader title="شبكة المقارنة" subtitle="Benchmark Network — مقارنة خارجية لا تظهر إلا عندما تتوفر عينة نظيرة ودليل مصدر قابل للمراجعة." />
      <ReportSurfaceContext
        period="نافذة المقارنة الحالية"
        asOf={new Date().toISOString().slice(0, 10)}
        status="INSUFFICIENT DATA"
        sourceLabel="شبكة المقارنة مغلقة حاليًا لعدم وجود cohort نظير موثق؛ لا يتم تحويل نقص العينة إلى صفر أو ترتيب."
      />
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
      <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Card>
          <CardBody>
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 text-primary-700" size={19} />
              <div className="min-w-0">
                <div className="section-kicker">BENCHMARK GATE</div>
                <h2 className="mt-1 text-lg font-black text-ink-950">بوابة المقارنة الخارجية</h2>
                <p className="mt-1 text-[11px] leading-6 text-ink-500">المقارنة لا تصبح نتيجة قرار إلا بعد اكتمال مصدر النظائر، تعريف المقياس، الفترة، وصحة الدليل. غياب أي عنصر يبقي الحالة مغلقة بدل تخمين ترتيب.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Database, title: 'Peer cohort', detail: 'مجموعة نظيرة موثقة وقابلة للتدقيق.', ok: false },
                { icon: Scale, title: 'تعريف القياس', detail: 'نفس تعريف KPI والصيغة والوحدة.', ok: false },
                { icon: Clock3, title: 'الفترة', detail: 'نافذة زمنية متطابقة مع As Of.', ok: false },
                { icon: Fingerprint, title: 'الدليل', detail: 'مصدر/نسخة/أثر يمكن تتبعه.', ok: false },
              ].map(({ icon: Icon, title, detail, ok }) => <div key={title} className="rounded-xl border border-ink-100 bg-ink-50/60 p-3">
                <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-[11px] font-black text-ink-800"><Icon size={14} className="text-primary-700"/>{title}</span><span className={ok ? 'text-success-700' : 'text-warning-700'}>{ok ? <CheckCircle2 size={15}/> : <span className="text-[9px] font-black">ناقص</span>}</span></div>
                <p className="mt-2 text-[10px] leading-5 text-ink-500">{detail}</p>
              </div>)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/import" className="btn-primary text-[11px]"><Upload size={13}/> إدخال المصدر</Link>
              <Link to="/trust" className="btn-secondary text-[11px]">فحص الثقة <ArrowUpLeft size={13}/></Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 text-[10px] font-black text-primary-700"><TrendingUp size={15}/> كيف ستظهر النتيجة عند اكتمال البوابة؟</div>
            <div className="mt-4 space-y-3">
              {[
                ['المقياس', 'Revenue / Margin / Collection أو KPI محدد'],
                ['أداء الشركة', 'القيمة الموثقة ضمن نفس الفترة والوحدة'],
                ['عينة النظائر', 'حجم cohort ومصدرها ونسخة الدليل'],
                ['المقارنة', 'قيمة النظائر مع median/percentile فقط عند كفاية العينة'],
                ['الثقة', 'حالة الدليل وAs Of والفترة والمصدر'],
                ['الإجراء', 'رابط تحقيق/قرار مرتبط بالمقارنة دون إخفاء حدودها'],
              ].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 border-b border-ink-100 pb-3 last:border-0 last:pb-0"><span className="text-[10px] font-bold text-ink-500">{label}</span><span className="max-w-[70%] text-left text-[10px] font-black text-ink-800">{value}</span></div>)}
            </div>
          </CardBody>
        </Card>
      </section>
      <section className="rounded-[16px] border border-ink-200 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="section-kicker">NO FABRICATION</div>
            <h2 className="mt-1 text-sm font-black text-ink-900">الحالة الحالية ليست نتيجة سلبية</h2>
            <p className="mt-1 text-[11px] leading-6 text-ink-500">لا يوجد جدول benchmark/peer cohort فعلي في مخطط staging الحالي. لذلك لا يعرض الأغبري percentile أو ترتيبًا خارجيًا، ولا يحول غياب العينة إلى صفر.</p>
          </div>
          <ShieldCheck className="shrink-0 text-warning-700" size={25}/>
        </div>
      </section>
    </div>
  );
}
