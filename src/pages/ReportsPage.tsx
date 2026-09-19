import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileBarChart, ShoppingCart, Package, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { TrendChart, HorizontalBarChart, CategoryPieChart } from '@/components/ui/Charts';
import { fetchDashboardSnapshot, fetchInventoryReportSnapshot } from '@/lib/dashboard-canonical';
import { fetchSalesInvoices, fetchPurchaseInvoices, fetchPurchaseSummary, fetchSalesExportRows, fetchPurchaseExportRows, fetchInventoryExportRows, fetchReceivablesExportRows } from '@/lib/queries';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import { downloadReportArtifact } from '@/lib/report-execution/download';
import type { SalesInvoice, PurchaseInvoice } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingBucket, InventoryReportRow } from '@/lib/dashboard-canonical';

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : 'تعذر تحميل التقرير';

const reportCards = [
  { path:'/reports/sales', title:'المبيعات', stage:'قياس', desc:'حركة المبيعات والفواتير والعملاء والمنتجات.', icon:ShoppingCart, iconClass:'bg-primary-50 text-primary-600' },
  { path:'/reports/purchases', title:'المشتريات', stage:'مصدر', desc:'المشتريات والموردون والتدفقات الداخلة.', icon:FileBarChart, iconClass:'bg-accent-50 text-accent-600' },
  { path:'/reports/inventory', title:'المخزون', stage:'دليل', desc:'الكمية والتكلفة والقيمة والحالات غير المكتملة.', icon:Package, iconClass:'bg-success-50 text-success-600' },
  { path:'/reports/receivables', title:'الذمم والتحصيل', stage:'قرار', desc:'الذمم وأعمار الاستحقاق ومتابعة التحصيل.', icon:Receipt, iconClass:'bg-warning-50 text-warning-600' },
  { path:'/reports/profitability', title:'الربحية', stage:'قرار', desc:'هوامش الربحية حسب المنتج والعميل والفئة.', icon:TrendingUp, iconClass:'bg-primary-50 text-primary-600' },
];

export function ReportsCenterPage() {
  return <div dir="rtl" className="space-y-6 animate-fade-in pb-10">
    <PageHeader title="مركز التقارير" subtitle="منظومة التقارير التنفيذية: كل رقم يعود إلى مصدره، وكل تفسير يبقى منفصلًا عن حقيقة البيانات."/>
    <section className="rounded-3xl bg-ink-950 p-6 text-white lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_.6fr] items-end">
        <div>
          <div className="text-xs font-semibold text-primary-300">بيانات → دليل → قرار</div>
          <h1 className="mt-2 text-2xl font-bold lg:text-3xl">التقرير ليس شاشة أرقام؛ إنه حزمة أدلة قابلة للمراجعة.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-300">استخدم التقارير لتفسير الحالة الحالية، مع الحفاظ على مؤشرات نقص البيانات والحالات غير القابلة للحساب بدل إخفائها.</p>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-white/5 p-4 text-sm">
          <div className="font-semibold">قاعدة العرض</div>
          <div className="mt-2 text-xs leading-6 text-ink-300">مصدر واضح · حالة بيانات واضحة · لا رقم بديل عند غياب المصدر</div>
        </div>
      </div>
    </section>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reportCards.map((r) => <Link key={r.path} to={r.path} className="group">
        <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
          <CardBody>
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${r.iconClass}`}><r.icon size={20}/></div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-bold text-ink-500">{r.stage}</span>
                  <span className="text-xs text-ink-400 group-hover:text-primary-600">فتح التقرير ←</span>
                </div>
                <h3 className="text-base font-bold text-ink-900">{r.title}</h3>
                <p className="mt-1 text-xs leading-6 text-ink-500">{r.desc}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </Link>)}
    </div>
  </div>;
}

export { SalesReportCanonicalPage as SalesReportPage } from './SalesReportCanonicalPage';
export { PurchasesReportCanonicalPage as PurchasesReportPage } from './PurchasesReportCanonicalPage';
export { InventoryReportCanonicalPage as InventoryReportPage } from './InventoryReportCanonicalPage';
