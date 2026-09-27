import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Boxes, BookOpenCheck, KeyRound, Package, RefreshCw, Tags, Truck, Users, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import { formatNumber } from '@/lib/format';

type MasterDataCounts = {
  customers: number;
  products: number;
  inventory: number;
  suppliers: number;
  warehouses: number;
  branches: number;
  categories: number;
};

const entityLinks = [
  { path: '/customers', title: 'العملاء', desc: 'الكيانات والعملاء وسياقهم التجاري.', icon: Users, countKey: 'customers' as const },
  { path: '/products', title: 'المنتجات', desc: 'الأصناف والهوية المرجعية ومفاتيح الأعمال.', icon: Package, countKey: 'products' as const },
  { path: '/inventory', title: 'المخزون', desc: 'مرجع المخزون والكميات المرتبطة بالمصدر.', icon: Boxes, countKey: 'inventory' as const },
  { path: '/suppliers', title: 'الموردون', desc: 'هوية الموردين وسياقهم المرجعي المرتبط بالمشتريات.', icon: Truck, countKey: 'suppliers' as const },
  { path: '/alternative-groups', title: 'البدائل', desc: 'مجموعات الأصناف البديلة والتحقيق في الاستبدال.', icon: Tags, countKey: null },
];

const semanticSurfaces = [
  { title: 'مفاتيح الأعمال', icon: KeyRound, detail: 'المفتاح التجاري يُستنتج داخل المسار الكانوني ويحكم المطابقة والقراءة اللاحقة؛ لا توجد شاشة تحرير مستقلة تكرر المصدر.' },
  { title: 'المرادفات والوحدات', icon: Tags, detail: 'تُدار ضمن فهم المصدر والتطبيع عندما تتوفر أدلة mapping؛ غياب الدليل يبقيها غير مثبتة بدل تخمينها.' },
  { title: 'القاموس الدلالي', icon: BookOpenCheck, detail: 'الطبقة الدلالية تُعرض كسياق تحليلي، بينما تُحفظ الحقيقة المرجعية في الجداول الكانونية ومسار الاستيراد.' },
];

