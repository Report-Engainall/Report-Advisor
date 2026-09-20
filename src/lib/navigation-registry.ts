export type NavigationSectionId =
  | 'today'
  | 'operations'
  | 'money'
  | 'customers-products'
  | 'intelligence'
  | 'reports'
  | 'admin';

export type NavigationIconKey =
  | 'dashboard'
  | 'command-center'
  | 'decision'
  | 'intelligence'
  | 'work-center'
  | 'import'
  | 'document'
  | 'quality'
  | 'connections'
  | 'money'
  | 'purchases'
  | 'receivables'
  | 'profitability'
  | 'customers'
  | 'products'
  | 'inventory'
  | 'alternatives'
  | 'recommendations'
  | 'forecasts'
  | 'scenarios'
  | 'rfm'
  | 'abc'
  | 'aging'
  | 'metrics'
  | 'executive-report'
  | 'reports'
  | 'inventory-report'
  | 'inventory-intelligence'
  | 'demand'
  | 'analytics'
  | 'onboarding'
  | 'settings'
  | 'profile'
  | 'proposal';

export interface NavigationItem {
  section: NavigationSectionId;
  path: string;
  label: string;
  enLabel: string;
  description: string;
  keywords: string[];
  icon: NavigationIconKey;
}

export interface NavigationSection {
  id: NavigationSectionId;
  title: string;
  enTitle: string;
  items: NavigationItem[];
}

