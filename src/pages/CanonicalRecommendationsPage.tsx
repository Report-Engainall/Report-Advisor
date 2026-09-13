import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, FileSearch, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge, ConfidenceBadge, PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { fetchRecommendations } from '@/lib/queries';
import type { Recommendation } from '@/lib/types';

export function CanonicalRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setRecommendations(await fetchRecommendations()); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحميل التوصيات.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState message="جارٍ تحميل التوصيات الحقيقية..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  return <div dir="rtl" className="space-y-6 animate-fade-in">
    <PageHeader title="التوصيات" subtitle="كل توصية تنتقل إلى دورة القرار المعيارية بدل تعديل الحالة مباشرة." />
    {recommendations.length === 0 ? <EmptyState icon={<Lightbulb size={32} />} title="لا توجد توصيات" message="لا يتم إنشاء بيانات تجريبية." /> : <div className="space-y-3">{recommendations.map(rec => <Card key={rec.id}><CardBody><div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div className="flex items-start gap-3 min-w-0"><div className="w-10 h-10 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center shrink-0"><Lightbulb size={18}/></div><div className="min-w-0"><h3 className="font-semibold text-ink-800 text-sm">{rec.title}</h3>{rec.description&&<p className="text-xs text-ink-500 mt-1">{rec.description}</p>}</div></div><div className="flex flex-wrap items-center gap-2"><PriorityBadge priority={rec.priority}/><ConfidenceBadge confidence={rec.confidence}/><StatusBadge status={rec.status}/></div></div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500"><span>Recommendation ID: <code className="font-mono">{rec.id}</code></span>{rec.evidence_snapshot_id?<Badge variant="success"><FileSearch size={12}/> دليل مرتبط</Badge>:<Badge variant="warning">لا يوجد دليل runtime</Badge>}</div>
      <Link to={`/decision-experience?stage=evidence&recommendationId=${encodeURIComponent(rec.id)}`} className="inline-flex w-fit items-center gap-2 rounded-xl bg-ink-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-ink-800"><ArrowLeft size={14}/> فتح دورة القرار</Link>
    </div></CardBody></Card>)}</div>}
  </div>;
}
