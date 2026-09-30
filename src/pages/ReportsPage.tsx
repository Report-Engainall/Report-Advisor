import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileBarChart, ShoppingCart, Package, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState, DataUnavailableState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/DataTable';
import { TrendChart, HorizontalBarChart, CategoryPieChart } from '@/components/ui/Charts';
import { fetchDashboardSnapshot, fetchInventoryReportSnapshot } from '@/lib/dashboard-canonical';
import { fetchSmartReport, fetchSmartReportCatalog, type SmartReportCatalogItem, type SmartReportDetail } from '@/lib/report-smart';
import { readActiveReportContext } from '@/lib/report-context';
import { fetchSalesInvoices, fetchPurchaseInvoices, fetchPurchaseSummary, fetchSalesExportRows, fetchPurchaseExportRows, fetchInventoryExportRows, fetchReceivablesExportRows } from '@/lib/queries';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import { ReportSourceContext } from '@/components/ReportSourceContext';
import { downloadReportArtifact } from '@/lib/report-execution/download';
import type { SalesInvoice, PurchaseInvoice } from '@/lib/types';
import type { DashboardKPIs, MonthlyTrend, TopEntity, CategoryBreakdown, AgingBucket, InventoryReportRow } from '@/lib/dashboard-canonical';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function ReportTruthBar({ status, asOf, period, note }: { status: string; asOf?: string; period: string; note?: string }) {
  const normalized = status === 'CONFIRMED' || status === 'CALCULATED' ? status : 'INSUFFICIENT DATA';
  const tone = normalized === 'CONFIRMED'
    ? 'border-success-200 bg-success-50 text-success-800'
    : normalized === 'CALCULATED'
      ? 'border-primary-200 bg-primary-50 text-primary-800'
      : 'border-warning-200 bg-warning-50 text-warning-900';
  return <section aria-label="سياق حقيقة التقرير" className={'flex flex-wrap items-center gap-2 rounded-[12px] border px-3 py-2.5 text-[10px] ' + tone}>
    <span className="font-black">{normalized}</span>
    <span>الفترة: {period}</span>
    {asOf && <span>As-of: {asOf}</span>}
    {note && <span className="text-current/70">{note}</span>}
    <span className="mr-auto font-semibold">القيم غير المتاحة تبقى غير متاحة ولا تُستبدل بتقديرات.</span>
  </section>;
}

function useOptionalSourceReport() {
  const [params] = useSearchParams();
  const jobId = params.get('reportJobId')?.trim() ?? '';
  const [report, setReport] = useState<SmartReportDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(jobId));
  const [error, setError] = useState<string | null>(null);
  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    if (!jobId) {
      setReport(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const next = await fetchSmartReport(jobId);
      if (version !== requestVersion.current) return;
      setReport(next);
    } catch (cause) {
      if (version !== requestVersion.current) return;
      setError(errorMessage(cause));
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { jobId, report, loading, error, retry: load };
}

function sourceValue(columns: Array<any>, ...tokens: string[]): any {
  return columns.find((column) => tokens.some((token) => String(column.mappedField ?? column.name ?? '').toLowerCase().replace(/[\\s_-]+/g, '').includes(token.toLowerCase().replace(/[\\s_-]+/g, ''))));
}

function sourceNumber(column: any, stat: 'sum' | 'mean' | 'max' = 'sum'): number | null {
  const value = column?.statistics?.[stat];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function sourceBoundHref(path: string, report: SmartReportDetail): string {
  return path + (path.includes('?') ? '&' : '?')
    + 'reportJobId=' + encodeURIComponent(report.jobId)
    + '&sourceHash=' + encodeURIComponent(report.sourceHash);
}

function SourceBoundDomainSurface({ report, expectedSpecialty, title }: { report: SmartReportDetail; expectedSpecialty: string; title: string }) {
  const dataset = report.sourceAnalysis?.datasets?.[0];
  const objectDataset = dataset && typeof dataset === 'object' ? dataset as Record<string, unknown> : {};
  const columns = Array.isArray(objectDataset.columns) ? objectDataset.columns : [];
  const preview = Array.isArray(objectDataset.preview) ? objectDataset.preview.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object').slice(0, 12) : [];
  const amount = sourceValue(columns, 'outstanding_balance', 'local_amount', 'total_amount', 'net_amount', 'total', 'amount', 'value', 'sales', 'purchase');
  const quantity = sourceValue(columns, 'quantity', 'qty', 'current_stock', 'stock');
  const profit = sourceValue(columns, 'profit', 'gross_profit');
  const margin = sourceValue(columns, 'margin', 'gross_margin');
  const age120 = sourceValue(columns, 'age_over_120', 'over_120');