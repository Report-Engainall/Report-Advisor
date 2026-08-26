import { useEffect, useState, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchCustomers } from '@/lib/queries';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { Customer } from '@/lib/types';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const load = useCallback(async () => { try { setLoading(true); const data = await fetchCustomers(); setCustomers(data); } catch (e: any) { setError(e.message); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const filtered = customers.filter(c => c.name.includes(search) || c.code?.includes(search));
  const segmentMap: any = { vip: { variant: 'success', label: 'VIP' }, regular: { variant: 'primary', label: 'عادي' }, occasional: { variant: 'neutral', label: 'عرضي' } };
  return <div className="space-y-6 animate-fade-in"><PageHeader title="العملاء" subtitle={`${formatNumber(customers.length)} عميل`} actions={<button className="btn-primary text-xs"><Plus size={14} /> عميل جديد</button>} /><div className="relative max-w-md"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن عميل..." className="input pr-10" /></div><Card><DataTable columns={[{ key: 'code', label: 'الكود', render: (r: Customer) => <span className="font-mono text-xs text-ink-500">{r.code || '—'}</span> },{ key: 'name', label: 'الاسم', render: (r: Customer) => <span className="font-medium text-ink-800">{r.name}</span> },{ key: 'phone', label: 'الهاتف', render: (r: Customer) => r.phone || '—' },{ key: 'segment', label: 'الشريحة', align: 'center', render: (r: Customer) => { const s = segmentMap[r.segment] || { variant: 'neutral', label: r.segment }; return <Badge variant={s.variant}>{s.label}</Badge>; }},{ key: 'credit_limit', label: 'حد الائتمان', align: 'right', render: (r: Customer) => formatCurrency(r.credit_limit) },{ key: 'payment_terms_days', label: 'شروط الدفع', align: 'center', render: (r: Customer) => `${r.payment_terms_days} يوم` }]} data={filtered} emptyMessage="لا يوجد عملاء" /></Card></div>;
}