export function MasterDataHubPage() {
  const [counts, setCounts] = useState<MasterDataCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const companyId = await resolveCurrentCompanyId();
      if (!companyId) throw new Error('TENANT_REQUIRED');

      const countFor = async (table: keyof MasterDataCounts) => {
        const sourceTable = table === 'inventory' ? 'inventory_balances' : table;
        const { count, error: queryError } = await supabase
          .from(sourceTable)
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId);
        if (queryError) throw queryError;
        return count ?? 0;
      };

      const [customers, products, inventory, suppliers, warehouses, branches, categories] = await Promise.all([
        countFor('customers'),
        countFor('products'),
        countFor('inventory'),
        countFor('suppliers'),
        countFor('warehouses'),
        countFor('branches'),
        countFor('categories'),
      ]);

      setCounts({ customers, products, inventory, suppliers, warehouses, branches, categories });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل حالة البيانات المرجعية');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const summary = useMemo(() => {
    if (!counts) return null;
    const domains = [counts.customers, counts.products, counts.inventory, counts.suppliers, counts.warehouses, counts.branches, counts.categories];
    return {
      populatedDomains: domains.filter(value => value > 0).length,
      totalRows: domains.reduce((total, value) => total + value, 0),
    };
  }, [counts]);

  if (loading) return <div dir="rtl"><LoadingState message="جارٍ قراءة الكيانات المرجعية من مساحة الشركة..." /></div>;
  if (error || !counts || !summary) return <div dir="rtl"><ErrorState message={error ?? 'تعذر قراءة الحقيقة المرجعية الحالية.'} onRetry={() => void load()} /></div>;

  return (
    <div dir="rtl" className="ag-master-data-surface space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="البيانات المرجعية"
        subtitle="هوية الكيانات والمفاتيح والدلالات التي تمنح التحليل سياقه الصحيح دون تحويل المنصة إلى نظام CRUD."
        actions={<button type="button" onClick={() => void load(true)} disabled={refreshing} className="btn-secondary inline-flex items-center gap-2" aria-busy={refreshing}><RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/> إعادة قراءة الحقيقة</button>}
      />

      <section className="ag-operational-hero overflow-hidden rounded-[1.75rem] border border-primary-100 p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
          <div>
            <div className="text-[10px] font-black tracking-[.14em] text-primary-700">MASTER DATA / SEMANTIC CONTEXT</div>
            <h2 className="mt-2 text-2xl font-black text-ink-950 lg:text-3xl">كيانات واضحة، سياق موثوق، وقرارات أدق.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-500">هذه الطبقة تقرأ الحقيقة من مساحة الشركة الحالية. لا يتم تحويل غياب سجل إلى صفر مخفي أو إلى سجل اصطناعي.</p>
          </div>
          <div className="rounded-2xl border border-primary-100 bg-white/80 p-4">
            <div className="text-[10px] font-black text-ink-400">الحالة الحالية</div>
            <div className="mt-1 text-sm font-black text-ink-900">{formatNumber(summary.populatedDomains)} من 7 طبقات مرجعية تحتوي بيانات مثبتة</div>
            <div className="mt-1 text-[11px] leading-5 text-ink-500">{formatNumber(summary.totalRows)} سجلًا مرجعيًا ضمن النطاق المقروء حاليًا.</div>
          </div>
        </div>
      </section>

      <section className="ag-decision-strip" aria-label="ملخص البيانات المرجعية">
        <div className="ag-decision-cell"><span className="ag-decision-label">العملاء</span><span className="ag-decision-value">{formatNumber(counts.customers)}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">المنتجات</span><span className="ag-decision-value">{formatNumber(counts.products)}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">المخزون</span><span className="ag-decision-value">{formatNumber(counts.inventory)}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">الموردون</span><span className="ag-decision-value">{formatNumber(counts.suppliers)}</span></div>
        <div className="ag-decision-cell"><span className="ag-decision-label">المستودعات</span><span className="ag-decision-value">{formatNumber(counts.warehouses)}</span></div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {entityLinks.map(({ path, title, desc, icon: Icon, countKey }) => {
          const count = countKey ? counts[countKey] : null;
          const hasData = count !== null && count > 0;
          return (
            <Link key={path} to={path} className="group">
              <Card className="h-full transition hover:-translate-y-1 hover:border-primary-300">
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><Icon size={20}/></span>
                    {count === null ? <span className="rounded-full bg-ink-100 px-2 py-1 text-[9px] font-black text-ink-500">حالة مسار</span> : <span className={hasData ? 'rounded-full bg-success-50 px-2 py-1 text-[9px] font-black text-success-700' : 'rounded-full bg-warning-50 px-2 py-1 text-[9px] font-black text-warning-800'}>{hasData ? formatNumber(count) + ' مثبت' : 'لا توجد بيانات'}</span>}
                  </div>
                  <h3 className="mt-4 text-base font-black text-ink-900">{title}</h3>
                  <p className="mt-2 min-h-12 text-xs leading-6 text-ink-500">{desc}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-[10px] font-black text-primary-700"><span>{count === 0 ? 'إدخال مصدر جديد' : 'فتح المسار'}</span><ArrowLeft size={14}/></div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="المواقع المرجعية" subtitle="المستودعات والفروع موجودة كبيانات مرجعية؛ مسار العرض الكانوني يبقى داخل المخزون حتى لا ننشئ شاشة مكررة." />
          <CardBody className="grid gap-3 md:grid-cols-2">
            {[
              { title: 'المستودعات والمواقع', detail: counts.warehouses > 0 ? formatNumber(counts.warehouses) + ' مستودع/موقع مثبت ضمن مساحة الشركة.' : 'لا توجد مستودعات مثبتة حاليًا ضمن مساحة الشركة.', value: counts.warehouses, icon: Warehouse },
              { title: 'الفروع', detail: counts.branches > 0 ? formatNumber(counts.branches) + ' فرعًا مثبتًا ضمن مساحة الشركة.' : 'لا توجد فروع مثبتة حاليًا ضمن مساحة الشركة.', value: counts.branches, icon: Boxes },
            ].map(({ title, detail, value, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-ink-100 bg-ink-50/45 p-4">
                <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Icon size={18} className="text-primary-700"/><span className="text-sm font-black text-ink-900">{title}</span></div><span className={value > 0 ? 'rounded-full bg-success-50 px-2.5 py-1 text-[9px] font-black text-success-700' : 'rounded-full bg-warning-50 px-2.5 py-1 text-[9px] font-black text-warning-800'}>{value > 0 ? 'VERIFIED' : 'INSUFFICIENT DATA'}</span></div>
                <p className="mt-2 text-[11px] leading-5 text-ink-600">{detail}</p>
                <Link to="/inventory" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[10px] font-black text-primary-700">{value > 0 ? 'عرض سياق المخزون' : 'ابدأ من الاستيراد'} <ArrowLeft size={13}/></Link>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="السياق الدلالي" subtitle="المفاهيم محفوظة كطبقة سياق، وليست أقسامًا تجارية مستقلة." />
          <CardBody className="space-y-3">
            {semanticSurfaces.map(({ title, detail, icon: Icon }) => <div key={title} className="flex gap-3 rounded-2xl border border-ink-100 bg-ink-50/45 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Icon size={16}/></div>
              <div><div className="text-xs font-black text-ink-900">{title}</div><p className="mt-1 text-[10px] leading-5 text-ink-500">{detail}</p></div>
            </div>)}
            <div className="rounded-xl border border-ink-100 bg-white p-3 text-[10px] leading-5 text-ink-600">
              <span className="font-black text-ink-900">الفئات المثبتة:</span> {formatNumber(counts.categories)} — تستخدم كمرجع تصنيفي، ولا تتحول تلقائيًا إلى قرار أو KPI.
            </div>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader title="خط المرجع إلى القرار" subtitle="الترابط التالي يصف مسار الحقيقة نفسه الذي تستخدمه الواجهات، وليس سجلًا تجريبيًا." />
        <CardBody>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {['Source', 'Business Key', 'Entity', 'Semantic Field', 'Analytics', 'Decision'].map((stage, index) => <div key={stage} className="relative rounded-xl border border-ink-100 bg-white p-3 text-center">
              <div className="text-[9px] font-black tracking-[.12em] text-ink-400">{String(index + 1).padStart(2, '0')}</div>
              <div className="mt-1 text-xs font-black text-ink-800">{stage}</div>
              <div className="mt-1 text-[9px] text-ink-400">{index < 2 ? 'مرجع النظام' : 'السياق يعتمد على المصدر'}</div>
            </div>)}
          </div>
        </CardBody>
      </Card>

      <div className="rounded-2xl border border-warning-200 bg-warning-50/60 p-4 text-xs leading-6 text-warning-800">
        <div className="flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0"/><span>الأعداد أعلاه tenant-scoped وتأتي من الجداول الكانونية مباشرة. غياب البيانات يبقى حالة حقيقية ولا يتحول إلى سجل افتراضي.</span></div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/trust" className="inline-flex min-h-11 items-center rounded-xl border border-warning-300 bg-white px-3 font-bold text-warning-900">فحص الدليل</Link>
          <Link to="/import" className="inline-flex min-h-11 items-center rounded-xl bg-primary-600 px-3 font-bold text-white hover:bg-primary-700">إدخال مصدر موحد</Link>
        </div>
      </div>
    </div>
  );
}
