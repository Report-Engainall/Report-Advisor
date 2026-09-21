import { ArrowLeft, Boxes, Package, Truck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/States';

const links = [
  { path: '/customers', title: 'العملاء', desc: 'الكيانات والعملاء وسياقهم التجاري.', icon: Users },
  { path: '/products', title: 'المنتجات', desc: 'الأصناف والهوية المرجعية ومفاتيح الأعمال.', icon: Package },
  { path: '/inventory', title: 'المخزون', desc: 'مرجع المخزون والكميات المرتبطة بالمصدر.', icon: Boxes },
  { path: '/alternative-groups', title: 'البدائل', desc: 'مجموعات الأصناف البديلة والتحقيق في الاستبدال.', icon: Truck },
];

export function MasterDataHubPage() {
  return <div dir="rtl" className="space-y-6 animate-fade-in">
    <PageHeader title="البيانات المرجعية" subtitle="الكيانات والمفاتيح التي تمنح التحليل سياقه الصحيح دون تحويل المنصة إلى نظام CRUD." />
    <section className="ag-operational-hero rounded-[1.75rem] border border-primary-100 p-6 lg:p-8">
      <div className="text-[10px] font-black tracking-[.14em] text-primary-700">MASTER DATA / SEMANTIC CONTEXT</div>
      <h2 className="mt-2 text-2xl font-black text-ink-950">كيانات واضحة، سياق موثوق، وقرارات أدق.</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-500">هذه الطبقة تنظّم الهوية المرجعية فقط. الحسابات والتحليلات تبقى في مساراتها الكانونية.</p>
    </section>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {links.map(({ path, title, desc, icon: Icon }) => <Link key={path} to={path} className="group">
        <Card className="h-full transition hover:-translate-y-1 hover:border-primary-300"><CardBody>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><Icon size={20}/></span>
          <h3 className="mt-4 text-base font-black text-ink-900">{title}</h3>
          <p className="mt-2 min-h-12 text-xs leading-6 text-ink-500">{desc}</p>
          <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-[10px] font-black text-primary-700"><span>فتح المسار</span><ArrowLeft size={14}/></div>
        </CardBody></Card>
      </Link>)}
    </section>
    <div className="rounded-2xl border border-warning-200 bg-warning-50/60 p-4 text-xs leading-6 text-warning-800">لا تُعرض كيانات غير مثبتة كبيانات حقيقية. ما لا يملك مسارًا موثقًا يبقى غير متاح بدل تصنيع سجلات.</div>
  </div>;
}
