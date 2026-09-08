import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, CalendarClock, CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react';
import { fetchRecommendations, fetchAlerts, fetchForecasts } from '@/lib/queries';
import { buildDailyTaskPlan, taskRoleLabel, type TaskHorizon, type TaskRole } from '@/lib/roleTaskEngine';
import type { Recommendation, Alert, Forecast } from '@/lib/types';

const roles: Array<TaskRole | 'all'> = ['all', 'manager', 'employee', 'sales', 'warehouse', 'accountant', 'purchasing'];
const roleName = (r: TaskRole | 'all') => r === 'all' ? 'كل الأدوار' : taskRoleLabel(r);

export function IntelligenceTaskCenterPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [role, setRole] = useState<TaskRole | 'all'>('all');
  const [horizon, setHorizon] = useState<TaskHorizon>('today');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [r, a, f] = await Promise.all([fetchRecommendations(), fetchAlerts(), fetchForecasts()]);
      setRecommendations(r); setAlerts(a); setForecasts(f);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const tasks = useMemo(() => buildDailyTaskPlan({ recommendations, alerts, forecasts }).filter(t => horizon === t.horizon && (role === 'all' || t.role === role)), [recommendations, alerts, forecasts, horizon, role]);
  const todayCount = useMemo(() => buildDailyTaskPlan({ recommendations, alerts, forecasts }).filter(t => t.horizon === 'today' && (role === 'all' || t.role === role)).length, [recommendations, alerts, forecasts, role]);

  return <div dir="rtl" className="space-y-6 animate-fade-in">
    <header className="rounded-3xl bg-ink-950 p-6 text-white lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div><div className="flex items-center gap-2 text-primary-300 text-sm font-semibold"><BriefcaseBusiness size={17}/> محرك مهام العمل الذكي</div><h1 className="mt-2 text-2xl lg:text-3xl font-bold">ماذا يجب أن يفعل كل شخص اليوم؟</h1><p className="mt-2 max-w-3xl text-sm leading-7 text-ink-300">المهام مقترحة من التنبيهات والتوصيات والتنبؤات الفعلية، مع ربط كل مهمة بسبب وأدلة مطلوبة. لا يتم إنشاء أرقام أو مهام وهمية.</p></div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink-900"><RefreshCw size={16}/> تحديث</button>
      </div>
    </header>
    <section className="flex flex-wrap gap-2">{roles.map(r => <button key={r} type="button" onClick={() => setRole(r)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${role === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-ink-200 bg-white text-ink-600'}`}>{roleName(r)}</button>)}</section>
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3"><button type="button" onClick={() => setHorizon('today')} className={`rounded-2xl border p-4 text-right ${horizon === 'today' ? 'border-primary-400 bg-primary-50' : 'border-ink-200 bg-white'}`}><CalendarClock size={20}/><p className="mt-3 text-sm font-bold">مهام اليوم</p><strong className="text-2xl">{todayCount}</strong></button><button type="button" onClick={() => setHorizon('tomorrow')} className={`rounded-2xl border p-4 text-right ${horizon === 'tomorrow' ? 'border-primary-400 bg-primary-50' : 'border-ink-200 bg-white'}`}><CalendarClock size={20}/><p className="mt-3 text-sm font-bold">مهام الغد</p><span className="text-xs text-ink-500">خطة استباقية</span></button><div className="rounded-2xl border border-ink-200 bg-white p-4"><ShieldAlert size={20}/><p className="mt-3 text-sm font-bold">المصدر</p><span className="text-xs text-ink-500">تقارير + تنبيهات + توصيات + تنبؤات</span></div></section>
    {loading ? <div className="rounded-2xl border border-ink-200 bg-white p-8 text-center text-sm text-ink-500">جارٍ بناء خطة العمل من البيانات…</div> : <section className="space-y-3">{tasks.map(task => <article key={`${task.id}-${task.role}`} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row lg:items-start"><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold">{taskRoleLabel(task.role)}</span><span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">{task.horizon === 'today' ? 'اليوم' : 'غدًا'}</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{task.priority}</span></div><h2 className="mt-3 text-base font-bold">{task.title}</h2><p className="mt-1 text-sm leading-6 text-ink-600">{task.reason}</p><p className="mt-2 text-xs text-ink-500">النتيجة المطلوبة: {task.expectedOutcome}</p><div className="mt-3 flex flex-wrap gap-2">{task.evidenceRequired.map(e => <span key={e} className="rounded-lg bg-ink-50 px-2 py-1 text-[11px] text-ink-500">دليل: {e}</span>)}</div></div><button type="button" disabled className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-400"><CheckCircle2 size={15}/> مقترحة</button></div></article>)}{tasks.length === 0 && <div className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-8 text-center text-sm text-ink-500">لا توجد مهام مقترحة من البيانات الحالية لهذا الدور وهذا اليوم.</div>}</section>}
  </div>;
}
