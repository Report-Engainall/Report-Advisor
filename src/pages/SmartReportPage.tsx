import { CommercialValueChain } from '@/components/CommercialValueChain';\nimport { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileSearch, ShieldCheck, Search, Columns3, ArrowDownUp, Download, RotateCcw } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader } from '@/components/ui/States';
import { fetchSmartReport, type SmartReportDetail } from '@/lib/report-smart';
import { saveActiveReportContext } from '@/lib/report-context';
import { ReportIntelligencePanel } from '@/components/ReportIntelligencePanel';
import { SmartReportAdvisorySurface } from '@/components/SmartReportAdvisorySurface';
import { ReportDecisionCockpit } from '@/components/ReportDecisionCockpit';
import { formatNumber } from '@/lib/format';
import { downloadReportArtifact } from '@/lib/report-execution/download';

function textValue(value: unknown): string {
  if (value == null || value === '') return 'غير متاح';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function stateLabel(value: string | null): string {
  const labels: Record<string, string> = {
    TRUSTED: 'موثوق',
    REVIEW: 'مراجعة',
    BLOCKED: 'محظور',
    VERIFIED: 'موثق',
    ACCEPTED: 'مقبول',
    UNVERIFIED: 'غير موثق بعد',
    LEGACY_UNRESOLVED: 'تحقق تاريخي يحتاج إعادة إثبات',
    READY: 'جاهز للقرار',
    FULL_SOURCE: 'المصدر كامل',
    PARTIAL_FETCH_CEILING: 'تحليل جزئي — حد القراءة 50,000',
    PARTIAL_FETCH_ERROR: 'تحليل جزئي — تعذر قراءة جزء من المصدر',
    AWAITING_EVIDENCE_SNAPSHOT: 'بانتظار لقطة الدليل',
    AVAILABLE_FROM_CANONICAL_ANALYSIS: 'متاح من التحليل الكانوني',
    NOT_COMMITTED: 'غير معتمد',
    NO_DECISION_COMMITTED: 'لا قرار معتمد',
    NO_ACTION_COMMITTED: 'لا إجراء معتمد',
    NOT_AVAILABLE: 'غير متاح',
    INSUFFICIENT_SAMPLE: 'عينة غير كافية',
    PENDING_EVIDENCE: 'بانتظار الدليل',
    GAP_DETECTED: 'فجوة اعتماد مكتشفة',
    SIGNALS_PRESENT: 'إشارات مثبتة',
    NO_EXCEPTIONAL_SIGNALS: 'لا توجد إشارات استثنائية',
    REVIEW_REQUIRED: 'المراجعة مطلوبة',
  };
  return value ? (labels[value] ?? value) : 'غير متاح';
}

type SmartColumn = {
  name?: string;
  dataType?: string;
  nullCount?: number;
  mappingConfidence?: number;
  statistics?: { sum?: number; mean?: number; min?: number; max?: number; count?: number };
  mappedField?: string | null;
};

function numberValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeKey(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().normalize('NFKC').replace(/[\s_\-]+/g, '');
}

function formatMetric(value: number | null): string {
  return value == null ? 'غير متاح' : new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 2 }).format(value);
}

function dataKey(column: SmartColumn | null | undefined): string {
  return String(column?.mappedField ?? column?.name ?? '').trim();
}

function buildSmartAnalysis(report: SmartReportDetail | null) {
  const dataset = report?.sourceAnalysis?.datasets?.[0];
  const objectDataset = dataset && typeof dataset === 'object' ? dataset as Record<string, unknown> : null;
  const columns = Array.isArray(objectDataset?.columns)
    ? objectDataset.columns.filter((row): row is SmartColumn => Boolean(row) && typeof row === 'object')
    : [];
  const preview = Array.isArray(objectDataset?.preview)
    ? objectDataset.preview.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
    : [];
  const fullRows = (report?.canonicalRows ?? []).filter((row) => row && typeof row.data === 'object' && row.data !== null);

  const numeric = columns
    .map(column => ({ column, sum: numberValue(column.statistics?.sum), mean: numberValue(column.statistics?.mean) }))
    .filter(item => item.sum != null || item.mean != null);

  const completeness = report?.rowCount && columns.length
    ? Math.round(
        Math.max(0, 100 - (
          columns.reduce((sum, column) => sum + Math.min(report.rowCount ?? 0, Math.max(0, Number(column.nullCount ?? 0))), 0)
          / Math.max(1, (report.rowCount ?? 0) * columns.length)
        ) * 100)
      )
    : null;

  const findColumn = (...names: string[]) =>
    columns.find(column => {
      const key = normalizeKey(column.mappedField ?? column.name);
      return names.some(name => key.includes(normalizeKey(name)));
    });

  const amountColumn = findColumn('outstanding_balance', 'local_amount', 'total_amount', 'total', 'net_amount', 'amount', 'value');
  const age120Column = findColumn('age_over_120', 'over_120');
  const age30Column = findColumn('age_0_30', '0_30', 'age030');
  const paidColumn = findColumn('paid_amount', 'paid');
  const quantityColumn = findColumn('quantity', 'qty', 'stock', 'current_stock');
  const customerColumn = findColumn('customer_name', 'customer', 'client');
  const productColumn = findColumn('product_name', 'product', 'item', 'sku');

  const customerKey = dataKey(customerColumn);
  const productKey = dataKey(productColumn);
  const amountKey = dataKey(amountColumn);

  const topRows = fullRows
    .map(record => ({
      name: String(record.data[customerKey] ?? record.data[productKey] ?? record.data.name ?? record.data.sku ?? 'غير مسمى'),
      value: numberValue(
        record.data[amountKey] ??
        record.data.outstanding_balance ??
        record.data.local_amount ??
        record.data.total ??
        record.data.amount ??
        record.data.value ??
        record.data.price ??
        record.data['السعر']
      ),
    }))
    .filter(row => row.value != null)
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, 5);

  const metrics = [
    {
      label: report?.specialty === 'receivables' ? 'إجمالي الرصيد المستحق' : 'أهم قيمة مالية',
      value: formatMetric(amountColumn?.statistics?.sum == null ? null : Number(amountColumn.statistics.sum)),
      detail: amountColumn?.mappedField ?? amountColumn?.name ?? 'غير متاح',
    },
    {
      label: 'عدد الصفوف',
      value: formatMetric(report?.rowCount == null ? null : report.rowCount),
      detail: 'المصدر الكانوني',
    },
    {
      label: 'اكتمال البيانات',
      value: completeness == null ? 'غير متاح' : `${completeness}%`,
      detail: 'محسوب من القيم غير الفارغة',
    },
    {
      label: report?.specialty === 'receivables' ? 'أكثر من 120 يومًا' : 'مؤشر عددي رئيسي',
      value: formatMetric(age120Column?.statistics?.sum == null ? (numeric[0]?.sum ?? null) : Number(age120Column.statistics.sum)),
      detail: age120Column?.mappedField ?? age120Column?.name ?? (numeric[0]?.column.mappedField ?? numeric[0]?.column.name ?? 'غير متاح'),
    },
  ];

  if (report?.specialty === 'receivables' && age30Column) {
    metrics.push({
      label: '0–30 يومًا',
      value: formatMetric(numberValue(age30Column.statistics?.sum)),
      detail: age30Column.mappedField ?? age30Column.name ?? 'age_0_30',
    });
  } else if (report?.specialty === 'inventory' && quantityColumn) {
    metrics.push({
      label: 'الكمية',
      value: formatMetric(numberValue(quantityColumn.statistics?.sum)),
      detail: quantityColumn.mappedField ?? quantityColumn.name ?? 'quantity',
    });
  } else if (paidColumn) {
    metrics.push({
      label: 'المدفوع',
      value: formatMetric(numberValue(paidColumn.statistics?.sum)),
      detail: paidColumn.mappedField ?? paidColumn.name ?? 'paid_amount',
    });
  }

  return { columns, preview, numeric, completeness, metrics, topRows };
}

