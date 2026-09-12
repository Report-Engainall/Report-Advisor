import { ArrowLeft, CheckCircle2, FileUp, Gauge, GitBranch, ShieldCheck, Target, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CanonicalImportPage } from '@/pages/CanonicalImportPage';

const journey = [
  ['01', 'استلام', 'الملف يدخل النظام كما هو'],
  ['02', 'Fingerprint', 'SHA-256 ومنع التكرار'],
  ['03', 'Extraction / OCR', 'استخراج النص والجداول مع الثقة'],
  ['04', 'Normalization', 'توحيد الأرقام والتواريخ والحقول'],
  ['05', 'Validation / DQS', 'فحص الجودة والحالات الحرجة'],
  ['06', 'Evidence', 'ربط المصدر والحقل والفترة والثقة'],
  ['07', 'Canonical Data', 'بيانات قابلة للحساب والتحليل'],
  ['08', 'Analysis', 'ما الذي وجدناه؟'],
  ['09', 'Decision', 'ما القرار المقترح؟'],
];

const outcomes = [
  ['المبيعات', 'حجم المبيعات واتجاهها'],
  ['المشتريات', 'الشراء والموردون'],
  ['المخزون', 'الحركة والسيولة والبطء'],
  ['العملاء', 'الذمم والتحصيل'],
  ['الطلب', 'الطلب والتنبؤ وإعادة الطلب'],
  ['المخاطر', 'ما يحتاج تدخلًا الآن'],
];

export function WorkCenterPage() {
  return (
    <div dir="rtl" className="space-y-6 pb-8">
      <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-800">
            <FileUp size={14} /> مركز العمل
          </div>
          <h1 className="text-2xl font-black tracking-tight text-ink-950 sm:text-3xl">ابدأ من ملف أعمالك</h1>
          <p className="mt-3 text-sm leading-7 text-ink-600 sm:text-base">
            Report-Advisor لا يبدأ برقم KPI. يبدأ بالمصدر، ثم يحول الملف إلى بيانات موثقة، وبعدها إلى معرفة وقرار قابل للتتبع.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4"><FileUp className="mb-3 text-primary-600" size={20}/><b className="block text-sm">ارفع أي ملف أعمال</b><span className="mt-1 block text-xs leading-5 text-ink-500">Excel · CSV · PDF · scanned PDF · صور · مستندات عربية</span></div>
          <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4"><ShieldCheck className="mb-3 text-primary-600" size={20}/><b className="block text-sm">الدليل قبل الرقم</b><span className="mt-1 block text-xs leading-5 text-ink-500">لا اعتماد على KPI بلا Evidence صالح ومصدر وTenant وفترة</span></div>
          <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4"><GitBranch className="mb-3 text-primary-600" size={20}/><b className="block text-sm">من النتيجة إلى القرار</b><span className="mt-1 block text-xs leading-5 text-ink-500">Evidence → Decision → Approval → Work → Outcome</span></div>
        </div>
      </section>

      <section className="rounded-3xl border border-ink-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="text-lg font-black text-ink-900">رحلة الملف الحقيقية</h2><p className="mt-1 text-xs text-ink-500">هذه رحلة المعالجة الفعلية وليست حالات عرض تجميلية.</p></div>
          <span className="hidden rounded-full bg-ink-100 px-3 py-1 text-[11px] font-bold text-ink-600 sm:inline-flex">Fail-closed</span>
        </div>
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-5">
          {journey.map(([number, title, description], index) => (
            <div key={title} className="relative rounded-2xl border border-ink-100 bg-ink-50 p-3">
              <div className="flex items-center gap-2"><span className="text-[10px] font-black text-primary-600">{number}</span><b className="text-xs text-ink-900">{title}</b>{index < journey.length - 1 && <ArrowLeft className="mr-auto hidden text-ink-300 xl:block" size={13}/>}</div>
              <p className="mt-2 text-[11px] leading-5 text-ink-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-ink-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-black text-ink-900">ماذا وجد النظام؟</h2><p className="mt-1 text-xs text-ink-500">تظهر النتائج بعد اكتمال المعالجة والأدلة، لا قبلها.</p></div><Gauge size={20} className="text-primary-600"/></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {outcomes.map(([title, description]) => <div key={title} className="rounded-2xl border border-ink-100 p-3"><b className="block text-sm text-ink-900">{title}</b><span className="mt-1 block text-[11px] leading-5 text-ink-500">{description}</span></div>)}
        </div>
      </section>

      <section className="rounded-3xl border border-primary-100 bg-primary-50/40 p-4 sm:p-6">
        <div className="mb-4 flex items-start gap-3"><div className="rounded-xl bg-white p-2 text-primary-700 shadow-sm"><FileText size={19}/></div><div><h2 className="text-lg font-black text-ink-900">ارفع الملف الآن</h2><p className="mt-1 text-xs leading-5 text-ink-600">المكوّن التالي هو محرك الاستيراد القانوني نفسه؛ هذه الطبقة تغيّر التجربة فقط ولا تعيد بناء الـBackend أو الـDurable Runner.</p></div></div>
        <CanonicalImportPage />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link to="/decision-experience" className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm transition hover:border-primary-300"><Target className="mb-2 text-primary-600" size={18}/><b className="block text-sm">مركز القرار</b><span className="mt-1 block text-xs text-ink-500">Evidence → Decision → Approval → Work → Outcome</span></Link>
        <Link to="/reports/executive" className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm transition hover:border-primary-300"><FileText className="mb-2 text-primary-600" size={18}/><b className="block text-sm">التقرير التنفيذي</b><span className="mt-1 block text-xs text-ink-500">قصة القرار والنتيجة مع حالة الدليل</span></Link>
        <Link to="/dashboard" className="rounded-2xl border border-ink-200 bg-white p-4 shadow-sm transition hover:border-primary-300"><CheckCircle2 className="mb-2 text-primary-600" size={18}/><b className="block text-sm">التحليل والـKPI</b><span className="mt-1 block text-xs text-ink-500">النتائج بعد التحقق، وليست نقطة البداية</span></Link>
      </section>
    </div>
  );
}
