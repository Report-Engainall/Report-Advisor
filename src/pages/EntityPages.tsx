import { useEffect, useState, useCallback } from 'react';
import { Users, Package, Warehouse, Search, Plus, Filter, CheckCircle2, AlertTriangle, XCircle, Database, ShieldCheck, Copy, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { fetchCustomers, fetchProducts, fetchInventoryBalances } from '@/lib/queries';
import { fetchDataQualityDatasets } from '@/lib/data-quality-queries';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import type { Customer, Product, InventoryBalance } from '@/lib/types';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const filtered = customers.filter(c => c.name.includes(search) || c.code?.includes(search));
  const segmentMap: any = { vip: { variant: 'success', label: 'VIP' }, regular: { variant: 'primary', label: 'عادي' }, occasional: { variant: 'neutral', label: 'عرضي' } };
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="العملاء" subtitle={`${formatNumber(customers.length)} عميل`} actions={<button className="btn-primary text-xs"><Plus size={14} /> عميل جديد</button>} />
      <div className="relative max-w-md"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن عميل..." className="input pr-10" /></div>
      <Card><DataTable columns={[{ key: 'code', label: 'الكود', render: (r: Customer) => <span className="font-mono text-xs text-ink-500">{r.code || '—'}</span> },{ key: 'name', label: 'الاسم', render: (r: Customer) => <span className="font-medium text-ink-800">{r.name}</span> },{ key: 'phone', label: 'الهاتف', render: (r: Customer) => r.phone || '—' },{ key: 'segment', label: 'الشريحة', align: 'center', render: (r: Customer) => { const s = segmentMap[r.segment] || { variant: 'neutral', label: r.segment }; return <Badge variant={s.variant}>{s.label}</Badge>; }},{ key: 'credit_limit', label: 'حد الائتمان', align: 'right', render: (r: Customer) => formatCurrency(r.credit_limit) },{ key: 'payment_terms_days', label: 'شروط الدفع', align: 'center', render: (r: Customer) => `${r.payment_terms_days} يوم` }]} data={filtered} emptyMessage="لا يوجد عملاء" /></Card>
    </div>
  );
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState('');
  useEffect(() => { fetchProducts().then(data => { setProducts(data); setLoading(false); }); }, []);
  if (loading) return <LoadingState />;
  const filtered = products.filter(p => p.name.includes(search) || p.sku.includes(search));
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="المنتجات" subtitle={`${formatNumber(products.length)} منتج`} actions={<button className="btn-primary text-xs"><Plus size={14} /> منتج جديد</button>} />
      <div className="relative max-w-md"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن منتج..." className="input pr-10" /></div>
      <Card><DataTable columns={[{ key: 'sku', label: 'SKU', render: (r: Product) => <span className="font-mono text-xs text-ink-500">{r.sku}</span> },{ key: 'name', label: 'الاسم', render: (r: Product) => <span className="font-medium text-ink-800">{r.name}</span> },{ key: 'unit', label: 'الوحدة', align: 'center' },{ key: 'cost_price', label: 'التكلفة', align: 'right', render: (r: Product) => formatCurrency(r.cost_price) },{ key: 'selling_price', label: 'السعر', align: 'right', render: (r: Product) => formatCurrency(r.selling_price) },{ key: 'margin', label: 'الهامش', align: 'right', render: (r: Product) => { const m = r.selling_price > 0 ? ((r.selling_price - r.cost_price) / r.selling_price) * 100 : 0; return <span className={m >= 20 ? 'text-success-600 font-medium' : m >= 10 ? 'text-warning-600' : 'text-danger-600'}>{m.toFixed(1)}%</span>; }},{ key: 'reorder_point', label: 'نقطة الطلب', align: 'center', render: (r: Product) => formatNumber(r.reorder_point) }]} data={filtered} emptyMessage="لا توجد منتجات" /></Card>
    </div>
  );
}

