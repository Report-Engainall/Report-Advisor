import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileText,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/States';
import {
  fetchCanonicalImportSourceContext,
  fetchCanonicalImportSourceRows,
  type CanonicalImportSourceContext,
  type CanonicalImportSourceRow,
} from '@/lib/queries';
import { formatCurrency, formatNumber } from '@/lib/format';

type SourceRow = Record<string, unknown>;

type ReportDomain =
  | 'sales'
  | 'purchases'
  | 'receivables'
  | 'inventory'
  | 'payments'
  | 'customers'
  | 'suppliers'
  | 'products'
  | 'source-data';

type SmartReport = {
  title: string;
  status: 'VERIFIED' | 'SUPPORTED' | 'PARTIAL' | 'REVIEW' | 'INSUFFICIENT DATA' | 'INSUFFICIENT_SAMPLE';
  detail: string;
};

function textValue(row: SourceRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return null;
}

function numericValue(row: SourceRow, keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key];
    const n = typeof value === 'number'
      ? value
      : Number(String(value ?? '').replace(/,/g, ''));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function sumNumeric(rows: SourceRow[], keys: string[]): { sum: number; rows: number } {
  let sum = 0;
  let count = 0;
  for (const row of rows) {
    const value = numericValue(row, keys);
    if (value != null) {
      sum += value;
      count += 1;
    }
  }
  return { sum, rows: count };
}

function uniqueCount(rows: SourceRow[], keys: string[]): number {
  return new Set(rows.map((row) => textValue(row, keys)).filter(Boolean)).size;
}

function domainLabel(domain: ReportDomain): string {
  const labels: Record<ReportDomain, string> = {
    sales: 'المبيعات',
    purchases: 'المشتريات',
    receivables: 'الذمم والتحصيل',
    inventory: 'المخزون',
    payments: 'الصندوق والسيولة',
    customers: 'العملاء',
    suppliers: 'الموردون',
    products: 'الأصناف',
    'source-data': 'المصدر العام',
  };
  return labels[domain];
}

function normalizeDomain(value: string | null | undefined): ReportDomain {
  const raw = String(value ?? '').toLowerCase();
  if (raw.includes('sales')) return 'sales';
  if (raw.includes('purchases')) return 'purchases';
  if (raw.includes('receiv')) return 'receivables';
  if (raw.includes('inventory') || raw.includes('stock')) return 'inventory';
  if (raw.includes('payment') || raw.includes('cash') || raw.includes('liquidity') || raw.includes('bank')) return 'payments';
  if (raw.includes('supplier')) return 'suppliers';
  if (raw.includes('customer')) return 'customers';
  if (raw.includes('product')) return 'products';
  return 'source-data';
}

function sourceTitle(context: CanonicalImportSourceContext): string {
  const summary = context.result_summary ?? {};
  return typeof summary.file_name === 'string' && summary.file_name.trim()
    ? summary.file_name
    : `التقرير المستورد — ${context.id}`;
}

function sourceHealth(context: CanonicalImportSourceContext, rowCount: number): 'VERIFIED' | 'REVIEW' {
  const complete = context.status === 'completed'
    && Number(context.invalid_rows ?? 0) === 0
    && Number(context.processed_rows ?? 0) === Number(context.total_rows ?? rowCount)
    && rowCount === Number(context.total_rows ?? rowCount);
  return complete ? 'VERIFIED' : 'REVIEW';
}

function StatusPill({ status }: { status: SmartReport['status'] }) {
  const positive = status === 'VERIFIED' || status === 'SUPPORTED';
  const partial = status === 'PARTIAL' || status === 'REVIEW';
  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black ' +
        (positive
          ? 'bg-success-50 text-success-800'
          : partial
            ? 'bg-primary-50 text-primary-700'
            : 'bg-warning-50 text-warning-900')
      }
    >
      {positive ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
      {status}
    </span>
  );
}

function metricValue(value: number | null, currency = false): string {
  if (value == null || !Number.isFinite(value)) return 'غير متاح';
  return currency ? formatCurrency(value) : formatNumber(value);
}

