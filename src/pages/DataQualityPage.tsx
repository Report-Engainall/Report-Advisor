import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, Database, Package, ShieldCheck, Users, Warehouse } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchDataQualitySnapshot, type EntityQuality, type QualityIssue } from '@/lib/data-quality-canonical';
import { formatNumber } from '@/lib/format';

function scoreColor(score: number): string { if (score >= 90) return 'text-success-600'; if (score >= 70) return 'text-warning-600'; return 'text-danger-600'; }
function scoreBg(score: number): string { if (score >= 90) return 'bg-success-500'; if (score >= 70) return 'bg-warning-500'; return 'bg-danger-500'; }
function severityBadge(severity: QualityIssue['severity']): 'danger' | 'warning' | 'neutral' { return severity === 'critical' ? 'danger' : severity === 'warning' ? 'warning' : 'neutral'; }

const ICONS = { users: Users, package: Package, receipt: BarChart3, warehouse: Warehouse } as const;

export function DataQualityPage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchDataQualitySnapshot>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setSnapshot(await fetchDataQualitySnapshot()); }
    catch (e) { setError(e instanceof Error ? e.message : 'فشل تحميل بيانات الجودة'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  if (loading && !snapshot) return <LoadingState message="جارٍ تحميل لقطة جودة البيانات المعتمدة..." />;
  if (error && !snapshot) return <ErrorState message={error} onRetry={load} />;
  if (!snapshot) return null;

  const totalRecords = snapshot.total_records;
  const totalIssues = snapshot.total_issues;
  return <div className="space-y-6 animate-fade-in">
    <PageHeader title="جودة البيانات" subtitle="لقطة جودة محسوبة خادميًا من مصدر الحقيقة المعتمد، دون نقل مجموعات البيانات إلى المتصفح" />
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <Card className="bg-gradient-to-br from-ink-50 to-white"><CardBody><div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0"><svg className="w-full h-full -rotate-90" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-ink-100" /><circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className={snapshot.overall_score >= 90 ? 'text-success-500' : snapshot.overall_score >= 70 ? 'text-warning-500' : 'text-danger-500'} strokeDasharray={`${(snapshot.overall_score / 100) * 327} 327`} strokeLinecap="round" /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className={`text-3xl font-bold ${scoreColor(snapshot.overall_score)}`}>{snapshot.overall_score}%</span><span className="text-xs text-ink-400 mt-1">الدرجة الإجمالية</span></div></div>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full"><div className="text-center p-3 rounded-lg bg-ink-50"><Database className="mx-auto text-primary-500 mb-1" size={20} /><div className="text-xl font-bold text-ink-900">{formatNumber(totalRecords)}</div><div className="text-xs text-ink-500">إجمالي السجلات</div></div><div className="text-center p-3 rounded-lg bg-ink-50"><CheckCircle2 className="mx-auto text-success-500 mb-1" size={20} /><div className="text-xl font-bold text-success-600">{formatNumber(totalRecords - totalIssues)}</div><div className="text-xs text-ink-500">سجلات سليمة</div></div><div className="text-center p-3 rounded-lg bg-ink-50"><AlertTriangle className="mx-auto text-warning-500 mb-1" size={20} /><div className="text-xl font-bold text-warning-600">{formatNumber(totalIssues)}</div><div className="text-xs text-ink-500">مشاكل مكتشفة</div></div><div className="text-center p-3 rounded-lg bg-ink-50"><ShieldCheck className="mx-auto text-primary-500 mb-1" size={20} /><div className="text-xl font-bold text-ink-900">{snapshot.entities.length}</div><div className="text-xs text-ink-500">كيانات مفحوصة</div></div></div>
    </div></CardBody></Card>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{snapshot.entities.map((entity: EntityQuality) => { const Icon = ICONS[entity.icon] ?? Database; return <Card key={entity.name}><CardBody><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center"><Icon size={18} /></div><div><div className="font-semibold text-sm text-ink-800">{entity.name}</div><div className="text-xs text-ink-400">{formatNumber(entity.total)} سجل</div></div></div><div className="flex items-center justify-between mb-2"><span className="text-xs text-ink-500">الدرجة</span><span className={`text-lg font-bold ${scoreColor(entity.score)}`}>{entity.score}%</span></div><div className="h-2 bg-ink-100 rounded-full overflow-hidden"><div className={`h-full ${scoreBg(entity.score)} rounded-full transition-all duration-500`} style={{ width: `${Math.max(0, Math.min(100, entity.score))}%` }} /></div>{entity.issues > 0 ? <div className="text-xs text-warning-600 mt-2">{formatNumber(entity.issues)} مشكلة</div> : <div className="text-xs text-success-600 mt-2">لا توجد مشاكل</div>}</CardBody></Card>; })}</div>
    <Card><CardHeader title="المشاكل المكتشفة" subtitle="نتائج اللقطة الخادمية المعتمدة" />{snapshot.issues.length === 0 ? <CardBody><EmptyState icon={<CheckCircle2 size={32} />} title="لا توجد مشاكل في جودة البيانات" message="جميع السجلات ضمن اللقطة الحالية سليمة وفق قواعد الجودة المعتمدة" /></CardBody> : <DataTable columns={[{ key: 'entity', label: 'الكيان', render: (r: QualityIssue) => <span className="font-medium text-ink-800">{r.entity}</span> },{ key: 'field', label: 'الحقل', render: (r: QualityIssue) => r.field },{ key: 'issue', label: 'المشكلة', render: (r: QualityIssue) => r.issue },{ key: 'count', label: 'العدد', align: 'center', render: (r: QualityIssue) => <span className="font-semibold text-ink-800">{formatNumber(r.count)}</span> },{ key: 'severity', label: 'الخطورة', align: 'center', render: (r: QualityIssue) => <Badge variant={severityBadge(r.severity)}>{r.severity === 'critical' ? 'حرجة' : r.severity === 'warning' ? 'تحذير' : 'معلومة'}</Badge> }]} data={snapshot.issues} emptyMessage="لا توجد مشاكل" />}</Card>
  </div>;
}