export function InventoryPage() {
  const [balances, setBalances] = useState<InventoryBalance[]>([]); const [loading, setLoading] = useState(true); const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  useEffect(() => { fetchInventoryBalances().then(data => { setBalances(data); setLoading(false); }); }, []);
  if (loading) return <LoadingState />;
  const totalValue = balances.reduce((s, b) => s + Number(b.quantity) * Number(b.unit_cost), 0); const lowStock = balances.filter(b => Number(b.quantity) > 0 && Number(b.quantity) <= Number(b.product?.reorder_point || 0)); const outOfStock = balances.filter(b => Number(b.quantity) <= 0); const filtered = filter === 'low' ? lowStock : filter === 'out' ? outOfStock : balances;
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="المخزون" subtitle="حالة المخزون في جميع المستودعات" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card><CardBody><div className="text-xs text-ink-500 mb-1">قيمة المخزون</div><div className="text-xl font-bold text-ink-900">{formatCurrency(totalValue)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">إجمالي الأصناف</div><div className="text-xl font-bold text-ink-900">{formatNumber(balances.length)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">مخزون منخفض</div><div className="text-xl font-bold text-warning-600">{formatNumber(lowStock.length)}</div></CardBody></Card><Card><CardBody><div className="text-xs text-ink-500 mb-1">نفد المخزون</div><div className="text-xl font-bold text-danger-600">{formatNumber(outOfStock.length)}</div></CardBody></Card></div>
      <div className="flex gap-2">{[{ v: 'all' as const, l: 'الكل' },{ v: 'low' as const, l: 'منخفض' },{ v: 'out' as const, l: 'نفد' }].map(f => <button key={f.v} onClick={() => setFilter(f.v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f.v ? 'bg-primary-600 text-white' : 'bg-white text-ink-600 border border-ink-200'}`}>{f.l}</button>)}</div>
      <Card><DataTable columns={[{ key: 'product', label: 'المنتج', render: (r: InventoryBalance) => r.product?.name || '—' },{ key: 'sku', label: 'SKU', render: (r: InventoryBalance) => <span className="font-mono text-xs text-ink-500">{r.product?.sku || '—'}</span> },{ key: 'warehouse', label: 'المستودع', render: (r: InventoryBalance) => r.warehouse?.name || '—' },{ key: 'quantity', label: 'الكمية', align: 'right', render: (r: InventoryBalance) => formatNumber(r.quantity) },{ key: 'unit_cost', label: 'التكلفة', align: 'right', render: (r: InventoryBalance) => formatCurrency(r.unit_cost) },{ key: 'value', label: 'القيمة', align: 'right', render: (r: InventoryBalance) => formatCurrency(Number(r.quantity) * Number(r.unit_cost)) },{ key: 'status', label: 'الحالة', align: 'center', render: (r: InventoryBalance) => { if (Number(r.quantity) <= 0) return <Badge variant="danger">نفد</Badge>; if (Number(r.quantity) <= Number(r.product?.reorder_point || 0)) return <Badge variant="warning">منخفض</Badge>; return <Badge variant="success">متاح</Badge>; }}]} data={filtered} emptyMessage="لا توجد بيانات مخزون" /></Card>
    </div>
  );
}

interface QualityIssue { entity: string; field: string; issue: string; count: number; severity: 'critical' | 'warning' | 'info'; }
interface EntityQuality { name: string; total: number; issues: number; score: number; icon: 'users' | 'package' | 'warehouse' | 'receipt'; }
function scoreColor(score: number): string { if (score >= 90) return 'text-success-600'; if (score >= 70) return 'text-warning-600'; return 'text-danger-600'; }
function scoreBg(score: number): string { if (score >= 90) return 'bg-success-500'; if (score >= 70) return 'bg-warning-500'; return 'bg-danger-500'; }
function severityBadge(sev: string): string { if (sev === 'critical') return 'danger'; if (sev === 'warning') return 'warning'; return 'neutral'; }

export function DataQualityPage() {
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [issues, setIssues] = useState<QualityIssue[]>([]); const [entities, setEntities] = useState<EntityQuality[]>([]); const [overallScore, setOverallScore] = useState(0);
  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const { customers, products, invoices, balances } = await fetchDataQualityDatasets();
      const allIssues: QualityIssue[] = [];
      const custTotal = customers.length; let custIssues = 0; const custMissingName = customers.filter(c => !String(c.name || '').trim()).length; const custMissingPhone = customers.filter(c => !String(c.phone || '').trim()).length; const custMissingCode = customers.filter(c => !String(c.code || '').trim()).length; const custDupNames = new Map<string, number>(); customers.forEach(c => { const n = String(c.name || '').trim(); if (n) custDupNames.set(n, (custDupNames.get(n) || 0) + 1); }); const custDuplicateNames = Array.from(custDupNames.values()).filter(v => v > 1).reduce((s, v) => s + v, 0); custIssues += custMissingName + custMissingPhone + custMissingCode + custDuplicateNames;
      if (custMissingName) allIssues.push({ entity: 'العملاء', field: 'الاسم', issue: 'اسم فارغ', count: custMissingName, severity: 'critical' }); if (custMissingPhone) allIssues.push({ entity: 'العملاء', field: 'الهاتف', issue: 'هاتف فارغ', count: custMissingPhone, severity: 'warning' }); if (custMissingCode) allIssues.push({ entity: 'العملاء', field: 'الكود', issue: 'كود فارغ', count: custMissingCode, severity: 'info' }); if (custDuplicateNames) allIssues.push({ entity: 'العملاء', field: 'الاسم', issue: 'أسماء مكررة', count: custDuplicateNames, severity: 'warning' });
      const custScore = custTotal > 0 ? Math.round(((custTotal - custIssues) / custTotal) * 100) : 100;
      const prodTotal = products.length; let prodIssues = 0; const prodMissingSku = products.filter(p => !String(p.sku || '').trim()).length; const prodMissingName = products.filter(p => !String(p.name || '').trim()).length; const prodZeroPrice = products.filter(p => Number(p.selling_price) <= 0).length; const prodNegPrice = products.filter(p => Number(p.cost_price) < 0 || Number(p.selling_price) < 0).length; const prodDupSku = new Map<string, number>(); products.forEach(p => { const s = String(p.sku || '').trim(); if (s) prodDupSku.set(s, (prodDupSku.get(s) || 0) + 1); }); const prodDuplicateSku = Array.from(prodDupSku.values()).filter(v => v > 1).reduce((s, v) => s + v, 0); prodIssues += prodMissingSku + prodMissingName + prodZeroPrice + prodNegPrice + prodDuplicateSku;
      if (prodMissingSku) allIssues.push({ entity: 'المنتجات', field: 'SKU', issue: 'SKU فارغ', count: prodMissingSku, severity: 'critical' }); if (prodMissingName) allIssues.push({ entity: 'المنتجات', field: 'الاسم', issue: 'اسم فارغ', count: prodMissingName, severity: 'critical' }); if (prodZeroPrice) allIssues.push({ entity: 'المنتجات', field: 'السعر', issue: 'سعر صفري', count: prodZeroPrice, severity: 'warning' }); if (prodNegPrice) allIssues.push({ entity: 'المنتجات', field: 'السعر', issue: 'سعر سالب', count: prodNegPrice, severity: 'critical' }); if (prodDuplicateSku) allIssues.push({ entity: 'المنتجات', field: 'SKU', issue: 'SKU مكرر', count: prodDuplicateSku, severity: 'critical' });
      const prodScore = prodTotal > 0 ? Math.round(((prodTotal - prodIssues) / prodTotal) * 100) : 100;
      const invTotal = invoices.length; let invIssues = 0; const invZeroTotal = invoices.filter(i => Number(i.total) <= 0).length; const invNegTotal = invoices.filter(i => Number(i.total) < 0).length; const invPaidExceeds = invoices.filter(i => Number(i.paid_amount) > Number(i.total)).length; const invMissingCustomer = invoices.filter(i => !i.customer_id).length; const invMissingDate = invoices.filter(i => !i.invoice_date).length; const invDupNumber = new Map<string, number>(); invoices.forEach(i => { const n = String(i.invoice_number || '').trim(); if (n) invDupNumber.set(n, (invDupNumber.get(n) || 0) + 1); }); const invDuplicateNum = Array.from(invDupNumber.values()).filter(v => v > 1).reduce((s, v) => s + v, 0); invIssues += invZeroTotal + invNegTotal + invPaidExceeds + invMissingCustomer + invMissingDate + invDuplicateNum;
      if (invZeroTotal) allIssues.push({ entity: 'الفواتير', field: 'الإجمالي', issue: 'إجمالي صفري', count: invZeroTotal, severity: 'warning' }); if (invNegTotal) allIssues.push({ entity: 'الفواتير', field: 'الإجمالي', issue: 'إجمالي سالب', count: invNegTotal, severity: 'critical' }); if (invPaidExceeds) allIssues.push({ entity: 'الفواتير', field: 'المدفوع', issue: 'مدفوع يتجاوز الإجمالي', count: invPaidExceeds, severity: 'critical' }); if (invMissingCustomer) allIssues.push({ entity: 'الفواتير', field: 'العميل', issue: 'عميل فارغ', count: invMissingCustomer, severity: 'critical' }); if (invMissingDate) allIssues.push({ entity: 'الفواتير', field: 'التاريخ', issue: 'تاريخ فارغ', count: invMissingDate, severity: 'critical' }); if (invDuplicateNum) allIssues.push({ entity: 'الفواتير', field: 'رقم الفاتورة', issue: 'أرقام مكررة', count: invDuplicateNum, severity: 'warning' });
      const invScore = invTotal > 0 ? Math.round(((invTotal - invIssues) / invTotal) * 100) : 100;
      const balTotal = balances.length; let balIssues = 0; const balNegQty = balances.filter(b => Number(b.quantity) < 0).length; const balNegCost = balances.filter(b => Number(b.unit_cost) < 0).length; const balMissingProduct = balances.filter(b => !b.product_id).length; balIssues += balNegQty + balNegCost + balMissingProduct;
      if (balNegQty) allIssues.push({ entity: 'المخزون', field: 'الكمية', issue: 'كمية سالبة', count: balNegQty, severity: 'critical' }); if (balNegCost) allIssues.push({ entity: 'المخزون', field: 'التكلفة', issue: 'تكلفة سالبة', count: balNegCost, severity: 'critical' }); if (balMissingProduct) allIssues.push({ entity: 'المخزون', field: 'المنتج', issue: 'منتج فارغ', count: balMissingProduct, severity: 'critical' });
      const balScore = balTotal > 0 ? Math.round(((balTotal - balIssues) / balTotal) * 100) : 100;
      setEntities([{ name: 'العملاء', total: custTotal, issues: custIssues, score: custScore, icon: 'users' },{ name: 'المنتجات', total: prodTotal, issues: prodIssues, score: prodScore, icon: 'package' },{ name: 'الفواتير', total: invTotal, issues: invIssues, score: invScore, icon: 'receipt' },{ name: 'المخزون', total: balTotal, issues: balIssues, score: balScore, icon: 'warehouse' }]);
      setIssues(allIssues.sort((a, b) => b.count - a.count)); const totalRecords = custTotal + prodTotal + invTotal + balTotal; const totalIssues = custIssues + prodIssues + invIssues + balIssues; setOverallScore(totalRecords > 0 ? Math.round(((totalRecords - totalIssues) / totalRecords) * 100) : 100);
    } catch (e: any) { setError(e.message || 'فشل تحميل بيانات الجودة'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <LoadingState message="جارٍ فحص جودة البيانات..." />; if (error) return <ErrorState message={error} onRetry={load} />;
  const iconMap: Record<string, any> = { users: Users, package: Package, receipt: BarChart3, warehouse: Warehouse }; const totalRecords = entities.reduce((s, e) => s + e.total, 0); const totalIssues = entities.reduce((s, e) => s + e.issues, 0);
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="جودة البيانات" subtitle="فحص شمولية ودقة البيانات عبر جميع الكيانات" />
      <Card className="bg-gradient-to-br from-ink-50 to-white"><CardBody><div className="flex flex-col lg:flex-row items-center gap-6"><div className="relative w-32 h-32 flex-shrink-0"><svg className="w-full h-full -rotate-90" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-ink-100" /><circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className={overallScore >= 90 ? 'text-success-500' : overallScore >= 70 ? 'text-warning-500' : 'text-danger-500'} strokeDasharray={`${(overallScore / 100) * 327} 327`} strokeLinecap="round" /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className={`text-3xl font-bold ${scoreColor(overallScore)}`}>{overallScore}%</span><span className="text-xs text-ink-400 mt-1">الدرجة الإجمالية</span></div></div><div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full"><div className="text-center p-3 rounded-lg bg-ink-50"><Database className="mx-auto text-primary-500 mb-1" size={20} /><div className="text-xl font-bold text-ink-900">{formatNumber(totalRecords)}</div><div className="text-xs text-ink-500">إجمالي السجلات</div></div><div className="text-center p-3 rounded-lg bg-ink-50"><CheckCircle2 className="mx-auto text-success-500 mb-1" size={20} /><div className="text-xl font-bold text-success-600">{formatNumber(totalRecords - totalIssues)}</div><div className="text-xs text-ink-500">سجلات سليمة</div></div><div className="text-center p-3 rounded-lg bg-ink-50"><AlertTriangle className="mx-auto text-warning-500 mb-1" size={20} /><div className="text-xl font-bold text-warning-600">{formatNumber(totalIssues)}</div><div className="text-xs text-ink-500">مشاكل مكتشفة</div></div><div className="text-center p-3 rounded-lg bg-ink-50"><ShieldCheck className="mx-auto text-primary-500 mb-1" size={20} /><div className="text-xl font-bold text-ink-900">{entities.length}</div><div className="text-xs text-ink-500">كيانات مفحوصة</div></div></div></div></CardBody></Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{entities.map(e => { const Icon = iconMap[e.icon] || Database; return <Card key={e.name}><CardBody><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center"><Icon size={18} /></div><div><div className="font-semibold text-sm text-ink-800">{e.name}</div><div className="text-xs text-ink-400">{formatNumber(e.total)} سجل</div></div></div><div className="flex items-center justify-between mb-2"><span className="text-xs text-ink-500">الدرجة</span><span className={`text-lg font-bold ${scoreColor(e.score)}`}>{e.score}%</span></div><div className="h-2 bg-ink-100 rounded-full overflow-hidden"><div className={`h-full ${scoreBg(e.score)} rounded-full transition-all duration-500`} style={{ width: `${e.score}%` }} /></div>{e.issues > 0 ? <div className="text-xs text-warning-600 mt-2">{formatNumber(e.issues)} مشكلة</div> : <div className="text-xs text-success-600 mt-2">لا توجد مشاكل</div>}</CardBody></Card>})}</div>
      <Card><CardHeader title="المشاكل المكتشفة" subtitle="تفاصيل مشاكل جودة البيانات" />{issues.length === 0 ? <CardBody><EmptyState icon={<CheckCircle2 size={32} />} title="لا توجد مشاكل في جودة البيانات" message="جميع السجلات سليمة ومكتملة" /></CardBody> : <DataTable columns={[{ key: 'entity', label: 'الكيان', render: (r: QualityIssue) => <span className="font-medium text-ink-800">{r.entity}</span> },{ key: 'field', label: 'الحقل', render: (r: QualityIssue) => r.field },{ key: 'issue', label: 'المشكلة', render: (r: QualityIssue) => r.issue },{ key: 'count', label: 'العدد', align: 'center', render: (r: QualityIssue) => <span className="font-semibold text-ink-800">{formatNumber(r.count)}</span> },{ key: 'severity', label: 'الخطورة', align: 'center', render: (r: QualityIssue) => { const sevMap: any = { critical: 'حرجة', warning: 'تحذير', info: 'معلومة' }; return <Badge variant={severityBadge(r.severity) as any}>{sevMap[r.severity] || r.severity}</Badge>; }}]} data={issues} emptyMessage="لا توجد مشاكل" />}</Card>
    </div>
  );
}

export function SettingsPage() {
  return <div className="space-y-6 animate-fade-in"><PageHeader title="الإعدادات" subtitle="إعدادات النظام والشركة" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Card><CardHeader title="معلومات الشركة" /><CardBody><div className="space-y-3"><div><label className="text-xs text-ink-500">اسم الشركة</label><div className="text-sm font-medium text-ink-800">شركة العامري للتجارة والتوزيع</div></div><div><label className="text-xs text-ink-500">السجل الضريبي</label><div className="text-sm font-medium text-ink-800">300123456700003</div></div><div><label className="text-xs text-ink-500">العملة</label><div className="text-sm font-medium text-ink-800">ر.س (ريال سعودي)</div></div><div><label className="text-xs text-ink-500">القطاع</label><div className="text-sm font-medium text-ink-800">التوزيع والتجارة</div></div></div></CardBody></Card><Card><CardHeader title="إعدادات النظام" /><CardBody><div className="space-y-3"><div className="flex items-center justify-between p-3 rounded-lg bg-ink-50"><span className="text-sm text-ink-700">الإشعارات</span><Badge variant="success">مفعّلة</Badge></div><div className="flex items-center justify-between p-3 rounded-lg bg-ink-50"><span className="text-sm text-ink-700">التوصيات التلقائية</span><Badge variant="success">مفعّلة</Badge></div><div className="flex items-center justify-between p-3 rounded-lg bg-ink-50"><span className="text-sm text-ink-700">التنبؤات</span><Badge variant="success">مفعّلة</Badge></div><div className="flex items-center justify-between p-3 rounded-lg bg-ink-50"><span className="text-sm text-ink-700">محاكاة السيناريوهات</span><Badge variant="success">مفعّلة</Badge></div></div></CardBody></Card></div></div>;
}
