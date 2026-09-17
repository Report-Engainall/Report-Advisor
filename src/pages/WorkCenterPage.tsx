import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Filter, RefreshCw, XCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { fetchImportRecords } from '@/lib/queries';
import type { ImportRecord } from '@/lib/types';
import { formatNumber } from '@/lib/format';

type FilterKey = 'all' | 'active' | 'review' | 'completed' | 'failed';
const statusLabel = (s: string | null) => ({ queued: 'بالانتظار', processing: 'قيد التنفيذ', completed: 'مكتمل', partial: 'مكتمل جزئيًا', failed: 'فشل', cancelled: 'ملغى' }[s ?? ''] ?? 'غير معروف');
const statusClass = (s: string | null) => s === 'completed' ? 'bg-success-50 text-success-700' : s === 'failed' ? 'bg-danger-50 text-danger-700' : s === 'partial' ? 'bg-warning-50 text-warning-700' : s === 'processing' ? 'bg-primary-50 text-primary-700' : 'bg-ink-50 text-ink-600';
function matches(row: ImportRecord, filter: FilterKey) { if (filter === 'all') return true; if (filter === 'active') return row.status === 'queued' || row.status === 'processing'; if (filter === 'review') return row.status === 'partial' || (row.invalid_rows ?? 0) > 0 || (row.quarantined_rows ?? 0) > 0; if (filter === 'completed') return row.status === 'completed'; return row.status === 'failed' || row.status === 'cancelled'; }

export function WorkCenterPage() {
  const [rows, setRows] = useState<ImportRecord[]>([]); const [filter, setFilter] = useState<FilterKey>('all'); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setRows(await fetchImportRecords()); } catch (e) { setError(e instanceof Error ? e.message : 'فشل تحميل مركز العمليات'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => rows.filter(r => matches(r, filter)), [rows, filter]);
  const counts = useMemo(() => ({ active: rows.filter(r => r.status === 'queued' || r.status === 'processing').length, review: rows.filter(r => r.status === 'partial' || (r.invalid_rows ?? 0) > 0 || (r.quarantined_rows ?? 0) > 0).length, completed: rows.filter(r => r.status === 'completed').length, failed: rows.filter(r => r.status === 'failed' || r.status === 'cancelled').length }), [rows]);
  if (loading) return <LoadingState message="جارٍ تحميل حالة العمليات..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  return <div dir="rtl" className="space-y-6 animate-fade-in">
    <PageHeader title="مركز العمليات" subtitle="الاستيراد والتحليل والتحقق والاستثناءات، من الحالات الحقيقية للمستأجر الحالي." action={<button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"><RefreshCw size={16}/> تحديث</button>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {([['active','نشطة الآن',Activity,'bg-primary-50 text-primary-600'],['review','تحتاج مراجعة',AlertTriangle,'bg-warning-50 text-warning-600'],['completed','مكتملة',CheckCircle2,'bg-success-50 text-success-600'],['failed','فشل / ملغى',XCircle,'bg-danger-50 text-danger-600']] as const).map(([key,label,Icon,bg]) => <button key={key} type="button" onClick={() => setFilter(key)} className="text-right"><Card className="transition hover:-translate-y-0.5 hover:shadow-md"><CardBody><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}><Icon size={18}/></div><div><div className="text-xs text-ink-500">{label}</div><div className="mt-1 text-2xl font-bold text-ink-900">{formatNumber(counts[key])}</div></div></div></CardBody></Card></button>)}
    </div>
    <Card><CardHeader title="حالة التنفيذ" subtitle="لا تُنشئ الصفحة حالة جديدة؛ القراءة تمر عبر مسار الاستيراد المعتمد."/><CardBody>
      <div className="mb-5 flex flex-wrap items-center gap-2" role="toolbar" aria-label="تصفية العمليات"><Filter size={16} className="text-ink-400"/>{(['all','active','review','completed','failed'] as FilterKey[]).map(k => <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filter === k ? 'bg-primary-600 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'}`}>{k === 'all' ? 'الكل' : k === 'active' ? 'النشطة' : k === 'review' ? 'المراجعة' : k === 'completed' ? 'المكتملة' : 'الفاشلة'}</button>)}</div>
      {filtered.length === 0 ? <EmptyState title="لا توجد عمليات مطابقة" message={rows.length === 0 ? 'لا توجد عمليات استيراد مسجلة لهذا المستأجر حتى الآن.' : 'غيّر عامل التصفية لرؤية عمليات أخرى.'}/> : <DataTable data={filtered} emptyMessage="لا توجد عمليات" columns={[{key:'file',label:'المصدر',render:(r:ImportRecord)=><div><div className="font-medium text-ink-800">{r.file_name}</div><div className="text-xs text-ink-400">{r.entity_type ?? 'import'}</div></div>},{key:'status',label:'الحالة',align:'center',render:(r:ImportRecord)=><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(r.status)}`}>{statusLabel(r.status)}</span>},{key:'progress',label:'التقدم',align:'center',render:(r:ImportRecord)=><span className="font-semibold text-ink-800">{r.progress == null ? '—' : `${Math.max(0, Math.min(100, r.progress))}%`}</span>},{key:'valid',label:'السجلات الصالحة',align:'center',render:(r:ImportRecord)=>r.valid_rows == null ? 'غير متاح' : formatNumber(r.valid_rows)},{key:'updated',label:'آخر تحديث',align:'center',render:(r:ImportRecord)=>new Date(r.completed_at ?? r.created_at).toLocaleString('ar-YE')}]} />}
    </CardBody></Card>
  </div>;
}