function reportVerificationLabel(value: string): string {
  if (value === 'VERIFIED') return 'Verified';
  if (value === 'GAP_DETECTED') return 'Gap Detected';
  return 'Pending Evidence';
}

function EvidenceInspector({ report }: { report: SmartReportDetail }) {
  const gap = report.canonicalCommitGap ?? 0;
  const verification = report.reportVerificationState;
  const verificationClass = verification === 'VERIFIED'
    ? 'border-indigo-200 bg-indigo-50 text-indigo-900'
    : verification === 'GAP_DETECTED'
      ? 'border-danger-200 bg-danger-50 text-danger-900'
      : 'border-warning-200 bg-warning-50 text-warning-900';
  return (
    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="section-kicker">EVIDENCE INSPECTOR</div>
          <h2 className="mt-1 text-lg font-black text-ink-950">سلسلة الثقة لهذا التقرير</h2>
          <p className="mt-1 text-xs leading-6 text-ink-500">Trusted Source لا تعني Verified Report. الاعتماد الكانوني دليل تغطية للبيانات، وليس قبولًا نهائيًا للدليل.</p>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black ${verificationClass}`}>{reportVerificationLabel(verification)}</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-ink-50 p-4"><div className="text-[9px] font-black text-ink-500">SOURCE</div><div className="mt-2 text-sm font-black">{report.sourcePath}</div><div className="mt-1 text-[10px] text-ink-500">Trust: {stateLabel(report.sourceTrustState ?? report.trustState)}</div></div>
        <div className="rounded-xl bg-ink-50 p-4"><div className="text-[9px] font-black text-ink-500">FINGERPRINT</div><div className="mt-2 break-all font-mono text-[10px]">{report.sourceHash}</div></div>
        <div className="rounded-xl bg-ink-50 p-4"><div className="text-[9px] font-black text-ink-500">CANONICAL COMMIT</div><div className="mt-2 text-sm font-black">{formatNumber(report.canonicalCommitCount)} / {report.authoritativeCurrentRowCount == null ? 'غير متاح' : formatNumber(report.authoritativeCurrentRowCount)}</div><div className="mt-1 text-[10px] text-ink-500">{gap > 0 ? `Gap: ${formatNumber(gap)}` : 'No canonical coverage gap'}</div></div>
        <div className="rounded-xl bg-ink-50 p-4"><div className="text-[9px] font-black text-ink-500">ANALYSIS</div><div className="mt-2 text-sm font-black">{report.sourceAnalysis?.analysisStatus ?? 'غير متاح'}</div><div className="mt-1 text-[10px] text-ink-500">{report.sourceAnalysis?.rowCount == null ? 'غير متاح' : formatNumber(report.sourceAnalysis.rowCount)} rows</div></div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-4">
          <div className="text-[9px] font-black text-ink-500">EVIDENCE PASSPORT</div>
          <div className="mt-2 text-sm font-black">{stateLabel(report.evidenceStatus)}</div>
          <div className="mt-1 text-[10px] text-ink-500">Acceptance: {stateLabel(String(report.renderedOutput.evidenceAcceptanceStatus ?? 'غير متاح'))} · Readiness: {stateLabel(String(report.renderedOutput.decisionReadiness ?? 'غير متاح'))}</div>
          <div className="mt-1 break-all font-mono text-[9px] text-ink-400">Snapshot: {String(report.renderedOutput.evidenceSnapshotId ?? 'غير موجود')}</div>
        </div>
        <div className={`rounded-xl border p-4 ${verificationClass}`}>
          <div className="text-[9px] font-black">VERIFICATION STATE</div>
          <div className="mt-2 text-sm font-black">{reportVerificationLabel(verification)}</div>
          <div className="mt-1 text-[10px]">Source trust: {stateLabel(report.sourceTrustState ?? report.trustState)} · Report verification: {reportVerificationLabel(verification)}</div>
          {report.renderedOutput.legacyPriorVerification === true ? <div className="mt-2 rounded-lg border border-warning-300 bg-warning-50 px-2 py-1 text-[9px] font-bold text-warning-900">حالة VERIFIED القديمة تم استبدالها بدليل Passport مستقل.</div> : null}
        </div>
      </div>
      <div className="mt-3 rounded-2xl border border-primary-200 bg-primary-50/45 p-4" aria-label="بوابة الدليل قبل القرار">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[9px] font-black tracking-[0.12em] text-primary-700">EVIDENCE GATE</div>
            <h3 className="mt-1 text-sm font-black text-ink-950">الاعتماد الكانوني والدليل النهائي مرحلتان منفصلتان</h3>
            <p className="mt-1 text-[10px] leading-5 text-ink-600">اكتمال Commit يثبت تغطية البيانات الكانونية فقط. لا تصبح النتيجة Verified إلا بعد وجود Evidence Snapshot صريح مرتبط بالمصدر.</p>
          </div>
          {verification !== 'VERIFIED' ? (
            <Link to="/trust" className="btn-secondary text-[10px]">فتح بوابة الأدلة <ArrowLeft size={12} /></Link>
          ) : null}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-3">
            <div className="text-[8px] font-black text-ink-400">CANONICAL COMMIT</div>
            <div className="mt-1 text-[10px] font-black text-ink-900">{gap > 0 ? `فجوة ${formatNumber(gap)} صف` : report.canonicalCommitVerified ? 'مغطى' : 'غير مثبت'}</div>
          </div>
          <div className="rounded-xl bg-white p-3">
            <div className="text-[8px] font-black text-ink-400">EVIDENCE SNAPSHOT</div>
            <div className="mt-1 text-[10px] font-black text-ink-900">{verification === 'VERIFIED' ? 'موجود ومثبت' : report.evidenceStatus === 'AWAITING_EVIDENCE_SNAPSHOT' ? 'بانتظار لقطة دليل' : stateLabel(report.evidenceStatus)}</div>
          </div>
          <div className="rounded-xl bg-white p-3">
            <div className="text-[8px] font-black text-ink-400">DECISION READINESS</div>
            <div className="mt-1 text-[10px] font-black text-ink-900">{verification === 'VERIFIED' ? 'الدليل متاح للمراجعة' : 'لا يوجد اعتماد دليلي نهائي بعد'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function statusTone(value: string | null): string {
  if (value === 'TRUSTED' || value === 'VERIFIED') return 'border-indigo-200 bg-indigo-50 text-indigo-900';
  if (value === 'REVIEW' || value === 'AWAITING_EVIDENCE_SNAPSHOT') return 'border-warning-200 bg-warning-50 text-warning-900';
  return 'border-ink-200 bg-ink-50 text-ink-700';
}


function SourceDataWorkspace({ report, initialSearch }: { report: SmartReportDetail; initialSearch?: string }) {
  const dataset = report.sourceAnalysis?.datasets?.[0];
  const objectDataset = dataset && typeof dataset === 'object' ? dataset as Record<string, unknown> : {};
  const definitionColumns = useMemo(() => {
    const raw = objectDataset.columns;
    return Array.isArray(raw)
      ? raw.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      : [];
  }, [dataset]);
  const rows = useMemo(() => report.canonicalRows.map((row) => row.data), [report.canonicalRows]);
  const discoveredColumns = useMemo(() => {
    const fromDefinition = definitionColumns.map((column) => String(column.name ?? '')).filter(Boolean);
    const fromRows = rows.slice(0, 200).flatMap((row) => Object.keys(row));
    return [...new Set([...fromDefinition, ...fromRows])];
  }, [definitionColumns, rows]);

  const numericColumns = useMemo(() => discoveredColumns.filter((column) => {
    const values = rows.slice(0, 200).map((row) => numberValue(row[column])).filter((value): value is number => value != null);
    return values.length >= 3;
  }), [discoveredColumns, rows]);

  const storageKey = 'aghbari.report-view.' + report.sourceHash;
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState(discoveredColumns[0] ?? '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(0);
  const [showColumns, setShowColumns] = useState(false);
  const [selectedRowNumber, setSelectedRowNumber] = useState<number | null>(null);
  const [groupColumn, setGroupColumn] = useState('');
  const [aggregateColumn, setAggregateColumn] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(discoveredColumns.slice(0, 8));

  useEffect(() => {
    if (initialSearch != null && initialSearch !== '') {
      setSearch(initialSearch);
      setPage(0);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (!discoveredColumns.length) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setSortColumn(discoveredColumns[0]);
        setVisibleColumns(discoveredColumns.slice(0, 8));
        return;
      }
      const saved = JSON.parse(raw) as Record<string, unknown>;
      const savedVisible = Array.isArray(saved.visibleColumns)
        ? saved.visibleColumns.map(String).filter((value) => discoveredColumns.includes(value))
        : [];
      const savedSort = typeof saved.sortColumn === 'string' && discoveredColumns.includes(saved.sortColumn)
        ? saved.sortColumn
        : discoveredColumns[0];
      setVisibleColumns(savedVisible.length ? savedVisible : discoveredColumns.slice(0, 8));
      setSortColumn(savedSort);
      setSortDirection(saved.sortDirection === 'desc' ? 'desc' : 'asc');
      setPageSize([25, 50, 100].includes(Number(saved.pageSize)) ? Number(saved.pageSize) : 50);
      setGroupColumn(typeof saved.groupColumn === 'string' && discoveredColumns.includes(saved.groupColumn) ? saved.groupColumn : '');
      setAggregateColumn(typeof saved.aggregateColumn === 'string' && numericColumns.includes(saved.aggregateColumn) ? saved.aggregateColumn : (numericColumns[0] ?? ''));
    } catch {
      setSortColumn(discoveredColumns[0]);
      setVisibleColumns(discoveredColumns.slice(0, 8));
    }
  }, [storageKey, discoveredColumns]);

  useEffect(() => {
    setSelectedRowNumber(null);
  }, [search, sortColumn, sortDirection, pageSize]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(needle)));
  }, [rows, search]);

  const orderedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    return [...filteredRows].sort((left, right) => {
      const a = left[sortColumn];
      const b = right[sortColumn];
      const an = numberValue(a);
      const bn = numberValue(b);
      const comparison = an != null && bn != null ? an - bn : String(a ?? '').localeCompare(String(b ?? ''), 'ar');
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  const groupedRows = useMemo(() => {
    if (!groupColumn || !aggregateColumn) return [];
    const groups = new Map<string, { key: string; count: number; sum: number }>();
    for (const row of filteredRows) {
      const key = String(row[groupColumn] ?? 'غير محدد').trim() || 'غير محدد';
      const value = numberValue(row[aggregateColumn]);
      const current = groups.get(key) ?? { key, count: 0, sum: 0 };
      current.count += 1;
      if (value != null) current.sum += value;
      groups.set(key, current);
    }
    return [...groups.values()].sort((a, b) => b.sum - a.sum).slice(0, 50);
  }, [filteredRows, groupColumn, aggregateColumn]);

  const pageCount = Math.max(1, Math.ceil(orderedRows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visibleRows = orderedRows.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const persistView = () => window.localStorage.setItem(storageKey, JSON.stringify({ visibleColumns, sortColumn, sortDirection, pageSize, groupColumn, aggregateColumn, savedAt: Date.now() }));
  const resetView = () => {
    setSearch('');
    setSortColumn(discoveredColumns[0] ?? '');
    setSortDirection('asc');
    setPageSize(50);
    setPage(0);
    setGroupColumn('');
    setAggregateColumn(numericColumns[0] ?? '');
    setVisibleColumns(discoveredColumns.slice(0, 8));
    window.localStorage.removeItem(storageKey);
  };
  const exportRows = () => {
    const body = orderedRows.map((row) => visibleColumns.map((column) => '"' + String(row[column] ?? '').replace(/"/g, '""') + '"').join(','));
    const csv = '\uFEFF' + [visibleColumns.map((value) => '"' + value.replace(/"/g, '""') + '"').join(','), ...body].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (report.sourcePath.replace(/\.[^.]+$/, '') || 'report') + '-view.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportXlsx = () => {
    downloadReportArtifact(
      report.sourceHash,
      report.sourcePath,
      visibleColumns,
      orderedRows.map((row) => visibleColumns.reduce<Record<string, unknown>>((result, column) => {
        result[column] = row[column] ?? '';
        return result;
      }, {})),
      'xlsx',
    );
  };

  return (
    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="section-kicker">REPORT WORKSPACE</div>
          <h2 className="mt-1 text-lg font-black text-ink-950">استكشاف البيانات الحقيقية</h2>
          <p className="mt-1 max-w-3xl text-[11px] leading-5 text-ink-500">البحث والفرز وإظهار الأعمدة والتصدير تعمل على الصفوف الكانونية لهذا التقرير، لا على معاينة منفصلة.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={persistView} className="btn-primary inline-flex items-center gap-2 text-[10px]">حفظ العرض <CheckCircle2 size={14}/></button>
          <button type="button" onClick={resetView} className="btn-secondary inline-flex items-center gap-2 text-[10px]">إعادة الضبط <RotateCcw size={14}/></button>
          <button type="button" onClick={exportRows} className="btn-secondary inline-flex items-center gap-2 text-[10px]">تصدير CSV <Download size={14}/></button>
          <button type="button" onClick={exportXlsx} className="btn-secondary inline-flex items-center gap-2 text-[10px]">تصدير XLSX <Download size={14}/></button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <span className="sr-only">البحث داخل التقرير</span>
          <Search size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"/>
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="ابحث داخل كل أعمدة التقرير..." className="min-h-11 w-full rounded-xl border border-ink-200 bg-ink-50/60 py-2 pr-9 pl-3 text-xs outline-none focus:border-primary-400 focus:bg-white" />
        </label>
        <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 text-[10px] font-bold text-ink-600">
          ترتيب
          <select value={sortColumn} onChange={(event) => { setSortColumn(event.target.value); setPage(0); }} className="bg-transparent outline-none">
            {discoveredColumns.map((column) => <option key={column} value={column}>{column}</option>)}
          </select>
          <button type="button" onClick={() => setSortDirection((value) => value === 'asc' ? 'desc' : 'asc')} aria-label="عكس اتجاه الترتيب" className="rounded-lg p-1 hover:bg-white"><ArrowDownUp size={14}/></button>
        </label>
        <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 text-[10px] font-bold text-ink-600">
          الصفوف
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} className="bg-transparent outline-none">
            {[25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 text-[10px] font-bold text-ink-600">
          تجميع
          <select value={groupColumn} onChange={(event) => setGroupColumn(event.target.value)} className="bg-transparent outline-none">
            <option value="">بدون تجميع</option>
            {discoveredColumns.map((column) => <option key={column} value={column}>{column}</option>)}
          </select>
        </label>
        {groupColumn && (
          <label className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 text-[10px] font-bold text-ink-600">
            التجميع المالي
            <select value={aggregateColumn} onChange={(event) => setAggregateColumn(event.target.value)} className="bg-transparent outline-none">
              {numericColumns.map((column) => <option key={column} value={column}>{column}</option>)}
            </select>
          </label>
        )}
        <button type="button" onClick={() => setShowColumns((value) => !value)} aria-expanded={showColumns} className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-[10px] font-bold text-ink-700 hover:bg-ink-50"><Columns3 size={14}/> الأعمدة ({visibleColumns.length}/{discoveredColumns.length})</button>
        <div className="mr-auto text-[10px] text-ink-500">{formatNumber(orderedRows.length)} صف مطابق · {formatNumber(rows.length)} صف كانونـي</div>
      </div>

      {groupColumn && (
        <section className="mt-3 rounded-xl border border-primary-200 bg-primary-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="section-kicker">GROUPED ANALYSIS</div>
              <div className="mt-1 text-sm font-black text-ink-950">ملخص التجميع الكانوني</div>
              <div className="mt-1 text-[10px] text-ink-600">التجميع يحسب من الصفوف المفلترة الحالية، وليس من المعاينة.</div>
            </div>
            <div className="text-[9px] text-primary-800">حتى 50 مجموعة معروضة</div>
          </div>
          <div className="mt-3 overflow-x-auto rounded-lg border border-primary-200 bg-white">
            {groupedRows.length ? (
              <table className="min-w-full text-right text-[10px]">
                <thead className="bg-primary-50"><tr><th className="px-3 py-2 font-black text-primary-900">المجموعة</th><th className="px-3 py-2 font-black text-primary-900">الصفوف</th><th className="px-3 py-2 font-black text-primary-900">المجموع</th></tr></thead>
                <tbody>{groupedRows.map((group) => <tr key={group.key} className="border-t border-primary-100"><td className="px-3 py-2 font-bold text-ink-900">{group.key}</td><td className="px-3 py-2 text-ink-600">{formatNumber(group.count)}</td><td className="px-3 py-2 font-black text-ink-900">{formatNumber(group.sum)}</td></tr>)}</tbody>
              </table>
            ) : <div className="p-5 text-center text-[10px] text-ink-500">لا توجد مجموعات قابلة للحساب بعد.</div>}
          </div>
        </section>
      )}

      {showColumns && (
        <div className="mt-3 rounded-xl border border-ink-200 bg-ink-50/70 p-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {discoveredColumns.map((column) => {
              const active = visibleColumns.includes(column);
              return <label key={column} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-ink-700"><input type="checkbox" checked={active} onChange={() => setVisibleColumns((current) => active ? current.filter((item) => item !== column) : [...current, column])}/><span className="min-w-0 truncate">{column}</span></label>;
            })}
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink-200">
        {visibleRows.length ? (
          <table className="min-w-full text-right text-[10px]">
            <thead className="bg-ink-50"><tr><th className="sticky right-0 bg-ink-50 px-3 py-2 text-ink-400">#</th>{visibleColumns.map((column) => <th key={column} className="whitespace-nowrap px-3 py-2 font-black text-ink-600">{column}</th>)}</tr></thead>
            <tbody>{visibleRows.map((row, index) => {
              const rowNumber = safePage * pageSize + index + 1;
              const active = selectedRowNumber === rowNumber;
              return <tr key={rowNumber} onClick={() => setSelectedRowNumber(rowNumber)} className={'cursor-pointer border-t border-ink-100 ' + (active ? 'bg-primary-50/60' : 'hover:bg-ink-50/70')} aria-selected={active}>
                <td className={'sticky right-0 px-3 py-2 font-mono ' + (active ? 'bg-primary-50/80 text-primary-700' : 'bg-white text-ink-400')}>{rowNumber}</td>
                {visibleColumns.map((column) => <td key={column} className="max-w-[280px] whitespace-nowrap px-3 py-2 text-ink-800">{textValue(row[column])}</td>)}
              </tr>;
            })}</tbody>
          </table>
        ) : <div className="p-8 text-center text-xs text-ink-500">لا توجد صفوف مطابقة لبحثك.</div>}
      </div>

      {selectedRowNumber != null && orderedRows[selectedRowNumber - 1] && (
        <aside className="mt-4 rounded-xl border border-primary-200 bg-primary-50/50 p-4" aria-label="تفاصيل الصف المحدد">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="section-kicker">ROW INSPECTOR</div>
              <div className="mt-1 text-sm font-black text-ink-950">تفاصيل الصف #{selectedRowNumber}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={'/trust?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-secondary text-[10px]">الأدلة</Link>
              <Link to={'/decision-experience?stage=evidence&reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-primary text-[10px]">مسار القرار</Link>
              <button type="button" onClick={() => setSelectedRowNumber(null)} className="btn-secondary text-[10px]">إغلاق</button>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(orderedRows[selectedRowNumber - 1]).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-ink-100 bg-white p-3">
                <div className="text-[9px] font-black text-ink-400">{key}</div>
                <div className="mt-1 break-words text-[11px] font-bold text-ink-800">{textValue(value)}</div>
              </div>
            ))}
          </div>
        </aside>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10px] text-ink-500">صفحة {safePage + 1} من {pageCount}</div>
        <div className="flex gap-2"><button type="button" disabled={safePage <= 0} onClick={() => setPage((value) => Math.max(0, value - 1))} className="btn-secondary text-[10px] disabled:opacity-40">السابق</button><button type="button" disabled={safePage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} className="btn-secondary text-[10px] disabled:opacity-40">التالي</button></div>
      </div>
    </section>
  );
}

export function SmartReportPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const [report, setReport] = useState<SmartReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void fetchSmartReport(jobId ?? '').then((next) => {
      if (active) {
        setReport(next);
        if (next) saveActiveReportContext({ jobId: next.jobId, sourceHash: next.sourceHash });
      }
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : String(reason));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [jobId]);

  const dataset = useMemo(() => {
    const first = report?.sourceAnalysis?.datasets?.[0];
    return first && typeof first === 'object' ? first as Record<string, unknown> : null;
  }, [report]);

  const previewRows = useMemo(() => {
    const preview = dataset?.preview;
    return Array.isArray(preview) ? preview.slice(0, 10).filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object') : [];
  }, [dataset]);

  const columns = useMemo(() => {
    const first = previewRows[0];
    return first ? Object.keys(first).slice(0, 8) : [];
  }, [previewRows]);

  const smartAnalysis = useMemo(() => buildSmartAnalysis(report), [report]);

  if (loading) return <div dir="rtl"><LoadingState message="جارٍ بناء التقرير الذكي من المصدر الحقيقي..." /></div>;
  if (error) return <div dir="rtl" className="space-y-5"><PageHeader title="التقرير الذكي" subtitle="تعذر قراءة نتيجة التقرير المربوطة بالمصدر." /><ErrorState message={error} onRetry={() => {
    setLoading(true);
    setError(null);
    void fetchSmartReport(jobId ?? '').then((next) => {
      setReport(next);
      if (next) saveActiveReportContext({ jobId: next.jobId, sourceHash: next.sourceHash });
    }).catch((reason) => setError(reason instanceof Error ? reason.message : String(reason))).finally(() => setLoading(false));
  }} /></div>;
  if (!report) return <div dir="rtl" className="space-y-5"><PageHeader title="التقرير الذكي" subtitle="التقرير المطلوب غير موجود أو غير مكتمل." /><div className="rounded-2xl border border-warning-200 bg-warning-50 p-5 text-sm text-warning-900">لا توجد مخرجات ذكية مثبتة لهذا التقرير.</div></div>;

  const output = report.renderedOutput;
  const outputs = Array.isArray(output.outputs) ? output.outputs.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
  const surfaceLinks = outputs.filter((item) => typeof item.path === 'string');
  const decisionKeys = ['recommendationStatus','decisionStatus','approvalStatus','actionStatus','outcomeStatus','learningStatus','benchmarkStatus','replayStatus'];
  const sourceIsVerified = report.reportVerificationState === 'VERIFIED';
  const businessSummary = report.specialty === 'receivables'
    ? 'هذا المصدر هو تقرير ذمم مدينة. تمت قراءة أرصدة العملاء وشرائح الأعمار من المصدر الكانوني؛ القرارات والتحصيل الفعلي لا تُنسب للمصدر ما لم توجد معاملة موثقة.'
    : report.specialty === 'inventory'
      ? 'هذا المصدر هو تقرير مخزون. المؤشرات المستخرجة تعكس الكميات والقيم التي ظهرت في المصدر، مع فصل البيانات الناقصة عن القيم المؤكدة.'
      : report.specialty === 'sales'
        ? 'هذا المصدر هو تقرير مبيعات. المؤشرات المستخرجة مرتبطة بالمصدر نفسه ولا تعني توقعًا أو نتيجة مستقبلية.'
        : report.specialty === 'purchases'
          ? 'هذا المصدر هو تقرير مشتريات. التحليل يعرض ما ثبت في المصدر، مع إبقاء أثر القرار والتنفيذ منفصلًا.'
          : 'هذا المصدر تم تحليله من بنيته وبياناته الفعلية، وتبقى المخرجات مربوطة بالمصدر دون اختلاق حقائق غير موجودة.';

  return <div dir="rtl" className="report-page ag-smart-report-surface space-y-5 animate-fade-in pb-10">
    <PageHeader
      title={report.sourcePath}
      subtitle="تقرير ذكي مربوط بالبصمة الأصلية، وليس نسخة تجريبية أو تقريرًا عامًا."
      actions={<div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            const url = window.location.origin + '/reports/smart/' + report.jobId + '?sourceHash=' + encodeURIComponent(report.sourceHash);
            void navigator.clipboard?.writeText(url).then(() => setCopied(true)).catch(() => setCopied(false));
          }}
          className="btn-secondary inline-flex items-center gap-2 text-xs"
        >
          {copied ? 'تم نسخ الرابط' : 'نسخ رابط التقرير'}
        </button>
        <Link to={'/work-center?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-secondary inline-flex items-center gap-2 text-xs">مركز العمل</Link>
        <Link to={'/replay?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-secondary inline-flex items-center gap-2 text-xs">Replay</Link>
        <Link to={'/benchmark?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-secondary inline-flex items-center gap-2 text-xs">Benchmark</Link>
        <Link to={'/decision-experience?stage=evidence&reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="btn-primary inline-flex items-center gap-2 text-xs">مسار القرار</Link>
        <Link to="/reports" className="btn-secondary inline-flex items-center gap-2 text-xs"><ArrowLeft size={14}/> مركز التقارير</Link>
      </div>}
    />

    <CommercialValueChain
      stages={[
        {
          label: 'المصدر',
          englishLabel: 'SOURCE',
          status: stateLabel(report.sourceTrustState ?? report.trustState),
          detail: report.sourcePath + ' · ' + formatNumber(report.rowCount ?? 0) + ' صف · ' + (report.sourceAnalysis?.sourceFormat ?? 'غير متاح'),
          tone: report.sourceTrustState === 'VERIFIED' || report.trustState === 'TRUSTED' ? 'trusted' : 'active',
        },
        {
          label: 'الدليل',
          englishLabel: 'EVIDENCE',
          status: report.reportVerificationState === 'VERIFIED' ? 'VERIFIED' : report.reportVerificationState === 'GAP_DETECTED' ? 'REVIEW' : 'PENDING',
          detail: 'لقطة الدليل والاعتماد الكانوني منفصلان عن مجرد قراءة المصدر.',
          href: '/decision-experience?stage=evidence&reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash),
          tone: report.reportVerificationState === 'VERIFIED' ? 'trusted' : 'attention',
        },
        {
          label: 'الإشارات',
          englishLabel: 'SIGNALS',
          status: report.intelligence.signals.length ? report.intelligence.signals.length + ' مثبتة' : 'لا توجد',
          detail: report.intelligence.signals[0]?.title ?? 'لا توجد إشارة استثنائية مثبتة في المصدر الحالي.',
          tone: report.intelligence.signals.length ? 'active' : 'neutral',
        },
        {
          label: 'المستشار',
          englishLabel: 'ADVISOR',
          status: report.intelligence.recommendations.length ? report.intelligence.recommendations.length + ' توصية' : 'غير متاح',
          detail: report.intelligence.advisorBrief.recommendedAction ?? report.intelligence.guidance.focus ?? 'لا توجد توصية مصدرية كافية حاليًا.',
          tone: report.intelligence.recommendations.length ? 'active' : 'neutral',
          href: '#smart-report-intelligence',
        },
        {
          label: 'القرار',
          englishLabel: 'DECISION',
          status: stateLabel(output.decisionStatus == null ? null : String(output.decisionStatus)),
          detail: 'القرار المعتمد لا يُستنتج تلقائيًا من التوصية؛ يبقى منفصلًا وقابلًا للتدقيق.',
          href: '/decision-experience?stage=decision&reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash),
          tone: output.decisionStatus === 'APPROVED' || output.decisionStatus === 'COMMITTED' ? 'trusted' : 'attention',
        },
        {
          label: 'التنفيذ',
          englishLabel: 'WORK',
          status: stateLabel(output.actionStatus == null ? null : String(output.actionStatus)),
          detail: 'مركز العمل هو طبقة التنفيذ؛ لا نخلط بين توصية ذكية وتنفيذ فعلي.',
          href: '/work-center?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash),
          tone: output.actionStatus === 'COMPLETED' || output.actionStatus === 'IN_PROGRESS' ? 'active' : 'neutral',
        },
        {
          label: 'النتيجة',
          englishLabel: 'OUTCOME',
          status: stateLabel(output.outcomeStatus == null ? null : String(output.outcomeStatus)),
          detail: output.actualImpact == null ? 'لم تُسجل نتيجة فعلية بعد.' : 'الأثر الفعلي: ' + formatMetric(numberValue(output.actualImpact)),
          href: '/replay?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash),
          tone: output.outcomeStatus === 'OBSERVED' || output.outcomeStatus === 'COMPLETED' ? 'trusted' : 'neutral',
        },
        {
          label: 'التعلم',
          englishLabel: 'LEARNING',
          status: stateLabel(output.learningStatus == null ? null : String(output.learningStatus)),
          detail: 'يظهر هنا فقط ما تم رصده وتثبيته بعد التنفيذ؛ لا تُصنع نتيجة مستقبلية.',
          href: '/benchmark?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash),
          tone: output.learningStatus === 'OBSERVED' || output.learningStatus === 'READY' ? 'trusted' : 'neutral',
        },
      ]}
    />

    <ReportDecisionCockpit report={report}/>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-[linear-gradient(145deg,#111827,#1e293b)] p-4 text-white shadow-[0_16px_40px_-28px_rgba(15,23,42,.7)]"><div className="text-[9px] font-black tracking-[.12em] text-primary-200">TRUST</div><div className="mt-2 text-xl font-black">{stateLabel(report.trustState)}</div><div className="mt-1 text-[10px] text-ink-300">جودة: {report.qualityScore == null ? 'غير متاح' : report.qualityScore + '%'}</div></div>
        <div className="rounded-2xl bg-ink-50 p-4"><div className="text-[9px] font-black tracking-[.12em] text-ink-500">SOURCE</div><div className="mt-2 font-black text-ink-950">{report.sourceHash.slice(0, 24)}…</div><div className="mt-1 text-[10px] text-ink-500">نوع الملف: {report.sourceAnalysis?.sourceFormat ?? 'غير متاح'}</div></div>
        <div className="rounded-2xl bg-ink-50 p-4"><div className="text-[9px] font-black tracking-[.12em] text-ink-500">ROWS</div><div className="mt-2 text-xl font-black text-ink-950">{report.rowCount == null ? 'غير متاح' : formatNumber(report.rowCount)}</div><div className="mt-1 text-[10px] text-ink-500">المعتمد: {report.authoritativeCurrentRowCount == null ? 'غير متاح' : formatNumber(report.authoritativeCurrentRowCount)} · النطاق: {report.canonicalAnalysisScope === 'PARTIAL_FETCH_CEILING' ? 'تحليل جزئي / حد 50,000' : 'المصدر كامل'}</div></div>
        <div className="rounded-2xl bg-ink-50 p-4"><div className="text-[9px] font-black tracking-[.12em] text-ink-500">SPECIALTY</div><div className="mt-2 text-xl font-black text-ink-950">{report.specialty ?? 'عام'}</div><div className="mt-1 text-[10px] text-ink-500">التخصص يظهر فقط عند توفر دليل كافٍ من المصدر.</div></div>
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
        <div className="section-kicker">EXECUTIVE BRIEF</div>
        <h2 className="mt-1 text-xl font-black text-ink-950">ماذا يقول هذا التقرير فعليًا؟</h2>
        <p className="mt-3 text-sm leading-7 text-ink-600">{businessSummary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
          <span className="rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 font-bold">التخصص: {report.specialty ?? 'عام'}</span>
          <span className="rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 font-bold">الصفوف: {formatNumber(report.rowCount ?? 0)}</span>
          <span className={'badge ' + (sourceIsVerified ? 'badge-success' : 'badge-warning')}>{sourceIsVerified ? 'التقرير موثق' : report.reportVerificationState === 'GAP_DETECTED' ? 'فجوة اعتماد' : 'بانتظار الدليل'}</span>
        </div>
      </div>
      <div className="rounded-[18px] border border-ink-200 bg-ink-950 p-5 text-white shadow-card lg:p-6">
        <div className="section-kicker text-primary-200">NEXT ACTION</div>
        <h2 className="mt-1 text-lg font-black">ما الذي يمكن فعله الآن؟</h2>
        <p className="mt-3 text-[12px] leading-6 text-ink-300">
          {report.renderedOutput.actionStatus === 'NO_ACTION_COMMITTED' ? 'لا توجد عملية تنفيذية موثقة نُفذت بعد؛ يمكن استخدام التقرير كمدخل لمراجعة القرار.' : stateLabel(String(report.renderedOutput.actionStatus ?? null))}
        </p>
        <Link to="/decision-experience?stage=evidence" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-black text-ink-950">افتح مسار القرار الموثق ←</Link>
      </div>
    </section>

    <EvidenceInspector report={report}/>
    {report.runtimeWarnings?.length ? (
      <section className="rounded-2xl border border-warning-200 bg-warning-50 p-4 text-warning-900" aria-label="تحذيرات التشغيل">
        <div className="text-[9px] font-black tracking-[.12em]">RUNTIME READBACK</div>
        <div className="mt-1 text-sm font-black">التقرير استمر رغم وجود أجزاء تعذر قراءتها</div>
        <div className="mt-2 space-y-1">
          {report.runtimeWarnings.map((warning) => <div key={warning} className="text-[10px] leading-5">• {warning}</div>)}
        </div>
      </section>
    ) : null}

    {report.canonicalAnalysisScope === 'PARTIAL_FETCH_CEILING' ? (
      <section className="rounded-2xl border border-warning-200 bg-warning-50 p-4 text-warning-900" aria-label="حد نطاق التحليل">
        <div className="text-[9px] font-black tracking-[.12em]">ANALYSIS SCOPE</div>
        <div className="mt-1 text-sm font-black">التحليل هنا جزئي؛ المصدر يتجاوز حد القراءة المباشرة 50,000 صف.</div>
        <div className="mt-1 text-[10px] leading-5">المخرجات المعروضة لا تمثل كامل المصدر. يجب الاعتماد على تجميعات خادمية موثقة قبل أي قرار شامل.</div>
      </section>
    ) : null}

    <ReportIntelligencePanel report={report} />
    <SmartReportAdvisorySurface report={report} />

    <SourceDataWorkspace report={report} initialSearch={searchParams.get('focus') ?? ''}/>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="section-kicker">REAL BUSINESS METRICS</div>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-black text-ink-950">مؤشرات مستخرجة من هذا المصدر</h2>
        <span className="text-[10px] text-ink-500">{smartAnalysis.columns.length} أعمدة · {smartAnalysis.numeric.length} مؤشرات رقمية</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {smartAnalysis.metrics.map(metric => (
          <div key={metric.label} className="rounded-2xl border border-ink-100 bg-ink-50 p-4">
            <div className="text-[10px] font-bold text-ink-500">{metric.label}</div>
            <div className="mt-2 text-xl font-black text-ink-950">{metric.value}</div>
            <div className="mt-1 truncate text-[9px] text-ink-400">{metric.detail}</div>
          </div>
        ))}
      </div>
    </section>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-primary-600"/><div><div className="section-kicker">TRUTH → EVIDENCE → SIGNAL → INTELLIGENCE</div><h2 className="mt-1 text-lg font-black text-ink-950">حالة التقرير الذكي</h2></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {(['evidenceStatus','signalStatus','intelligenceStatus'] as const).map((key) => {
          const value = key === 'evidenceStatus' ? (report.evidenceStatus == null ? null : String(report.evidenceStatus)) : (output[key] == null ? null : String(output[key]));
          return <div key={key} className={'rounded-xl border p-4 ' + statusTone(value)}><div className="text-[10px] font-black">{key}</div><div className="mt-2 text-sm font-bold">{stateLabel(value)}</div></div>;
        })}
      </div>
    </section>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-center gap-2"><FileSearch size={18} className="text-primary-600"/><div><div className="section-kicker">DECISION → ACTION → OUTCOME → LEARNING → BENCHMARK</div><h2 className="mt-1 text-lg font-black">ما الذي ثبت وما الذي لم يُثبت</h2></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {decisionKeys.map((key) => <div key={key} className="rounded-xl border border-ink-100 bg-ink-50/70 p-4"><div className="text-[10px] font-black text-ink-500">{key}</div><div className="mt-2 text-sm font-bold text-ink-900">{stateLabel(output[key] == null ? null : String(output[key]))}</div></div>)}
      </div>
    </section>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-primary-600"/><div><div className="section-kicker">RENDERED SURFACES</div><h2 className="mt-1 text-lg font-black">الأسطح التي أنشأها مسار التقرير</h2></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {surfaceLinks.map((surface, index) => <Link key={String(surface.key ?? index)} to={String(surface.path) + '?reportJobId=' + encodeURIComponent(report.jobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className="rounded-xl border border-ink-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-sm">
          <div className="text-[9px] font-black tracking-[.12em] text-primary-700">{String(surface.stage ?? 'OUTPUT')}</div>
          <div className="mt-2 text-sm font-black text-ink-950">{String(surface.label ?? surface.key ?? 'سطح')}</div>
          <div className="mt-2 text-[10px] text-ink-500">sourceBound={String(surface.sourceBound)} · hash={String(surface.sourceHash).slice(0, 14)}…</div>
        </Link>)}
      </div>
    </section>

    {smartAnalysis.topRows.length > 0 && (
      <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
        <div className="section-kicker">{report.specialty === 'receivables' ? 'TOP EXPOSURES' : 'TOP SOURCE ITEMS'}</div>
        <h2 className="mt-1 text-lg font-black">أعلى البنود الظاهرة في العينة</h2>
        <div className="mt-4 grid gap-2">
          {smartAnalysis.topRows.map((row, index) => (
            <div key={row.name + index} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-ink-50 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-black">{index + 1}</span>
                <span className="truncate text-xs font-bold text-ink-900">{row.name}</span>
              </div>
              <span className="shrink-0 text-xs font-black text-ink-950">{formatMetric(row.value)}</span>
            </div>
          ))}
        </div>
      </section>
    )}

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-center justify-between gap-3"><div><div className="section-kicker">CANONICAL SOURCE</div><h2 className="mt-1 text-lg font-black">عينة فعلية من التقرير</h2></div><div className="text-[10px] text-ink-500">{formatNumber(previewRows.length)} صفوف معروضة من العينة</div></div>
      {previewRows.length === 0 ? <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-900">لا توجد عينة صفوف في لقطة التحليل؛ لا يتم اختلاقها.</div> : <div className="mt-4 overflow-x-auto rounded-xl border border-ink-200"><table className="min-w-full text-right text-[11px]"><thead className="bg-ink-50"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-3 py-2 font-black text-ink-600">{column}</th>)}</tr></thead><tbody>{previewRows.map((row, index) => <tr key={index} className="border-t border-ink-100">{columns.map((column) => <td key={column} className="max-w-[240px] truncate whitespace-nowrap px-3 py-2 text-ink-800">{textValue(row[column])}</td>)}</tr>)}</tbody></table></div>}
    </section>

    <section className="rounded-[18px] border border-ink-200 bg-white p-5 shadow-card lg:p-6">
      <div className="text-[9px] font-black tracking-[.12em] text-ink-500">PROVENANCE</div>
      <dl className="mt-3 grid gap-3 text-[11px] sm:grid-cols-2">
        <div><dt className="font-bold text-ink-500">Job</dt><dd className="mt-1 break-all font-mono text-ink-900">{report.jobId}</dd></div>
        <div><dt className="font-bold text-ink-500">Import</dt><dd className="mt-1 break-all font-mono text-ink-900">{report.importId ?? 'غير متاح'}</dd></div>
        <div><dt className="font-bold text-ink-500">Source hash</dt><dd className="mt-1 break-all font-mono text-ink-900">{report.sourceHash}</dd></div>
        <div><dt className="font-bold text-ink-500">Analysis snapshot</dt><dd className="mt-1 break-all font-mono text-ink-900">{report.sourceAnalysis?.id ?? 'غير متاح'}</dd></div>
      </dl>
    </section>
  </div>;
}