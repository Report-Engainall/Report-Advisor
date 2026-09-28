import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, FileBarChart, Package, Printer, Receipt, ShoppingCart, SlidersHorizontal, TrendingUp, ShieldCheck, GitBranch, Target } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState, DataUnavailableState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { TrendChart, HorizontalBarChart, CategoryPieChart } from '@/components/ui/Charts';
import { fetchDashboardSnapshot, fetchInventoryReportSnapshot } from '@/lib/dashboard-canonical';
import { fetchSalesInvoices, fetchPurchaseInvoices, fetchPurchaseSummary, fetchSalesExportRows, fetchPurchaseExportRows, fetchInventoryExportRows, fetchReceivablesExportRows, fetchImportEvidenceSnapshot, fetchImportRecords, fetchReportExecutionJob } from '@/lib/queries';
import type { ImportRecord } from '@/lib/types';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import { downloadReportArtifact } from '@/lib/report-execution/download';
import { ReportSurfaceContext } from '@/components/ReportSurfaceContext';
import type { SalesInvoice, PurchaseInvoice } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingBucket, InventoryReportRow } from '@/lib/dashboard-canonical';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const reportCards = [
  { path:'/reports/executive', title:'التقرير التنفيذي', stage:'Decision Output', desc:'الحالة التجارية الحالية، حدود الدليل، القرارات، الإجراء التالي ومسار النتيجة.', icon:Target, iconClass:'bg-ink-950 text-white' },
  { path:'/reports/sales', title:'المبيعات', stage:'Domain Output', desc:'حركة المبيعات والفواتير والعملاء والمنتجات من اللقطة الكانونية.', icon:ShoppingCart, iconClass:'bg-primary-50 text-primary-600' },
  { path:'/reports/purchases', title:'المشتريات', stage:'Domain Output', desc:'المشتريات والموردون والمتوسطات والتدفقات الداخلة مع سياق As Of.', icon:FileBarChart, iconClass:'bg-accent-50 text-accent-600' },
  { path:'/reports/inventory', title:'المخزون', stage:'Domain Output', desc:'الكمية والتكلفة والقيمة ونقص البيانات وحالات المخزون.', icon:Package, iconClass:'bg-success-50 text-success-600' },
  { path:'/reports/inventory-intelligence', title:'ذكاء المخزون', stage:'Intelligence Output', desc:'قراءة المخاطر والحركة والأولوية التشغيلية عبر المسار التجاري الحالي.', icon:ShieldCheck, iconClass:'bg-success-50 text-success-600' },
  { path:'/reports/demand-velocity', title:'سرعة الطلب', stage:'Analytical Output', desc:'حركة الطلب والسرعة والاتجاهات عندما تمر بوابات الحقيقة المناسبة.', icon:GitBranch, iconClass:'bg-primary-50 text-primary-600' },
  { path:'/reports/receivables', title:'الذمم والتحصيل', stage:'Decision Output', desc:'الذمم وأعمار الاستحقاق ومتابعة التحصيل دون ادعاء قابلية الاسترداد تلقائيًا.', icon:Receipt, iconClass:'bg-warning-50 text-warning-600' },
  { path:'/reports/profitability', title:'الربحية', stage:'Decision Output', desc:'الربحية حسب الفئة مع حجب النتيجة عند غياب تكلفة مثبتة أو اتساق عملة.', icon:TrendingUp, iconClass:'bg-primary-50 text-primary-600' },
];