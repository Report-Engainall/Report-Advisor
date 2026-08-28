import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge, PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { fetchRecommendations } from '@/lib/queries';
import type { Recommendation } from '@/lib/types';

const lanes = [
  { key: 'new', label: 'اليوم / جديد', icon: AlertCircle },
  { key: 'accepted', label: 'قيد العمل', icon: Clock3 },
  { key: 'done', label: 'مكتمل', icon: CheckCircle2 },
] as const;

export function WorkforceExecutionPage() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await fetchRecommendations());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل مركز التنفيذ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const overdue = useMemo(() => items.filter((item) => item.deadline && Date.parse(item.deadline) < Date.now() && item.status !== 'done'), [items]);

  if (loading) return <LoadingState message="جارٍ تحميل أعمال الفريق..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div dir="rtl" className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 text-primary-600 text-sm font-semibold"><ShieldCheck size={17} /> مركز تنفيذ القوى العاملة</div>
        <h1 className="mt-2 text-2xl font-bold text-ink-900">ماذا يحتاج الفريق الآن؟</h1>
        <p className="mt-1 text-sm text-ink-500">نعرض التوصيات المسجلة كأعمال قابلة للمتابعة، مع إبقاء الصلاحيات والمسؤوليات المستنتجة غير المثبتة خارج حالة التكليف.</p>
      </div>

      {overdue.length > 0 && <div className="rounded-2xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-800">هناك {overdue.length} أعمال متأخرة تحتاج تصعيدًا. لا يتم إنشاء مسؤول جديد تلقائيًا من الذكاء الاصطناعي.</div>}

      <div className="grid gap-5 lg:grid-cols-3">
        {lanes.map((lane) => {
          const LaneIcon = lane.icon;
          const laneItems = items.filter((item) => lane.key === 'new' ? item.status === 'new' : lane.key === 'accepted' ? item.status === 'accepted' || item.status === 'in_progress' : item.status === 'done');
          return (
            <Card key={lane.key}>
              <CardHeader title={lane.label} action={<Badge variant="neutral">{laneItems.length}</Badge>} />
              <CardBody>
                <div className="space-y-3">
                  {laneItems.slice(0, 8).map((item) => (
                    <article key={item.id} className="rounded-xl border border-ink-100 p-4">
                      <div className="flex items-start gap-3">
                        <LaneIcon size={17} className="mt-0.5 text-ink-400" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-ink-800">{item.title}</h3>
                            <PriorityBadge priority={item.priority} />
                            <StatusBadge status={item.status} />
                          </div>
                          {item.description && <p className="mt-2 text-xs leading-6 text-ink-500">{item.description}</p>}
                          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div><dt className="text-ink-400">المسؤول المسجل</dt><dd className="mt-0.5 text-ink-700">{item.owner || 'غير مثبت'}</dd></div>
                            <div><dt className="text-ink-400">الموعد</dt><dd className="mt-0.5 text-ink-700">{item.deadline ? new Date(item.deadline).toLocaleString('ar-YE') : 'غير محدد'}</dd></div>
                          </dl>
                          <div className="mt-3 rounded-lg bg-ink-50 p-2 text-[11px] text-ink-500">المصدر: recommendation {item.id} • الأثر المتوقع: {item.expected_impact == null ? 'غير متاح' : item.expected_impact}</div>
                        </div>
                      </div>
                    </article>
                  ))}
                  {laneItems.length === 0 && <p className="py-8 text-center text-xs text-ink-400">لا توجد أعمال في هذا المسار.</p>}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
