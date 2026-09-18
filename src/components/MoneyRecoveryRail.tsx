import { ArrowUpLeft, Banknote, Boxes, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardKPIs } from '@/lib/dashboard-canonical';
import { buildMoneyRecoverySignals, type MoneyRecoveryKind } from '@/lib/money-recovery';

const PLAYBOOKS: Record<MoneyRecoveryKind, string[]> = {
  COLLECTIONS: ['راجع أكبر الأرصدة المتأخرة', 'افتح سياق العمر والعميل قبل التواصل', 'اعتمد الإجراء فقط بعد توفر الدليل اللازم', 'سجل النتيجة الفعلية بعد التحصيل'],
  INVENTORY_EXPOSURE: ['راجع سرعة الحركة والرصيد الحالي', 'قارن البدائل والطلب قبل إعادة التزويد', 'حدد الإجراء التشغيلي القابل للعكس', 'قِس النتيجة الفعلية بعد التغيير'],
  MARGIN_PRESSURE: ['افتح الإيراد والتكلفة canonical', 'حدد المنتجات/العملاء المتأثرين', 'افحص مصدر ضغط الهامش قبل تعديل السعر', 'سجل الأثر الفعلي بعد القرار'],
};

export function MoneyRecoveryRail({ kpis }: { kpis: DashboardKPIs | null }) {
  const signals = buildMoneyRecoverySignals(kpis);
  return <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-card" aria-label="محرك استرداد المال">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] font-black tracking-[.12em] text-primary-600">MONEY RECOVERY</div><h2 className="mt-1 text-lg font-black text-ink-950">أين توجد الفرصة المالية الآن؟</h2><p className="mt-1 text-xs leading-6 text-ink-500">إشارات مشتقة من المؤشرات الكانونية؛ لا يتم اختراع قيمة استرداد غير مثبتة.</p></div><Banknote size={21} className="text-primary-700"/></div>
    {!signals.length ? <div className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-5 text-sm text-ink-500">لا توجد إشارة مالية قابلة للإثبات من اللقطة الحالية.</div>
      : <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{signals.map(signal => { const Icon = signal.kind === 'COLLECTIONS' ? Banknote : signal.kind === 'INVENTORY_EXPOSURE' ? Boxes : Gauge; const playbook = PLAYBOOKS[signal.kind]; return <article key={signal.id} className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
        <div className="flex items-center justify-between gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-700"><Icon size={17}/></span><span className={`rounded-full px-2 py-1 text-[10px] font-black ${signal.state === 'ACTIONABLE' ? 'bg-danger-50 text-danger-700' : 'bg-warning-50 text-warning-700'}`}>{signal.state === 'ACTIONABLE' ? 'يحتاج إجراء' : 'مراقبة'}</span></div>
        <h3 className="mt-3 text-sm font-black text-ink-900">{signal.title}</h3>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">{signal.amount != null && <span>{new Intl.NumberFormat('ar-YE',{maximumFractionDigits:2}).format(signal.amount)}</span>}{signal.percent != null && <span className="text-ink-400">{signal.percent.toFixed(1)}%</span>}</div>
        <div className="mt-3 flex flex-wrap gap-1.5">{signal.evidence.map(item => <span key={item} className="rounded-full bg-white px-2 py-1 text-[9px] font-mono text-ink-500">{item}</span>)}</div>
        <div className="mt-4 rounded-xl border border-ink-100 bg-white/70 p-3"><div className="text-[10px] font-black text-ink-700">Playbook</div><ol className="mt-2 space-y-1.5">{playbook.map((step,index) => <li key={step} className="flex gap-2 text-[10px] leading-5 text-ink-600"><span className="font-black text-primary-700">{index + 1}.</span><span>{step}</span></li>)}</ol></div>
        <Link to={signal.path} className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-primary-700">فتح مسار القرار <ArrowUpLeft size={14}/></Link>
      </article>; })}</div>}
  </section>;
}
