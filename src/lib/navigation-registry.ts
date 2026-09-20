export type WorkspaceVisibilityMode = 'essential' | 'advanced' | 'expert';

export type NavigationSectionId =
  | 'today'
  | 'money'
  | 'decisions'
  | 'trust'
  | 'intelligence'
  | 'outputs'
  | 'reference'
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
  minimumWorkspaceMode?: WorkspaceVisibilityMode;
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
      { section: 'today', path: '/command-center', label: 'مركز القيادة', enLabel: 'Command Center', description: 'الأولويات التي تستحق انتباه الإدارة الآن', keywords: ['command', 'decision', 'قيادة', 'قرارات'], icon: 'command-center' },
    ],
  },
  {
    id: 'decisions',
    title: 'القرارات',
    enTitle: 'Decisions',
    items: [
      { section: 'decisions', path: '/decision-experience', label: 'قرار اليوم', enLabel: 'Today’s Decision', description: 'الدليل والموافقة والتنفيذ والنتيجة', keywords: ['decision', 'evidence', 'approval', 'قرار', 'دليل', 'موافقة'], icon: 'decision' },
    ],
  },
  {
    id: 'trust',
    title: 'الثقة والأدلة',
    enTitle: 'Trust & Evidence',
    items: [
      { section: 'trust', path: '/work-center', label: 'مركز العمل', enLabel: 'Work Center', description: 'متابعة دورة الاستيراد وحالة العمل', keywords: ['work center', 'operations', 'jobs', 'عمليات', 'تشغيل'], icon: 'work-center' },
      { section: 'trust', path: '/import', label: 'الاستيراد', enLabel: 'Import', description: 'رفع ومعاينة واعتماد الملفات', keywords: ['import', 'upload', 'excel', 'csv', 'pdf', 'استيراد', 'رفع'], icon: 'import' },
      { section: 'trust', path: '/import/analyze', label: 'تحليل المستندات', enLabel: 'Document Analysis', description: 'استخراج وإثبات الملفات الخارجية', keywords: ['document analysis', 'file analysis', 'تحليل المستندات', 'ملفات'], icon: 'document' },
      { section: 'trust', path: '/data-quality', label: 'جودة البيانات', enLabel: 'Data Quality', description: 'الفجوات والأخطاء والتغطية', keywords: ['quality', 'dq', 'جودة', 'بيانات'], icon: 'quality' },
      { section: 'trust', path: '/connections', label: 'المصادر', enLabel: 'Sources', description: 'مصادر البيانات والاتصالات وحالتها', keywords: ['connections', 'sources', 'integrations', 'مصادر', 'اتصالات'], icon: 'connections' },
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
      { section: 'money', path: '/reports/profitability', label: 'الربحية', enLabel: 'Profitability', description: 'الإيراد والتكلفة والهامش', keywords: ['profitability', 'margin', 'profit', 'ربحية', 'هامش', 'ربح'], icon: 'profitability', minimumWorkspaceMode: 'advanced' },
    ],
  },
  {
    id: 'reference',
    title: 'المرجع',
    enTitle: 'Reference',
    items: [
      { section: 'reference', path: '/customers', label: 'العملاء', enLabel: 'Customers', description: 'إدارة وتحليل العملاء', keywords: ['customers', 'clients', 'عملاء'], icon: 'customers' },
      { section: 'reference', path: '/products', label: 'المنتجات', enLabel: 'Products', description: 'المنتجات والأصناف', keywords: ['products', 'sku', 'منتجات', 'أصناف'], icon: 'products' },
      { section: 'reference', path: '/inventory', label: 'المخزون', enLabel: 'Inventory', description: 'المخزون والحركة', keywords: ['inventory', 'stock', 'مخزون'], icon: 'inventory' },
      { section: 'reference', path: '/alternative-groups', label: 'البدائل', enLabel: 'Alternatives', description: 'ربط الأصناف البديلة ضمن مجموعات قابلة للإدارة', keywords: ['alternative groups', 'substitutes', 'بدائل', 'مجموعات'], icon: 'alternatives', minimumWorkspaceMode: 'advanced' },
    ],
  },
  {
    id: 'intelligence',
    title: 'الذكاء',
    enTitle: 'Intelligence',
    items: [
      { section: 'intelligence', path: '/intelligence', label: 'الذكاء والانتباه', enLabel: 'Intelligence', description: 'الإشارات والصورة الذكية من المصدر الكانوني', keywords: ['ai', 'intelligence', 'ذكاء', 'انتباه'], icon: 'intelligence', minimumWorkspaceMode: 'advanced' },
      { section: 'intelligence', path: '/intelligence/recommendations', label: 'التوصيات', enLabel: 'Recommendations', description: 'مراجعة التوصيات والإجراءات المقترحة', keywords: ['recommendations', 'actions', 'توصيات', 'إجراءات'], icon: 'recommendations', minimumWorkspaceMode: 'advanced' },
      { section: 'intelligence', path: '/intelligence/forecasts', label: 'التنبؤات', enLabel: 'Forecasts', description: 'استعراض التنبؤات المتاحة من المصدر', keywords: ['forecasts', 'forecast', 'تنبؤات', 'توقعات'], icon: 'forecasts', minimumWorkspaceMode: 'advanced' },
      { section: 'intelligence', path: '/intelligence/scenarios', label: 'السيناريوهات', enLabel: 'Scenarios', description: 'حراسة حقائق السيناريو قبل القرار', keywords: ['scenarios', 'scenario truth', 'سيناريوهات'], icon: 'scenarios', minimumWorkspaceMode: 'advanced' },
      { section: 'intelligence', path: '/analytics/rfm', label: 'RFM', enLabel: 'RFM', description: 'تقسيم العملاء حسب القيمة والسلوك', keywords: ['rfm', 'عملاء', 'قيمة'], icon: 'rfm', minimumWorkspaceMode: 'advanced' },
      { section: 'intelligence', path: '/analytics/abc', label: 'ABC', enLabel: 'ABC', description: 'تصنيف المنتجات حسب الأهمية', keywords: ['abc', 'منتجات', 'أهمية'], icon: 'abc', minimumWorkspaceMode: 'advanced' },
      { section: 'intelligence', path: '/analytics/aging', label: 'الأعمار', enLabel: 'Aging', description: 'تحليل أعمار المستحقات', keywords: ['aging', 'ذمم', 'أعمار'], icon: 'aging', minimumWorkspaceMode: 'advanced' },
      { section: 'intelligence', path: '/metrics', label: 'تفسير المقاييس', enLabel: 'Metric Inspector', description: 'هوية المؤشر وسياق الحساب والمصدر', keywords: ['metrics', 'metric inspector', 'kpi', 'مؤشرات', 'مفتش'], icon: 'metrics', minimumWorkspaceMode: 'advanced' },
    ],
  },
  {
    id: 'outputs',
    title: 'المخرجات',
    enTitle: 'Outputs',
    items: [
      { section: 'outputs', path: '/reports/executive', label: 'التقرير التنفيذي', enLabel: 'Executive Report', description: 'قصة الأداء والقرارات للإدارة', keywords: ['executive report', 'board', 'management', 'تقرير تنفيذي', 'إدارة'], icon: 'executive-report' },
      { section: 'outputs', path: '/reports', label: 'مركز التقارير', enLabel: 'Reports Center', description: 'مركز التقارير والتصدير', keywords: ['reports', 'report', 'تقارير'], icon: 'reports' },
      { section: 'outputs', path: '/reports/inventory', label: 'تقرير المخزون', enLabel: 'Inventory Report', description: 'حالة المخزون والتقييم', keywords: ['inventory report', 'مخزون', 'تقرير مخزون'], icon: 'inventory-report' },
      { section: 'outputs', path: '/reports/inventory-intelligence', label: 'ذكاء المخزون', enLabel: 'Inventory Intelligence', description: 'القيمة وإعادة الطلب ونقاط النقص', keywords: ['inventory intelligence', 'stock', 'مخزون', 'إعادة الطلب'], icon: 'inventory-intelligence', minimumWorkspaceMode: 'advanced' },
      { section: 'outputs', path: '/reports/demand-velocity', label: 'الطلب والحركة', enLabel: 'Demand & Velocity', description: 'حركة الطلب والاتجاهات والسرعة', keywords: ['demand velocity', 'demand', 'velocity', 'طلب', 'سرعة'], icon: 'demand', minimumWorkspaceMode: 'advanced' },
      { section: 'outputs', path: '/analytics', label: 'مساحة التحليلات', enLabel: 'Analytics', description: 'RFM وABC والأعمار والتحليلات', keywords: ['analytics', 'rfm', 'abc', 'aging', 'تحليلات'], icon: 'analytics', minimumWorkspaceMode: 'advanced' },
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
      { section: 'admin', path: '/proposal-demo', label: 'العرض التقديمي', enLabel: 'Proposal Demo', description: 'مطابقة متطلبات الوظائف مع قدرات المنتج الحقيقية', keywords: ['upwork', 'proposal', 'job fit', 'demo', 'proposal demo', 'وظيفة', 'عرض', 'ديمو'], icon: 'proposal', minimumWorkspaceMode: 'expert' },
    ],
  },
];

export const NAVIGATION_ITEMS = NAVIGATION_SECTIONS.flatMap(section => section.items);

export function resolveNavigationItem(path: string): NavigationItem | null {
  return [...NAVIGATION_ITEMS]
    .sort((a, b) => b.path.length - a.path.length)
    .find(item => path === item.path || (item.path !== '/' && path.startsWith(item.path + '/'))) ?? null;
}