export function SourceBoundReportPage() {
  const { importId = '' } = useParams();
  const [rows, setRows] = useState<CanonicalImportSourceRow[]>([]);
  const [context, setContext] = useState<CanonicalImportSourceContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const [sourceContext, sourceRows] = await Promise.all([
          fetchCanonicalImportSourceContext(importId),
          fetchCanonicalImportSourceRows(importId),
        ]);
        if (!cancelled) {
          setContext(sourceContext);
          setRows(sourceRows);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [importId]);

  const sourceRows = useMemo(() => rows.map((row) => row.data as SourceRow), [rows]);

  const domain = useMemo<ReportDomain>(() => {
    const semantic = rows.find((row) => row.semantic_domain)?.semantic_domain;
    return normalizeDomain(semantic ?? context?.job_type);
  }, [context?.job_type, rows]);

  const analysis = useMemo(() => {
    const dates = sourceRows
      .map((row) => textValue(row, ['date', 'التاريخ', 'invoice_date', 'payment_date', 'movement_date', 'last_payment_date']))
      .filter((value): value is string => Boolean(value))
      .sort();

    const customers = uniqueCount(sourceRows, ['customer_name', 'اسم العميل', 'customer', 'client_name']);
    const suppliers = uniqueCount(sourceRows, ['supplier_name', 'اسم المورد', 'supplier', 'vendor_name']);
    const products = uniqueCount(sourceRows, ['sku', 'رقم الصنف', 'كود الصنف', 'product_code', 'اسم الصنف', 'name']);
    const invoices = uniqueCount(sourceRows, ['invoice_number', 'رقم الفاتوره', 'رقم الفاتورة', 'invoice_no']);
    const warehouses = uniqueCount(sourceRows, ['warehouse', 'المخزن', 'اسم المخزن', 'warehouse_name']);

    const salesAmount = sumNumeric(sourceRows, [
      'total',
      'اجمالي الفاتوره',
      'إجمالي الفاتورة',
      'net_sales',
      'صافي المبيعات',
      'sales_amount',
      'مبلغ المبيعات',
      'مبلغ الصافي بالمحلي',
    ]);
    const purchasesAmount = sumNumeric(sourceRows, [
      'net_amount',
      'total',
      'المبلغ',
      'purchase_amount',
      'اجمالي المبلغ',
      'اجمالي المبلغ المستحق',
    ]);
    const outstanding = sumNumeric(sourceRows, [
      'outstanding_balance',
      'المبلغ المتبقي',
      'balance',
      'الرصيد',
      'اجمالي المبلغ المستحق',
    ]);
    const collected = sumNumeric(sourceRows, [
      'collected_amount',
      'المبلغ المحصل',
      'paid_amount',
      'المدفوع',
    ]);
    const debit = sumNumeric(sourceRows, ['debit', 'مدين']);
    const credit = sumNumeric(sourceRows, ['credit', 'دائن']);
    const availableQty = sumNumeric(sourceRows, [
      'available_quantity',
      'الكمية المتوفرة',
      'الكميه المتوفره',
      'current_stock',
      'الرصيد',
    ]);
    const quantity = sumNumeric(sourceRows, ['quantity', 'الكمية', 'qty', 'كميات']);
    const incoming = sumNumeric(sourceRows, ['incoming', 'الوارد', 'الـوارد', 'الكميه الوارده', 'صافي الوارد']);
    const outgoing = sumNumeric(sourceRows, ['outgoing', 'المنصرف', 'الكميه المنصرفه']);
    const price = sumNumeric(sourceRows, ['price', 'السعر', 'آخر سعر توريد YER', 'last_purchase_price']);
    const cost = sumNumeric(sourceRows, ['cost', 'التكلفه', 'التكلفة الأولية', 'cost_price', 'متوسط التكلفه YER']);

    let stockValue = 0;
    let stockValueRows = 0;
    for (const row of sourceRows) {
      const qty = numericValue(row, ['available_quantity', 'الكمية المتوفرة', 'الكميه المتوفره', 'current_stock']);
      const unitPrice = numericValue(row, ['price', 'السعر', 'آخر سعر توريد YER', 'last_purchase_price', 'cost_price', 'متوسط التكلفه YER']);
      if (qty != null && unitPrice != null) {
        stockValue += qty * unitPrice;
        stockValueRows += 1;
      }
    }

    const missingCustomers = sourceRows.filter((row) => !textValue(row, ['customer_name', 'اسم العميل', 'customer', 'client_name'])).length;
    const missingSuppliers = sourceRows.filter((row) => !textValue(row, ['supplier_name', 'اسم المورد', 'supplier', 'vendor_name'])).length;
    const missingProducts = sourceRows.filter((row) => !textValue(row, ['sku', 'رقم الصنف', 'كود الصنف', 'product_code', 'اسم الصنف', 'name'])).length;
    const missingDates = sourceRows.filter((row) => !textValue(row, ['date', 'التاريخ', 'invoice_date', 'payment_date', 'movement_date', 'last_payment_date'])).length;

    const domainMetrics: Array<{ label: string; value: string; hint: string }> = (() => {
      switch (domain) {
        case 'sales':
          return [
            { label: 'إجمالي المبيعات', value: metricValue(salesAmount.rows ? salesAmount.sum : null, true), hint: 'من حقول المبيعات المصدرية فقط' },
            { label: 'فواتير فريدة', value: metricValue(invoices), hint: 'من هوية الفاتورة في المصدر' },
            { label: 'عملاء', value: metricValue(customers), hint: 'الهويات الموجودة فقط' },
            { label: 'الفترة', value: dates.length ? `${dates[0]} → ${dates[dates.length - 1]}` : 'غير متاح', hint: 'من حقول التاريخ المصدرية' },
            { label: 'الصفوف', value: metricValue(sourceRows.length), hint: 'canonical rows' },
          ];
        case 'purchases':
          return [
            { label: 'إجمالي المشتريات', value: metricValue(purchasesAmount.rows ? purchasesAmount.sum : null, true), hint: 'من مبلغ الشراء المصدر' },
            { label: 'موردون', value: metricValue(suppliers), hint: 'من المورد المسمّى' },
            { label: 'الأصناف', value: metricValue(products), hint: 'من SKU/الصنف' },
            { label: 'المتبقي', value: metricValue(outstanding.rows ? outstanding.sum : null, true), hint: 'الرصيد المصدر' },
            { label: 'الصفوف', value: metricValue(sourceRows.length), hint: 'canonical rows' },
          ];
        case 'receivables':
          return [
            { label: 'المتبقي', value: metricValue(outstanding.rows ? outstanding.sum : null, true), hint: 'من الرصيد المستحق' },
            { label: 'المحصل', value: metricValue(collected.rows ? collected.sum : null, true), hint: 'من السداد المسجل' },
            { label: 'عملاء', value: metricValue(customers), hint: 'الهويات الموجودة' },
            { label: 'سجلات بتواريخ', value: metricValue(sourceRows.length - missingDates), hint: 'آخر سداد/بيع أو تاريخ الحركة' },
            { label: 'الصفوف', value: metricValue(sourceRows.length), hint: 'canonical rows' },
          ];
        case 'inventory':
          return [
            { label: 'الكمية المتاحة', value: metricValue(availableQty.rows ? availableQty.sum : null), hint: 'الرصيد المتاح من المصدر' },
            { label: 'قيمة مخزون مشتقة', value: metricValue(stockValueRows ? stockValue : null, true), hint: `${formatNumber(stockValueRows)} صفوف لها كمية وسعر` },
            { label: 'الأصناف', value: metricValue(products), hint: 'SKU/رقم الصنف' },
            { label: 'المخازن', value: metricValue(warehouses), hint: 'المخازن المسمّاة' },
            { label: 'الحركة الواردة', value: metricValue(incoming.rows ? incoming.sum : null), hint: 'من الوارد المصدر' },
          ];
        case 'payments':
          return [
            { label: 'مدين', value: metricValue(debit.rows ? debit.sum : null, true), hint: 'من قيد المدين' },
            { label: 'دائن', value: metricValue(credit.rows ? credit.sum : null, true), hint: 'من قيد الدائن' },
            { label: 'صافي الحركة', value: debit.rows || credit.rows ? metricValue(credit.sum - debit.sum, true) : 'غير متاح', hint: 'دائن ناقص مدين' },
            { label: 'الرصيد', value: outstanding.rows ? metricValue(outstanding.sum / Math.max(1, outstanding.rows), true) : 'غير متاح', hint: 'متوسط الرصيد المسجل' },
            { label: 'التواريخ', value: metricValue(sourceRows.length - missingDates), hint: 'حركات مؤرخة' },
          ];
        case 'customers':
          return [
            { label: 'العملاء', value: metricValue(customers), hint: 'هويات العملاء في المصدر' },
            { label: 'صفوف ذات جوال', value: metricValue(uniqueCount(sourceRows, ['phone', 'رقم الجوال', 'phone_number'])), hint: 'هوية اتصال متاحة' },
            { label: 'حالات', value: metricValue(uniqueCount(sourceRows, ['status', 'توقيف'])), hint: 'تصنيفات الحالة' },
            { label: 'فروع', value: metricValue(uniqueCount(sourceRows, ['branch_id', 'رقم الفرع'])), hint: 'الفروع المصدرية' },
            { label: 'الصفوف', value: metricValue(sourceRows.length), hint: 'canonical rows' },
          ];
        case 'suppliers':
          return [
            { label: 'الموردون', value: metricValue(suppliers), hint: 'الهويات المسمّاة' },
            { label: 'المتبقي', value: metricValue(outstanding.rows ? outstanding.sum : null, true), hint: 'الأرصدة المستحقة' },
            { label: 'المبلغ', value: metricValue(purchasesAmount.rows ? purchasesAmount.sum : null, true), hint: 'من حقل المبلغ' },
            { label: 'التواريخ', value: metricValue(sourceRows.length - missingDates), hint: 'تواريخ مثبتة' },
            { label: 'الصفوف', value: metricValue(sourceRows.length), hint: 'canonical rows' },
          ];
        case 'products':
          return [
            { label: 'الأصناف', value: metricValue(products), hint: 'SKU/اسم الصنف' },
            { label: 'متوسط التكلفة', value: cost.rows ? metricValue(cost.sum / cost.rows, true) : 'غير متاح', hint: 'من التكلفة المصدرية' },
            { label: 'متوسط السعر', value: price.rows ? metricValue(price.sum / price.rows, true) : 'غير متاح', hint: 'من السعر المصدر' },
            { label: 'كميات', value: metricValue(quantity.rows ? quantity.sum : null), hint: 'عند توفر الكمية' },
            { label: 'الصفوف', value: metricValue(sourceRows.length), hint: 'canonical rows' },
          ];
        default:
          return [
            { label: 'الصفوف', value: metricValue(sourceRows.length), hint: 'canonical rows' },
            { label: 'أصناف', value: metricValue(products), hint: 'هوية صنف عند توفرها' },
            { label: 'عملاء', value: metricValue(customers), hint: 'هوية عميل عند توفرها' },
            { label: 'موردون', value: metricValue(suppliers), hint: 'هوية مورد عند توفرها' },
            { label: 'تواريخ', value: metricValue(sourceRows.length - missingDates), hint: 'تواريخ قابلة للقراءة' },
          ];
      }
    })();

    const qualityIssues: Array<{ key: string; title: string; detail: string }> = [];
    const expectedComplete = sourceHealth(context ?? {
      id: importId,
      status: null,
      job_type: null,
      total_rows: sourceRows.length,
      processed_rows: sourceRows.length,
      valid_rows: sourceRows.length,
      invalid_rows: 0,
      progress: 100,
      source_fingerprint: null,
      result_summary: null,
    }, sourceRows.length) === 'VERIFIED';

    if (!expectedComplete) {
      qualityIssues.push({
        key: 'continuity',
        title: 'استمرارية الاستيراد تحتاج مراجعة',
        detail: `processed=${formatNumber(Number(context?.processed_rows ?? 0))}/${formatNumber(Number(context?.total_rows ?? sourceRows.length))}, invalid=${formatNumber(Number(context?.invalid_rows ?? 0))}.`,
      });
    }

    if (domain === 'sales' && missingCustomers) {
      qualityIssues.push({ key: 'customers', title: 'صفوف بلا عميل مثبت', detail: `${formatNumber(missingCustomers)} صفًا خارج تحليلات هوية العميل.` });
    }
    if ((domain === 'purchases' || domain === 'suppliers') && missingSuppliers) {
      qualityIssues.push({ key: 'suppliers', title: 'صفوف بلا مورد مثبت', detail: `${formatNumber(missingSuppliers)} صفًا يحتاج ربط المورد.` });
    }
    if (domain === 'inventory' && (products === 0 || availableQty.rows === 0)) {
      qualityIssues.push({ key: 'inventory-fields', title: 'مدخلات مخزون ناقصة', detail: 'يلزم SKU/رصيد متاح حتى يصبح تحليل المخزون كاملًا.' });
    }
    if (domain === 'receivables' && outstanding.rows === 0) {
      qualityIssues.push({ key: 'receivables-fields', title: 'الرصيد المستحق غير مثبت', detail: 'لا يتم إنتاج إجمالي ذمم بديل عند غياب الحقل المستحق.' });
    }
    if (domain === 'payments' && debit.rows === 0 && credit.rows === 0 && outstanding.rows === 0) {
      qualityIssues.push({ key: 'payment-fields', title: 'حقول الحركة المالية غير مثبتة', detail: 'لا يوجد مدين/دائن/رصيد قابل للحساب من هذا المصدر.' });
    }
    if (domain === 'products' && products === 0) {
      qualityIssues.push({ key: 'product-fields', title: 'هوية الصنف غير مثبتة', detail: 'لا يوجد SKU أو اسم صنف قابل للاعتماد.' });
    }

    const domainSupported = sourceRows.length > 0;
    const profitability = (domain === 'sales' || domain === 'purchases' || domain === 'inventory') && salesAmount.rows > 0 && cost.rows > 0;
    const inventorySupported = products > 0 && (quantity.rows > 0 || availableQty.rows > 0);
    const receivablesSupported = outstanding.rows > 0;
    const liquiditySupported = domain === 'payments' && (debit.rows > 0 || credit.rows > 0 || outstanding.rows > 0);
    const customerSupported = customers > 0;
    const supplierSupported = suppliers > 0;

    const smartReports: SmartReport[] = [
      {
        title: `تقرير ${domainLabel(domain)}`,
        status: domainSupported ? (expectedComplete ? 'VERIFIED' : 'REVIEW') : 'INSUFFICIENT DATA',
        detail: domainSupported
          ? `المجال ${domainLabel(domain)} مبني مباشرة على canonical rows لهذا الاستيراد.`
          : 'لا توجد صفوف canonical قابلة للتقرير.',
      },
      {
        title: 'جودة الدليل والاستمرارية',
        status: expectedComplete ? 'VERIFIED' : 'REVIEW',
        detail: expectedComplete
          ? 'عدد الصفوف وحالة الاستيراد متطابقان مع الدليل الكانوني.'
          : 'يوجد فرق أو نقص في حالة الاستيراد، لذلك تبقى النتيجة REVIEW.',
      },
      {
        title: 'Customer Intelligence',
        status: customerSupported ? (missingCustomers ? 'REVIEW' : 'SUPPORTED') : 'INSUFFICIENT DATA',
        detail: customerSupported
          ? 'يعمل فقط على أسماء العملاء المثبتة في المصدر.'
          : 'لا توجد هوية عميل كافية.',
      },
      {
        title: 'Supplier Intelligence',
        status: supplierSupported ? (missingSuppliers ? 'REVIEW' : 'SUPPORTED') : 'INSUFFICIENT DATA',
        detail: supplierSupported
          ? 'يعمل على الموردين المسمّين داخل المصدر.'
          : 'لا توجد هوية مورد كافية.',
      },
      {
        title: 'Inventory / Demand Intelligence',
        status: inventorySupported ? (domain === 'inventory' && quantity.rows === 0 ? 'PARTIAL' : 'SUPPORTED') : 'INSUFFICIENT DATA',
        detail: inventorySupported
          ? 'يتوفر SKU مع كمية أو رصيد مخزون؛ التوقعات الزمنية لا تُخترع عند غياب الطلب.'
          : 'لا تتوفر هوية صنف وكمية كافية.',
      },
      {
        title: 'Receivables / Aging',
        status: receivablesSupported ? (domain === 'receivables' ? 'SUPPORTED' : 'PARTIAL') : 'INSUFFICIENT DATA',
        detail: receivablesSupported
          ? 'الرصيد المستحق مثبت؛ Aging الكامل يتطلب حقول أعمار/تواريخ مناسبة.'
          : 'لا يوجد رصيد مستحق قابل للاعتماد.',
      },
      {
        title: 'Profitability',
        status: profitability ? 'SUPPORTED' : 'INSUFFICIENT DATA',
        detail: profitability
          ? 'المبلغ والتكلفة متاحان، ويمكن اشتقاق الهامش من المصدر قبل أي تفسير AI.'
          : 'لا تتوفر تكلفة ومبلغ كافيان في نفس المصدر.',
      },
      {
        title: 'Liquidity / Cash',
        status: liquiditySupported ? 'SUPPORTED' : (domain === 'payments' ? 'REVIEW' : 'INSUFFICIENT DATA'),
        detail: liquiditySupported
          ? 'المدين/الدائن/الرصيد قابل للحساب من المصدر نفسه.'
          : 'لا توجد حركة مالية كافية لإنتاج قراءة سيولة.',
      },
      {
        title: 'Forecast',
        status: dates.length >= 30 && (salesAmount.rows || purchasesAmount.rows) > 0 ? 'REVIEW' : 'INSUFFICIENT DATA',
        detail: dates.length >= 30
          ? 'يوجد امتداد زمني للفحص، لكن التنبؤ النهائي يظل ضمن محرك forecast الكانوني.'
          : 'لا توجد نافذة زمنية كافية لإنتاج توقع تشغيلي.',
      },
      {
        title: 'Benchmark',
        status: 'INSUFFICIENT_SAMPLE',
        detail: 'لا توجد عينة peer مرتبطة بالمصدر؛ لا تُنتج مقارنة رقمية.',
      },
    ];

    return {
      domain,
      domainMetrics,
      smartReports,
      qualityIssues,
      dates,
      products,
      customers,
      suppliers,
      invoices,
      warehouses,
      salesAmount,
      purchasesAmount,
      outstanding,
      collected,
      debit,
      credit,
      quantity,
      incoming,
      outgoing,
      cost,
      price,
      stockValue,
      stockValueRows,
      missingDates,
      missingProducts,
      domainLabel: domainLabel(domain),
    };
  }, [context, importId, sourceRows, domain]);

  if (loading) return <LoadingState message="جارٍ بناء التقرير من الصفوف الكانونية لنفس المصدر..." />;
  if (error || !context) return <ErrorState message={error ?? 'REPORT_SOURCE_NOT_FOUND'} onRetry={() => window.location.reload()} />;

  const health = sourceHealth(context, sourceRows.length);
  const primaryDomainPath: Record<ReportDomain, string> = {
    sales: '/reports/sales',
    purchases: '/reports/purchases',
    receivables: '/reports/receivables',
    inventory: '/reports/inventory',
    payments: '/analytics/liquidity',
    customers: '/customers',
    suppliers: '/suppliers',
    products: '/products',
    'source-data': '/reports',
  };

  return (
    <div dir="rtl" className="report-page space-y-5 pb-10">
      <header className="overflow-hidden rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[.14em] text-primary-700">
              <FileText size={15} /> SOURCE-BOUND REPORT
            </div>
            <h1 className="mt-1.5 text-[24px] font-black text-ink-950 lg:text-[30px]">{sourceTitle(context)}</h1>
            <p className="mt-2 max-w-4xl text-[11px] leading-6 text-ink-500">
              تقرير ${analysis.domainLabel} مبني على canonical rows لنفس عملية الاستيراد، وليس على لقطة عامة من الشركة.
            </p>
          </div>
          <div className="text-left text-[10px] text-ink-500">
            <div>Import ID: <span className="font-mono">{importId}</span></div>
            <div>المجال: <span className="font-black">{analysis.domainLabel}</span></div>
            <div>الصفوف: {formatNumber(sourceRows.length)} / {formatNumber(Number(context.total_rows ?? sourceRows.length))}</div>
            <div>الحالة: <span className="font-black">{context.status ?? 'UNKNOWN'}</span></div>
            <div>Source hash: <span className="font-mono">{context.source_fingerprint ?? 'غير مثبت'}</span></div>
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {analysis.domainMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardBody>
              <div className="text-[10px] text-ink-400">{metric.label}</div>
              <div className="mt-1 text-xl font-black">{metric.value}</div>
              <div className="mt-1 text-[10px] text-ink-400">{metric.hint}</div>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="rounded-[18px] border border-primary-200 bg-primary-50/50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-0.5 text-primary-700" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[10px] font-black tracking-[.1em] text-primary-700">CANONICAL EVIDENCE</div>
              <StatusPill status={health} />
            </div>
            <div className="mt-1 text-sm font-black text-ink-950">
              {health === 'VERIFIED' ? 'السحب والاستمرارية مثبتان على المصدر نفسه.' : 'المصدر مسحوب لكن يحتاج مراجعة للاستمرارية أو الجودة.'}
            </div>
            <p className="mt-1 text-[11px] leading-5 text-ink-600">
              لا يوجد fallback إلى أرقام الشركة العامة؛ كل نتيجة في هذه الصفحة تبدأ من صفوف هذا import فقط.
            </p>
          </div>
        </div>
      </section>

      {analysis.qualityIssues.length > 0 && (
        <Card>
          <CardHeader title="فجوات الجودة والقرارات" subtitle="النقص يظهر كحالة مراجعة ولا يتحول إلى رقم مصطنع." />
          <CardBody>
            <div className="grid gap-3 md:grid-cols-2">
              {analysis.qualityIssues.map((issue) => (
                <div key={issue.key} className="rounded-xl border border-warning-200 bg-warning-50 p-3">
                  <div className="text-sm font-black text-warning-900">{issue.title}</div>
                  <div className="mt-1 text-[11px] leading-5 text-warning-900">{issue.detail}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="التقارير الذكية على نفس المصدر" subtitle="تخصصها وحالتها مشتقة من المجال والحقول الكانونية." />
          <CardBody>
            <div className="space-y-2">
              {analysis.smartReports.map((report) => (
                <div key={report.title} className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-black text-ink-900">{report.title}</div>
                    <div className="mt-1 text-[11px] leading-5 text-ink-500">{report.detail}</div>
                  </div>
                  <StatusPill status={report.status} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="تفاصيل المصدر" subtitle="ملخص الحقول التي تقود الحسابات الحالية." />
          <CardBody>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">أصناف</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.products)}</div></div>
              <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">عملاء</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.customers)}</div></div>
              <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">موردون</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.suppliers)}</div></div>
              <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">مخازن</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.warehouses)}</div></div>
            </div>
          </CardBody>
        </Card>
      </section>

      {analysis.domain === 'sales' && (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="ملخص حركة المبيعات" subtitle="أرقام ناتجة من نفس الصفوف المصدرية." />
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">الفواتير</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.invoices)}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">إجمالي المبيعات</div><div className="mt-1 text-xl font-black">{analysis.salesAmount.rows ? formatCurrency(analysis.salesAmount.sum) : 'غير متاح'}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">من</div><div className="mt-1 text-sm font-black">{analysis.dates[0] ?? 'غير متاح'}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">إلى</div><div className="mt-1 text-sm font-black">{analysis.dates.at(-1) ?? 'غير متاح'}</div></div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="إشارات العمل" subtitle="الخطوة التالية تبقى مرتبطة بما يثبت من المصدر." />
            <CardBody>
              <div className="space-y-2 text-[11px] leading-6 text-ink-600">
                <div>• العملاء المسمّون: {formatNumber(analysis.customers)}</div>
                <div>• الأصناف: {formatNumber(analysis.products)}</div>
                <div>• الذمم المصدرية المرشحة: {analysis.outstanding.rows ? formatCurrency(analysis.outstanding.sum) : 'غير متاح'}</div>
                <div>• Benchmark: INSUFFICIENT_SAMPLE</div>
              </div>
            </CardBody>
          </Card>
        </section>
      )}

      {analysis.domain === 'inventory' && (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="حقيقة المخزون" subtitle="الرصيد والقيمة المشتقة فقط عندما يتوفر السعر مع الكمية." />
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">الكمية المتاحة</div><div className="mt-1 text-xl font-black">{analysis.availableQty.rows ? formatNumber(analysis.availableQty.sum) : 'غير متاح'}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">قيمة مشتقة</div><div className="mt-1 text-xl font-black">{analysis.stockValueRows ? formatCurrency(analysis.stockValue) : 'غير متاح'}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">الوارد</div><div className="mt-1 text-xl font-black">{analysis.incoming.rows ? formatNumber(analysis.incoming.sum) : 'غير متاح'}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">المنصرف</div><div className="mt-1 text-xl font-black">{analysis.outgoing.rows ? formatNumber(analysis.outgoing.sum) : 'غير متاح'}</div></div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="إشارات المخزون" subtitle="لا تُنتج أيام تغطية عند غياب الطلب." />
            <CardBody>
              <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-[11px] leading-6 text-primary-900">
                الأصناف: {formatNumber(analysis.products)} · المخازن: {formatNumber(analysis.warehouses)} · الطلب الزمني غير مثبت هنا ما لم توجد حقول كمية مباعة وتاريخ.
              </div>
            </CardBody>
          </Card>
        </section>
      )}

      {analysis.domain === 'payments' && (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="حركة السيولة" subtitle="من المدين والدائن والرصيد المصدر." />
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">مدين</div><div className="mt-1 text-xl font-black">{analysis.debit.rows ? formatCurrency(analysis.debit.sum) : 'غير متاح'}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">دائن</div><div className="mt-1 text-xl font-black">{analysis.credit.rows ? formatCurrency(analysis.credit.sum) : 'غير متاح'}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">صافي الحركة</div><div className="mt-1 text-xl font-black">{analysis.debit.rows || analysis.credit.rows ? formatCurrency(analysis.credit.sum - analysis.debit.sum) : 'غير متاح'}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">الحركات المؤرخة</div><div className="mt-1 text-xl font-black">{formatNumber(sourceRows.length - analysis.missingDates)}</div></div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="سلامة القراءة" subtitle="لا يتم اشتقاق رصيد نهائي من صف ناقص." />
            <CardBody>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-[11px] leading-6 text-ink-700">
                أي نقص في المدين/الدائن/الرصيد يبقى ظاهرًا في الحالة ولم يتحول إلى صفر مصطنع.
              </div>
            </CardBody>
          </Card>
        </section>
      )}

      {analysis.domain === 'receivables' && (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="حقيقة الذمم" subtitle="المتبقي والتحصيل من المصدر مباشرة." />
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">المتبقي</div><div className="mt-1 text-xl font-black">{analysis.outstanding.rows ? formatCurrency(analysis.outstanding.sum) : 'غير متاح'}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">المحصل</div><div className="mt-1 text-xl font-black">{analysis.collected.rows ? formatCurrency(analysis.collected.sum) : 'غير متاح'}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">العملاء</div><div className="mt-1 text-xl font-black">{formatNumber(analysis.customers)}</div></div>
                <div className="rounded-xl border border-ink-100 p-3"><div className="text-[10px] text-ink-400">السجلات المؤرخة</div><div className="mt-1 text-xl font-black">{formatNumber(sourceRows.length - analysis.missingDates)}</div></div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Aging / أعمار الديون" subtitle="تظهر فقط حيث توجد أعمدة العمر/التاريخ في المصدر." />
            <CardBody>
              <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-[11px] leading-6 text-primary-900">
                ${sourceRows.some((row) => Object.keys(row).some((key) => key.startsWith('age_') || key.includes('عمر'))) ? 'توجد حقول أعمار مصدرية، ويمكن متابعة التقرير التفصيلي منها.' : 'لا توجد حقول أعمار كافية؛ الحالة تبقى INSUFFICIENT DATA.'}
              </div>
            </CardBody>
          </Card>
        </section>
      )}

      <Card>
        <CardHeader title="سجل الدليل ومسار التخصص" subtitle="تقرير المصدر → الحقيقة → القرار." />
        <CardBody>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">Import</div><div className="mt-1 font-black">{context.status ?? 'UNKNOWN'}</div></div>
            <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">Canonical</div><div className="mt-1 font-black">{formatNumber(sourceRows.length)} صف</div></div>
            <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">Evidence</div><div className="mt-1 font-black">{health}</div></div>
            <div className="rounded-xl bg-ink-50 p-3"><div className="text-[10px] text-ink-400">Benchmark</div><div className="mt-1 font-black">INSUFFICIENT_SAMPLE</div></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/trust" className="btn-secondary">فحص الدليل</Link>
            <Link to="/decision-experience" className="btn-primary">مساحة القرار</Link>
            <Link to={primaryDomainPath[analysis.domain]} className="btn-secondary">فتح التقرير المتخصص</Link>
            <Link to="/reports" className="btn-secondary">مركز التقارير</Link>
          </div>
        </CardBody>
      </Card>

      <section className="rounded-[18px] border border-ink-200 bg-ink-950 p-5 text-white">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-primary-300" />
          <h2 className="text-lg font-black">الخطوات القابلة للتنفيذ</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(analysis.qualityIssues.length
            ? analysis.qualityIssues
            : [{ key: 'none', title: 'لا توجد فجوة مصدرية مثبتة', detail: 'راجع Evidence قبل اعتماد أي قرار.' }]
          ).map((issue) => (
            <div key={issue.key} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-black">{issue.title}</div>
              <div className="mt-1 text-[11px] leading-5 text-ink-300">{issue.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-success-200 bg-success-50 p-4">
          <div className="flex items-center gap-2 text-success-900"><CheckCircle2 size={17} /><span className="font-black">الاستيراد</span></div>
          <div className="mt-2 text-[11px] leading-5 text-success-900">
            {formatNumber(Number(context.processed_rows ?? 0))} / {formatNumber(Number(context.total_rows ?? 0))} صف processed؛ invalid={formatNumber(Number(context.invalid_rows ?? 0))}؛ progress={formatNumber(Number(context.progress ?? 0))}%.
          </div>
        </div>
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
          <div className="flex items-center gap-2 text-primary-900"><TrendingUp size={17} /><span className="font-black">الذكاء</span></div>
          <div className="mt-2 text-[11px] leading-5 text-primary-900">
            جرى تقييم {analysis.smartReports.length} أسطح ذكية من نفس المصدر، وكل حالة غير مدعومة تبقى صريحة.
          </div>
        </div>
        <div className="rounded-xl border border-ink-200 bg-white p-4">
          <div className="flex items-center gap-2 text-ink-900"><Database size={17} /><span className="font-black">المصدر</span></div>
          <div className="mt-2 text-[11px] leading-5 text-ink-500">
            المصدر: {typeof context.result_summary?.file_name === 'string' ? context.result_summary.file_name : 'غير مثبت'} · المجال: {analysis.domainLabel}.
          </div>
        </div>
      </section>
    </div>
  );
}
