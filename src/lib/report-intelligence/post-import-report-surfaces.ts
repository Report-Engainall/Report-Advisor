import type { ReportType } from './report-type-detector';
import type { ReportDomain, IntelligenceNode } from '../import-pipeline/report-dependency-graph';

export interface PostImportReportSurface {
  key: 'executive' | 'domain' | 'evidence' | 'decision' | 'work' | 'outcome' | 'benchmark';
  title: string;
  detail: string;
  path: string;
  available: boolean;
}

const DOMAIN_BY_REPORT_TYPE: Partial<Record<ReportType, ReportDomain>> = {
  inventory: 'inventory',
  sales: 'sales',
  purchases: 'purchases',
  customerBalances: 'customers',
  supplierBalances: 'suppliers',
  stockMovement: 'inventory',
};

const DOMAIN_LABEL: Record<ReportDomain, string> = {
  inventory: 'المخزون',
  sales: 'المبيعات',
  purchases: 'المشتريات',
  customers: 'العملاء والذمم',
  suppliers: 'الموردون',
  finance: 'المالية والسيولة',
  transfers: 'التحويلات',
  adjustments: 'التسويات',
};

const DOMAIN_PATH: Record<ReportDomain, string> = {
  inventory: '/reports/inventory',
  sales: '/reports/sales',
  purchases: '/reports/purchases',
  customers: '/reports/receivables',
  suppliers: '/suppliers',
  finance: '/analytics/liquidity',
  transfers: '/reports/inventory-intelligence',
  adjustments: '/reports/inventory-intelligence',
};

export function reportTypeDomain(reportType: ReportType): ReportDomain | null {
  return DOMAIN_BY_REPORT_TYPE[reportType] ?? null;
}

export function buildPostImportReportSurfaces(
  reportType: ReportType,
  importId: string,
  impactedNodes: IntelligenceNode[] = [],
): PostImportReportSurface[] {
  const query = importId ? `?import=${encodeURIComponent(importId)}` : '';
  const domain = reportTypeDomain(reportType);
  const domainLabel = domain ? DOMAIN_LABEL[domain] : 'التقرير المتخصص';
  const domainPath = importId
    ? `/reports/import/${encodeURIComponent(importId)}`
    : domain ? `${DOMAIN_PATH[domain]}${query}` : '/reports';

  return [
    {
      key: 'executive',
      title: 'التقرير التنفيذي',
      detail: 'السطح الجامع للمخرجات القابلة للإثبات من المصدر المستورد.',
      path: `/reports/executive${query}`,
      available: true,
    },
    {
      key: 'domain',
      title: domain ? `تقرير ${domainLabel}` : 'التقرير المتخصص',
      detail: domain
        ? `المسار المتخصص المكتشف للمصدر؛ العقد المتأثرة: ${impactedNodes.length}.`
        : 'لم يصل المصنف إلى تخصص قانوني يسمح بربط تقرير مجال دون تخمين.',
      path: domainPath,
      available: Boolean(domain),
    },
    {
      key: 'evidence',
      title: 'الدليل والثقة',
      detail: 'ارجع إلى مصدر الحقيقة والبصمة وحالة الدليل قبل اعتماد أي استنتاج.',
      path: `/trust${query}`,
      available: true,
    },
    {
      key: 'decision',
      title: 'مساحة القرار',
      detail: 'ينتقل المصدر إلى سلسلة القرار فقط حيث توجد إشارة وأدلة كافية.',
      path: `/decision-experience${query}&stage=decision`.replace('?&', '?'),
      available: true,
    },
    {
      key: 'work',
      title: 'مركز العمل',
      detail: 'حالة العامل والعمليات المرتبطة بالاستيراد والتنفيذ القابل للاستئناف.',
      path: `/work-center${query}`,
      available: true,
    },
    {
      key: 'outcome',
      title: 'النتيجة والتعلّم',
      detail: 'النتيجة لا تُعرض كحقيقة حتى يوجد سجل تنفيذ فعلي؛ المسار الحالي يظل fail-closed.',
      path: `/decision-experience${query}&stage=outcome`.replace('?&', '?'),
      available: true,
    },
    {
      key: 'benchmark',
      title: 'Benchmark',
      detail: 'المقارنة لا تُعرض بلا عينة peer ودليل كافٍ؛ عند الغياب تبقى INSUFFICIENT_SAMPLE.',
      path: `/trust${query}#benchmark`,
      available: true,
    },
  ];
}

export function buildPostImportReportSummary(reportType: ReportType, confidence: number): string {
  if (reportType === 'unknown') {
    return 'المصدر قُرئ واعتمد، لكن لا يوجد تخصص كافٍ لربطه بتقرير مجال دون تخمين. استخدم الدليل والمراجعة أولًا.';
  }
  return `تم التعرف على التخصص ${reportType} بثقة ${Math.round(confidence * 100)}%، ويمكن متابعة المخرجات الكانونية المرتبطة به.`;
}