export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    id: 'today',
    title: 'اليوم',
    enTitle: 'Today',
    items: [
      { section: 'today', path: '/', label: 'لوحة اليوم', enLabel: 'Today', description: 'النظرة التنفيذية الرئيسية', keywords: ['dashboard', 'home', 'لوحة', 'رئيسية'], icon: 'dashboard' },
      { section: 'today', path: '/command-center', label: 'مركز القيادة', enLabel: 'Command Center', description: 'الأولويات والقرارات العاجلة', keywords: ['command', 'decision', 'قيادة', 'قرارات'], icon: 'command-center' },
      { section: 'today', path: '/decision-experience', label: 'قرار اليوم', enLabel: 'Today’s Decision', description: 'الدليل والموافقة والتنفيذ والنتيجة', keywords: ['decision experience', 'evidence', 'approval', 'قرار', 'دليل', 'موافقة'], icon: 'decision' },
      { section: 'today', path: '/intelligence', label: 'الانتباه والذكاء', enLabel: 'Attention & Intelligence', description: 'التوصيات والتنبؤات والسيناريوهات', keywords: ['ai', 'intelligence', 'forecast', 'سيناريو', 'تنبؤ'], icon: 'intelligence' },
    ],
  },
  {
    id: 'operations',
    title: 'التشغيل',
    enTitle: 'Operations',
    items: [
      { section: 'operations', path: '/work-center', label: 'مركز العمل', enLabel: 'Work Center', description: 'متابعة دورة الاستيراد وحالة العمل', keywords: ['work center', 'operations', 'jobs', 'عمليات', 'تشغيل'], icon: 'work-center' },
      { section: 'operations', path: '/import', label: 'الاستيراد', enLabel: 'Import', description: 'رفع ومعاينة واعتماد الملفات', keywords: ['import', 'upload', 'excel', 'csv', 'pdf', 'استيراد', 'رفع'], icon: 'import' },
      { section: 'operations', path: '/import/analyze', label: 'تحليل المستندات', enLabel: 'Document Analysis', description: 'استخراج وإثبات الملفات الخارجية', keywords: ['document analysis', 'file analysis', 'تحليل المستندات', 'ملفات'], icon: 'document' },
      { section: 'operations', path: '/data-quality', label: 'جودة البيانات', enLabel: 'Data Quality', description: 'الفجوات والأخطاء والتغطية', keywords: ['quality', 'dq', 'جودة', 'بيانات'], icon: 'quality' },
      { section: 'operations', path: '/connections', label: 'المصادر', enLabel: 'Sources', description: 'مصادر البيانات والاتصالات وحالتها', keywords: ['connections', 'sources', 'integrations', 'مصادر', 'اتصالات'], icon: 'connections' },
    ],
  },
  {
    id: 'money',
    title: 'المال',
    enTitle: 'Money',
    items: [
      { section: 'money', path: '/reports/sales', label: 'المبيعات', enLabel: 'Sales', description: 'مبيعات الفترة وقراءة الأداء', keywords: ['sales', 'مبيعات', 'تقرير مبيعات'], icon: 'money' },
      { section: 'money', path: '/reports/purchases', label: 'المشتريات', enLabel: 'Purchases', description: 'المشتريات والحركة الشرائية', keywords: ['purchases', 'مشتريات', 'تقرير مشتريات'], icon: 'purchases' },
      { section: 'money', path: '/reports/receivables', label: 'الذمم والتحصيل', enLabel: 'Receivables', description: 'التحصيل والأعمار والذمم المدينة', keywords: ['receivables', 'aging', 'collection', 'ذمم', 'تحصيل', 'أعمار'], icon: 'receivables' },
      { section: 'money', path: '/reports/profitability', label: 'الربحية', enLabel: 'Profitability', description: 'الإيراد والتكلفة والهامش', keywords: ['profitability', 'margin', 'profit', 'ربحية', 'هامش', 'ربح'], icon: 'profitability' },
    ],
  },
  {
    id: 'customers-products',
    title: 'العملاء والمنتجات',
    enTitle: 'Customers & Products',
    items: [
      { section: 'customers-products', path: '/customers', label: 'العملاء', enLabel: 'Customers', description: 'إدارة وتحليل العملاء', keywords: ['customers', 'clients', 'عملاء'], icon: 'customers' },
      { section: 'customers-products', path: '/products', label: 'المنتجات', enLabel: 'Products', description: 'المنتجات والأصناف', keywords: ['products', 'sku', 'منتجات', 'أصناف'], icon: 'products' },
      { section: 'customers-products', path: '/inventory', label: 'المخزون', enLabel: 'Inventory', description: 'المخزون والحركة', keywords: ['inventory', 'stock', 'مخزون'], icon: 'inventory' },
      { section: 'customers-products', path: '/alternative-groups', label: 'البدائل', enLabel: 'Alternatives', description: 'ربط الأصناف البديلة ضمن مجموعات قابلة للإدارة', keywords: ['alternative groups', 'substitutes', 'بدائل', 'مجموعات'], icon: 'alternatives' },
    ],
  },
  {
    id: 'intelligence',
    title: 'القرار والذكاء',
    enTitle: 'Decision & Intelligence',
    items: [
      { section: 'intelligence', path: '/intelligence/recommendations', label: 'التوصيات', enLabel: 'Recommendations', description: 'مراجعة التوصيات والإجراءات المقترحة', keywords: ['recommendations', 'actions', 'توصيات', 'إجراءات'], icon: 'recommendations' },
      { section: 'intelligence', path: '/intelligence/forecasts', label: 'التنبؤات', enLabel: 'Forecasts', description: 'استعراض التنبؤات المتاحة من المصدر', keywords: ['forecasts', 'forecast', 'تنبؤات', 'توقعات'], icon: 'forecasts' },
      { section: 'intelligence', path: '/intelligence/scenarios', label: 'السيناريوهات', enLabel: 'Scenarios', description: 'حراسة حقائق السيناريو قبل القرار', keywords: ['scenarios', 'scenario truth', 'سيناريوهات'], icon: 'scenarios' },
      { section: 'intelligence', path: '/analytics/rfm', label: 'RFM', enLabel: 'RFM', description: 'تقسيم العملاء حسب القيمة والسلوك', keywords: ['rfm', 'عملاء', 'قيمة'], icon: 'rfm' },
      { section: 'intelligence', path: '/analytics/abc', label: 'ABC', enLabel: 'ABC', description: 'تصنيف المنتجات حسب الأهمية', keywords: ['abc', 'منتجات', 'أهمية'], icon: 'abc' },
      { section: 'intelligence', path: '/analytics/aging', label: 'الأعمار', enLabel: 'Aging', description: 'تحليل أعمار المستحقات', keywords: ['aging', 'ذمم', 'أعمار'], icon: 'aging' },
      { section: 'intelligence', path: '/metrics', label: 'تفسير المقاييس', enLabel: 'Metric Inspector', description: 'هوية المؤشر وسياق الحساب والمصدر', keywords: ['metrics', 'metric inspector', 'kpi', 'مؤشرات', 'مفتش'], icon: 'metrics' },
    ],
  },
  {
    id: 'reports',
    title: 'التقارير',
    enTitle: 'Reports',
    items: [
      { section: 'reports', path: '/reports/executive', label: 'التقرير التنفيذي', enLabel: 'Executive Report', description: 'قصة الأداء والقرارات للإدارة', keywords: ['executive report', 'board', 'management', 'تقرير تنفيذي', 'إدارة'], icon: 'executive-report' },
      { section: 'reports', path: '/reports', label: 'مركز التقارير', enLabel: 'Reports Center', description: 'مركز التقارير والتصدير', keywords: ['reports', 'report', 'تقارير'], icon: 'reports' },
      { section: 'reports', path: '/reports/inventory', label: 'تقرير المخزون', enLabel: 'Inventory Report', description: 'حالة المخزون والتقييم', keywords: ['inventory report', 'مخزون', 'تقرير مخزون'], icon: 'inventory-report' },
      { section: 'reports', path: '/reports/inventory-intelligence', label: 'ذكاء المخزون', enLabel: 'Inventory Intelligence', description: 'القيمة وإعادة الطلب ونقاط النقص', keywords: ['inventory intelligence', 'stock', 'مخزون', 'إعادة الطلب'], icon: 'inventory-intelligence' },
      { section: 'reports', path: '/reports/demand-velocity', label: 'الطلب والحركة', enLabel: 'Demand & Velocity', description: 'حركة الطلب والاتجاهات والسرعة', keywords: ['demand velocity', 'demand', 'velocity', 'طلب', 'سرعة'], icon: 'demand' },
      { section: 'reports', path: '/analytics', label: 'مساحة التحليلات', enLabel: 'Analytics', description: 'RFM وABC والأعمار والتحليلات', keywords: ['analytics', 'rfm', 'abc', 'aging', 'تحليلات'], icon: 'analytics' },
    ],
  },
  {
    id: 'admin',
    title: 'الإدارة',
    enTitle: 'Administration',
    items: [
      { section: 'admin', path: '/onboarding', label: 'تجهيز الشركة', enLabel: 'Company Setup', description: 'تجهيز الشركة ومسار البدء', keywords: ['onboarding', 'setup', 'company setup', 'بدء', 'تهيئة', 'شركة'], icon: 'onboarding' },
      { section: 'admin', path: '/settings', label: 'إعدادات الشركة', enLabel: 'Company Settings', description: 'إعدادات النظام والشركة', keywords: ['settings', 'config', 'إعدادات'], icon: 'settings' },
      { section: 'admin', path: '/settings/profile', label: 'ملفي', enLabel: 'Profile', description: 'اسم العرض والهوية داخل التطبيق', keywords: ['profile', 'account', 'ملف شخصي', 'حساب'], icon: 'profile' },
      { section: 'admin', path: '/proposal-demo', label: 'العرض التقديمي', enLabel: 'Proposal Demo', description: 'مطابقة متطلبات الوظائف مع قدرات المنتج الحقيقية', keywords: ['upwork', 'proposal', 'job fit', 'demo', 'proposal demo', 'وظيفة', 'عرض', 'ديمو'], icon: 'proposal' },
    ],
  },
];

export const NAVIGATION_ITEMS = NAVIGATION_SECTIONS.flatMap(section => section.items);

export function resolveNavigationItem(path: string): NavigationItem | null {
  return [...NAVIGATION_ITEMS]
    .sort((a, b) => b.path.length - a.path.length)
    .find(item => path === item.path || (item.path !== '/' && path.startsWith(item.path + '/'))) ?? null;
}
