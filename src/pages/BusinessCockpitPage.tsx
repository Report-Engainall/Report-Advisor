import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowUpLeft, Brain, CalendarClock, ChevronLeft, CircleDollarSign, PackageSearch, RefreshCw, Sparkles, TrendingDown, TrendingUp, UsersRound } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const salesTrend = [
  { day: 'السبت', value: 72 }, { day: 'الأحد', value: 86 }, { day: 'الاثنين', value: 81 },
  { day: 'الثلاثاء', value: 96 }, { day: 'الأربعاء', value: 91 }, { day: 'الخميس', value: 108 }, { day: 'الجمعة', value: 116 },
];

const risks = [
  { title: '8 أصناف ستصل إلى نقطة النفاد خلال 7 أيام', detail: 'الطلب الحالي أعلى من التغطية المتاحة', tone: 'danger', href: '/intelligence/forecasts' },
  { title: '12 عميلاً غير نشطين منذ أكثر من 30 يوماً', detail: 'يوجد تاريخ شراء يسمح بإعادة التنشيط', tone: 'warning', href: '/customers' },
  { title: 'التزامات الموردين للأسبوع القادم أعلى من التحصيل المتوقع', detail: 'راجع خطة توزيع السيولة قبل الاستحقاق', tone: 'warning', href: '/reports/receivables' },
];

const recommendations = [
  { icon: PackageSearch, title: 'أعد طلب 14 صنفاً سريع الحركة', detail: 'الأولوية للأصناف ذات تغطية أقل من 7 أيام.', href: '/intelligence/forecasts' },
  { icon: UsersRound, title: 'ابدأ حملة متابعة للعملاء المنقطعين', detail: 'الأولوية للعملاء ذوي القيمة التاريخية الأعلى.', href: '/customers' },
  { icon: CircleDollarSign, title: 'ارفع التحصيل قبل جدولة دفعة الموردين', detail: 'الهدف حماية الرصيد التشغيلي خلال نافذة الاستحقاق.', href: '/reports/receivables' },
];

