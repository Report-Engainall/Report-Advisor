import fs from 'node:fs';

const reportsPath = 'src/pages/ReportsPage.tsx';
const sourceSurfacePath = 'src/components/SourceBoundReportSurface.tsx';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}
function write(path, content) {
  fs.writeFileSync(path, content, 'utf8');
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let reports = read(reportsPath);
if (!reports.includes("CustomerReportSurface")) {
  const importNeedle = "import { ReportIntelligencePanel } from '@/components/ReportIntelligencePanel';";
  assert(reports.includes(importNeedle), 'ReportsPage intelligence import not found');
  reports = reports.replace(
    importNeedle,
    importNeedle + "\nimport { CustomerReportSurface } from '@/components/CustomerReportSurface';",
  );
}

const surfaceStart = reports.indexOf('function SourceBoundDomainSurface(');
const reportCardsStart = reports.indexOf('\nconst reportCards', surfaceStart);
assert(surfaceStart >= 0 && reportCardsStart > surfaceStart, 'SourceBoundDomainSurface block not found');

const compactDomainWrapper =
  "function SourceBoundDomainSurface({ report, expectedSpecialty, title }: { report: SmartReportDetail; expectedSpecialty: string; title: string }) {\n" +
  "  return <CustomerReportSurface report={report} expectedSpecialty={expectedSpecialty} title={title} />;\n" +
  "}\n";
reports = reports.slice(0, surfaceStart) + compactDomainWrapper + reports.slice(reportCardsStart + 1);

const smartHeaderOld = '<div className="truncate text-sm font-black text-ink-950" title={report.sourcePath}>{report.sourcePath}</div>';
assert(reports.includes(smartHeaderOld), 'Smart report card raw source title not found');
const smartHeaderNew =
  "<div className=\"truncate text-sm font-black text-ink-950\">" +
  "{report.specialty === 'sales' ? 'تقرير المبيعات' : report.specialty === 'purchases' ? 'تقرير المشتريات' : report.specialty === 'inventory' ? 'تقرير المخزون' : report.specialty === 'receivables' ? 'تقرير الذمم والتحصيل' : report.specialty === 'profitability' ? 'تقرير الربحية' : 'تقرير أعمال ذكي'}" +
  "</div>";
reports = reports.replace(smartHeaderOld, smartHeaderNew);

const modelOld =
  "const modelLabel = report.archetypeId\n" +
  "                ? report.archetypeId + (report.archetypeVersion ? ' · v' + report.archetypeVersion : '')\n" +
  "                : report.archetypeState === 'REVIEW_REQUIRED' ? 'يحتاج مراجعة النموذج' : 'النموذج غير متاح';";
assert(reports.includes(modelOld), 'Raw archetype label block not found');
const modelNew =
  "const modelLabel = report.archetypeState === 'SUPPORTED'\n" +
  "                ? 'نموذج أعمال معتمد'\n" +
  "                : report.archetypeState === 'REVIEW_REQUIRED'\n" +
  "                  ? 'مراجعة نموذج التقرير'\n" +
  "                  : 'تصنيف التقرير غير مكتمل';";
reports = reports.replace(modelOld, modelNew);

const stateMapOld = "{stage}: {state ?? '—'}";
assert(reports.includes(stateMapOld), 'Smart report raw state chip not found');
const stateMapNew =
  "{stage}: {state === 'VERIFIED' ? 'موثق' : state === 'APPROVED' ? 'معتمد' : state === 'COMPLETED' ? 'مكتمل' : state === 'PROPOSED' ? 'مقترح' : state === 'PENDING' || state === 'REVIEW_REQUIRED' ? 'مراجعة' : state === 'IN_PROGRESS' ? 'قيد التنفيذ' : state === 'OPEN' ? 'مفتوح' : 'غير متاح'}";
reports = reports.replace(stateMapOld, stateMapNew);

write(reportsPath, reports);

let sourceSurface = read(sourceSurfacePath);
const headerStart = sourceSurface.indexOf('function SourceHeader(');
const executiveStart = sourceSurface.indexOf('\nfunction ExecutiveMode', headerStart);
assert(headerStart >= 0 && executiveStart > headerStart, 'SourceHeader block not found');

const headerBlock =
  "function SourceHeader({ report }: { report: SmartReportDetail }) {\n" +
  "  const labels: Record<string, string> = { sales: 'المبيعات', purchases: 'المشتريات', inventory: 'المخزون', receivables: 'الذمم والتحصيل', profitability: 'الربحية' };\n" +
  "  const title = labels[report.specialty ?? ''] ? 'تقرير ' + labels[report.specialty ?? ''] : 'تقرير أعمال ذكي';\n" +
  "  return (\n" +
  "    <section className=\"relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0d1424] p-5 text-white shadow-[0_24px_70px_-36px_rgba(15,23,42,.9)]\">\n" +
  "      <div className=\"flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between\">\n" +
  "        <div>\n" +
  "          <div className=\"text-[9px] font-black tracking-[.16em] text-amber-200\">REPORT ADVISOR</div>\n" +
  "          <h1 className=\"mt-2 text-2xl font-black tracking-tight lg:text-3xl\">{title}</h1>\n" +
  "          <p className=\"mt-1 text-[11px] leading-6 text-slate-300\">هذا السطح يعرض معنى التقرير وقرار الأعمال، بينما تبقى تفاصيل الملف الخام داخل طبقة الدليل.</p>\n" +
  "          <div className=\"mt-3 flex flex-wrap gap-2 text-[10px] text-slate-300\">\n" +
  "            <span className=\"rounded-full border border-white/10 bg-white/5 px-3 py-1\">السجلات: {report.rowCount == null ? 'غير متاح' : formatNumber(report.rowCount)}</span>\n" +
  "            <span className=\"rounded-full border border-white/10 bg-white/5 px-3 py-1\">الجودة: {report.qualityScore == null ? 'غير متاح' : report.qualityScore + '%'}</span>\n" +
  "            <span className=\"rounded-full border border-white/10 bg-white/5 px-3 py-1\">الثقة: {stateLabel(report.trustState ?? report.sourceTrustState)}</span>\n" +
  "          </div>\n" +
  "        </div>\n" +
  "        <div className=\"flex flex-wrap gap-2\">\n" +
  "          <Link to={'/reports/smart/' + report.jobId + '?sourceHash=' + encodeURIComponent(report.sourceHash)} className=\"inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-black text-[#111827]\">التقرير الذكي <ArrowLeft size={13}/></Link>\n" +
  "          <Link to={'/decision-experience?stage=evidence&reportJobId=' + report.jobId + '&sourceHash=' + encodeURIComponent(report.sourceHash)} className=\"inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-white\">الدليل والقرار <ArrowLeft size={13}/></Link>\n" +
  "        </div>\n" +
  "      </div>\n" +
  "    </section>\n" +
  "  );\n" +
  "}\n";
sourceSurface = sourceSurface.slice(0, headerStart) + headerBlock + sourceSurface.slice(executiveStart + 1);
write(sourceSurfacePath, sourceSurface);

assert(!reports.includes('title={report.sourcePath}>{report.sourcePath}'), 'Raw source title remains in ReportsPage');
assert(!sourceSurface.includes('title={report.sourcePath}>{report.sourcePath}'), 'Raw source title remains in SourceBoundReportSurface');

console.log('customer report UI surgery applied successfully');

// current-head-bootstrap: run the customer-facing report surgery on the exact branch HEAD.
