import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHeader, LoadingState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchProducts } from '@/lib/queries';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { Product } from '@/lib/types';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState('');
  useEffect(() => { fetchProducts().then(data => { setProducts(data); setLoading(false); }); }, []);
  if (loading) return <LoadingState />;
  const filtered = products.filter(p => p.name.includes(search) || p.sku.includes(search));
  return <div className="space-y-6 animate-fade-in"><PageHeader title="المنتجات" subtitle={`${formatNumber(products.length)} منتج`} actions={<button className="btn-primary text-xs"><Plus size={14} /> منتج جديد</button>} /><div className="relative max-w-md"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن منتج..." className="input pr-10" /></div><Card><DataTable columns={[{ key: 'sku', label: 'SKU', render: (r: Product) => <span className="font-mono text-xs text-ink-500">{r.sku}</span> },{ key: 'name', label: 'الاسم', render: (r: Product) => <span className="font-medium text-ink-800">{r.name}</span> },{ key: 'unit', label: 'الوحدة', align: 'center' },{ key: 'cost_price', label: 'التكلفة', align: 'right', render: (r: Product) => formatCurrency(r.cost_price) },{ key: 'selling_price', label: 'السعر', align: 'right', render: (r: Product) => formatCurrency(r.selling_price) },{ key: 'margin', label: 'الهامش', align: 'right', render: (r: Product) => { const m = r.selling_price > 0 ? ((r.selling_price - r.cost_price) / r.selling_price) * 100 : 0; return <span className={m >= 20 ? 'text-success-600 font-medium' : m >= 10 ? 'text-warning-600' : 'text-danger-600'}>{m.toFixed(1)}%</span>; }},{ key: 'reorder_point', label: 'نقطة الطلب', align: 'center', render: (r: Product) => formatNumber(r.reorder_point) }]} data={filtered} emptyMessage="لا توجد منتجات" /></Card></div>;
}