function Kpi({ label, value, change, positive, icon: Icon }: { label: string; value: string; change: string; positive?: boolean; icon: typeof Activity }) {
  return (
    <div className="card p-5 card-hover">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-ink-500">{label}</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-ink-900">{value}</div>
          <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${positive ? 'text-success-700' : 'text-danger-700'}`}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{change}
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center"><Icon size={21} /></div>
      </div>
    </div>
  );
}

export function BusinessCockpitPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <section className="card overflow-hidden">
        <div className="p-6 lg:p-7 bg-gradient-to-l from-primary-50 via-white to-white border-b border-ink-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 mb-2"><Sparkles size={15} /> غرفة القرار التنفيذية</div>
              <h1 className="text-2xl lg:text-3xl font-bold text-ink-900">ماذا يحدث في النشاط الآن؟</h1>
              <p className="mt-2 text-sm text-ink-500 max-w-2xl">ملخص موحد للمبيعات والمخزون والسيولة والعملاء والمخاطر، مع تحويل المؤشرات إلى قرارات قابلة للتنفيذ.</p>
            </div>
            <button className="btn-secondary self-start"><RefreshCw size={16} /> تحديث البيانات</button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-ink-100">
          <div className="p-4"><div className="text-xs text-ink-400">آخر تحديث</div><div className="mt-1 font-semibold text-ink-800">منذ 3 دقائق</div><span className="badge-success mt-2">Fresh</span></div>
          <div className="p-4"><div className="text-xs text-ink-400">حالة النظام</div><div className="mt-1 font-semibold text-ink-800">طبيعية</div><span className="badge-success mt-2">All systems normal</span></div>
          <div className="p-4"><div className="text-xs text-ink-400">قرارات عاجلة</div><div className="mt-1 font-semibold text-ink-800">3</div><span className="badge-danger mt-2">تحتاج إجراء</span></div>
          <div className="p-4"><div className="text-xs text-ink-400">توصيات جديدة</div><div className="mt-1 font-semibold text-ink-800">7</div><span className="badge-primary mt-2">AI verified</span></div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi label="المبيعات" value="12.84M" change="12.4% عن الفترة السابقة" positive icon={ArrowUpLeft} />
        <Kpi label="قيمة المخزون" value="38.6M" change="8.2% تحت التغطية المستهدفة" icon={PackageSearch} />
        <Kpi label="السيولة المتاحة" value="9.42M" change="4.8% عن الأسبوع السابق" positive icon={CircleDollarSign} />
        <Kpi label="العملاء النشطون" value="1,284" change="6.1% عن الشهر السابق" positive icon={UsersRound} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="font-bold text-ink-900">اتجاه المبيعات</h2><p className="text-xs text-ink-400 mt-1">آخر 7 أيام — قابل للتحويل إلى Explore</p></div>
            <Link to="/analytics" className="btn-ghost text-xs">استكشف التحليل <ChevronLeft size={14} /></Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopOpacity={0.24} /><stop offset="100%" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="currentColor" fill="url(#salesFill)" strokeWidth={2.5} className="text-primary-600" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><div><h2 className="font-bold text-ink-900">مؤشر السيولة</h2><p className="text-xs text-ink-400 mt-1">التدفقات مقابل الالتزامات</p></div><Activity className="text-success-600" size={20} /></div>
          <div className="flex items-end gap-2"><span className="text-4xl font-bold text-ink-900">74</span><span className="text-sm text-ink-400 mb-1">/ 100</span></div>
          <div className="mt-4 h-2 rounded-full bg-ink-100 overflow-hidden"><div className="h-full w-[74%] bg-success-500 rounded-full" /></div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">تحصيل متوقع 7 أيام</span><b>6.8M</b></div>
            <div className="flex justify-between"><span className="text-ink-500">التزامات 7 أيام</span><b>8.1M</b></div>
            <div className="flex justify-between"><span className="text-ink-500">فجوة محتملة</span><b className="text-warning-700">1.3M</b></div>
          </div>
          <Link to="/intelligence/scenarios" className="btn-secondary w-full mt-5">محاكاة خطة السيولة</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><div><h2 className="font-bold text-ink-900">الأولوية الآن</h2><p className="text-xs text-ink-400 mt-1">تنبيهات مبنية على قواعد وبيانات قابلة للتتبع</p></div><AlertTriangle className="text-warning-600" size={20} /></div>
          <div className="space-y-3">
            {risks.map((risk) => <Link key={risk.title} to={risk.href} className="block rounded-xl border border-ink-100 p-4 hover:border-ink-200 hover:bg-ink-50/50 transition"><div className="flex items-start gap-3"><span className={`mt-1 w-2.5 h-2.5 rounded-full ${risk.tone === 'danger' ? 'bg-danger-500' : 'bg-warning-500'}`} /><div className="min-w-0"><div className="font-medium text-sm text-ink-800">{risk.title}</div><div className="text-xs text-ink-400 mt-1">{risk.detail}</div></div><ChevronLeft size={16} className="text-ink-300 shrink-0" /></div></Link>)}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><div><h2 className="font-bold text-ink-900">توصيات قابلة للتنفيذ</h2><p className="text-xs text-ink-400 mt-1">كل توصية يجب أن ترتبط بدليل ونتيجة متوقعة</p></div><Brain className="text-primary-600" size={20} /></div>
          <div className="space-y-3">
            {recommendations.map(({ icon: Icon, title, detail, href }) => <Link key={title} to={href} className="flex gap-3 p-4 rounded-xl bg-primary-50/50 border border-primary-100 hover:bg-primary-50 transition"><div className="w-9 h-9 rounded-lg bg-white text-primary-700 flex items-center justify-center shrink-0"><Icon size={18} /></div><div className="min-w-0 flex-1"><div className="font-medium text-sm text-ink-800">{title}</div><div className="text-xs text-ink-500 mt-1">{detail}</div></div><ChevronLeft size={16} className="text-primary-400 mt-1" /></Link>)}
          </div>
        </div>
      </section>

      <section className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3"><CalendarClock className="text-primary-600 mt-0.5" size={20} /><div><div className="font-semibold text-ink-900">موجز المدير القادم</div><div className="text-xs text-ink-500 mt-1">سيتم توليد Daily Briefing من آخر البيانات والأحداث والتحذيرات بعد اكتمال المزامنة.</div></div></div>
        <Link to="/intelligence" className="btn-primary shrink-0">فتح مركز الذكاء</Link>
      </section>
    </div>
  );
}
