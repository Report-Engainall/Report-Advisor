import type { ReportType } from './report-type-detector';

export interface RelatedReportSurface {
  key: string;
  title: string;
  detail: string;
  path: string;
  category: 'report' | 'intelligence' | 'operations';
}

const RELATED: Partial<Record<ReportType, RelatedReportSurface[]>> = {
  sales: [
    ['sales','تقرير المبيعات','الفواتير والعملاء والمنتجات','/reports/sales','report'],
    ['executive','التقرير التنفيذي','الملخص التنفيذي والاستثناءات','/reports/executive','report'],
    ['receivables','الذمم والتحصيل','الأرصدة وأعمار الاستحقاق','/reports/receivables','report'],
    ['profitability','الربحية','الربح والهامش حيث توجد تكلفة مثبتة','/reports/profitability','report'],
    ['demand','سرعة الطلب','الاتجاه والحركة التاريخية','/reports/demand-velocity','intelligence'],
    ['rfm','تحليل العملاء RFM','تقسيم العملاء من السلوك المتاح','/analytics/rfm','intelligence'],
    ['abc','تحليل ABC','تركيز القيمة والأصناف','/analytics/abc','intelligence'],
    ['recommendations','التوصيات','إجراءات مشروطة بالدليل','/intelligence/recommendations','intelligence'],
    ['customers','ملفات العملاء','السطح الإداري للعملاء','/customers','operations'],
  ],
  purchases: [
    ['purchases','تقرير المشتريات','الفواتير والموردون','/reports/purchases','report'],
    ['executive','التقرير التنفيذي','الملخص والاستثناءات','/reports/executive','report'],
    ['inventory','تقرير المخزون','الرصيد والتقييم','/reports/inventory','report'],
    ['inventory-intelligence','ذكاء المخزون','الحركة والتغطية والمخاطر','/reports/inventory-intelligence','intelligence'],
    ['liquidity','السيولة','الأثر المالي المثبت','/analytics/liquidity','intelligence'],
    ['recommendations','التوصيات','إجراءات مشروطة بالدليل','/intelligence/recommendations','intelligence'],
    ['suppliers','ملفات الموردين','السطح الإداري للموردين','/suppliers','operations'],
  ],
  inventory: [
    ['inventory','تقرير المخزون','الكمية والتكلفة والقيمة','/reports/inventory','report'],
    ['inventory-intelligence','ذكاء المخزون','الحركة والتغطية والمخاطر','/reports/inventory-intelligence','intelligence'],
    ['demand','سرعة الطلب','الحركة والطلب التاريخي','/reports/demand-velocity','intelligence'],
    ['abc','تحليل ABC','تركيز القيمة والأصناف','/analytics/abc','intelligence'],
    ['recommendations','التوصيات','إجراءات مخزون مشروطة بالدليل','/intelligence/recommendations','intelligence'],
    ['products','ملفات المنتجات','السطح الإداري للأصناف','/products','operations'],
    ['alternatives','مجموعات البدائل','علاقات البدائل للأصناف','/alternative-groups','operations'],
  ],
  customerBalances: [
    ['receivables','الذمم والتحصيل','الأرصدة وأعمار الاستحقاق','/reports/receivables','report'],
    ['executive','التقرير التنفيذي','الملخص والاستثناءات المالية','/reports/executive','report'],
    ['aging','تحليل الأعمار','أعمار الذمم حيث تكفي التواريخ','/analytics/aging','intelligence'],
    ['rfm','تحليل العملاء RFM','السلوك الشرائي المتاح','/analytics/rfm','intelligence'],
    ['recommendations','التوصيات','إجراءات تحصيل مشروطة بالدليل','/intelligence/recommendations','intelligence'],
    ['customers','ملفات العملاء','السطح الإداري للعملاء','/customers','operations'],
  ],
  supplierBalances: [
    ['suppliers','ملفات الموردين','البيانات والحركة المرتبطة','/suppliers','operations'],
    ['purchases','تقرير المشتريات','فواتير الشراء والتدفقات الداخلة','/reports/purchases','report'],
    ['executive','التقرير التنفيذي','الملخص والاستثناءات','/reports/executive','report'],
    ['liquidity','السيولة','الأثر المالي حيث تدعمه البيانات','/analytics/liquidity','intelligence'],
    ['recommendations','التوصيات','إجراءات الموردين المشروطة بالدليل','/intelligence/recommendations','intelligence'],
  ],
  stockMovement: [
    ['inventory','تقرير المخزون','الرصيد والتقييم','/reports/inventory','report'],
    ['inventory-intelligence','ذكاء المخزون','الحركة والتغطية والمخاطر','/reports/inventory-intelligence','intelligence'],
    ['demand','سرعة الطلب','العلاقة بين الحركة والطلب','/reports/demand-velocity','intelligence'],
    ['abc','تحليل ABC','تركيز القيمة والأصناف','/analytics/abc','intelligence'],
    ['products','ملفات المنتجات','السطح الإداري للأصناف','/products','operations'],
    ['recommendations','التوصيات','إجراءات تشغيلية مشروطة بالدليل','/intelligence/recommendations','intelligence'],
  ],
};

export function buildRelatedReportSurfaces(reportType: ReportType, importId: string): RelatedReportSurface[] {
  const query = importId ? `?import=${encodeURIComponent(importId)}` : '';
  return (RELATED[reportType] ?? []).map(([key, title, detail, path, category]) => ({
    key,
    title,
    detail,
    path: `${path}${query}`,
    category,
  }));
}
