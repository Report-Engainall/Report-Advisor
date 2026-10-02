import { matchCanonicalField, type CanonicalField } from './canonical-schema.ts';

export type ArchetypeStatus = 'ACTIVE' | 'CANDIDATE' | 'DEPRECATED';
export type AvailabilityStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'INSUFFICIENT_SAMPLE';

export type IntelligenceCapability = {
  capabilityId: string;
  label: string;
  requiredFields: CanonicalField[];
  minSample: number;
  status: AvailabilityStatus;
  missingFields: CanonicalField[];
};

export type ArchetypeRule = {
  ruleId: string;
  metric: string;
  minSample: number;
  timeWindow: string | null;
  rationale: string;
  limitations: string[];
};

export type ArchetypeProfile = {
  archetypeId: string;
  version: number;
  profileVersion: string;
  status: ArchetypeStatus;
  legacyReportType: 'inventory' | 'sales' | 'purchases' | 'customerBalances' | 'supplierBalances' | 'stockMovement' | 'unknown';
  titleAliases: string[];
  headerAliases: string[];
  inputShape: string;
  requiredFields: CanonicalField[];
  optionalFields: CanonicalField[];
  conflictingFields: CanonicalField[];
  grain: string;
  timeFields: CanonicalField[];
  entityFields: CanonicalField[];
  measureFields: CanonicalField[];
  rules: ArchetypeRule[];
  limitations: string[];
  capabilities: IntelligenceCapability[];
  minSample: number;
  confidenceThreshold: number;
};

export type ArchetypeResolution = {
  archetypeId: string;
  profileVersion: number;
  legacyReportType: ArchetypeProfile['legacyReportType'];
  matchReason: string[];
  matchedFields: CanonicalField[];
  missingRequiredFields: CanonicalField[];
  conflicts: CanonicalField[];
  confidence: number;
  reviewRequired: boolean;
  limitations: string[];
};

type ArchetypeProfileDefinition = Omit<ArchetypeProfile, 'profileVersion'>;

const PROFILES: readonly ArchetypeProfileDefinition[] = [
  {
    archetypeId: 'inventory.balance',
    version: 1,
    status: 'ACTIVE',
    legacyReportType: 'inventory',
    titleAliases: ['inventory', 'stock', 'مخزون', 'المخزون', 'أرصدة المخزون'],
    headerAliases: ['productCode', 'productName', 'currentStock', 'warehouse'],
    inputShape: 'item-level inventory balance',
    requiredFields: ['productCode', 'currentStock'],
    optionalFields: ['productName', 'unit', 'warehouse', 'openingBalance', 'inbound', 'outbound', 'cost'],
    conflictingFields: [],
    grain: 'product',
    timeFields: [],
    entityFields: ['productCode', 'productName', 'warehouse'],
    measureFields: ['currentStock', 'openingBalance', 'inbound', 'outbound', 'cost'],
    rules: [
      { ruleId: 'inventory.balance.coverage.v1', metric: 'stock_coverage', minSample: 12, timeWindow: null, rationale: 'لا تعرض تغطية المخزون إلا عند وجود مدخلات طلب يومي صالحة.', limitations: ['بدون طلب يومي لا يمكن حساب التغطية.'] },
    ],
    limitations: ['قيمة المخزون والربحية تتطلب cost.', 'مقارنة المستودعات تتطلب warehouse.'],
    capabilities: [
      { capabilityId: 'inventory.stock-position', label: 'وضع المخزون الحالي', requiredFields: ['productCode', 'currentStock'], minSample: 1, status: 'AVAILABLE', missingFields: [] },
      { capabilityId: 'inventory.valuation', label: 'تقييم المخزون', requiredFields: ['productCode', 'currentStock', 'cost'], minSample: 12, status: 'AVAILABLE', missingFields: [] },
    ],
    minSample: 1,
    confidenceThreshold: 0.5,
  },
  {
    archetypeId: 'sales.transaction-detail',
    version: 1,
    status: 'ACTIVE',
    legacyReportType: 'sales',
    titleAliases: ['sales', 'sale', 'invoice', 'المبيعات', 'فواتير المبيعات'],
    headerAliases: ['productCode', 'quantity', 'netAmount', 'customerCode', 'documentDate'],
    inputShape: 'sales transaction rows',
    requiredFields: ['productCode', 'quantity'],
    optionalFields: ['productName', 'customerName', 'customerCode', 'warehouse', 'documentNo', 'documentDate', 'unitPrice', 'grossAmount', 'discount', 'netAmount', 'cost', 'profit', 'currency', 'dueDate'],
    conflictingFields: [],
    grain: 'transaction-line',
    timeFields: ['documentDate'],
    entityFields: ['productCode', 'productName', 'customerCode', 'customerName'],
    measureFields: ['quantity', 'unitPrice', 'grossAmount', 'discount', 'netAmount', 'cost', 'profit'],
    rules: [],
    limitations: ['الربحية تحتاج cost/profit.', 'التحليل الزمني يحتاج documentDate.'],
    capabilities: [
      { capabilityId: 'sales.timeline', label: 'الاتجاه الزمني للمبيعات', requiredFields: ['documentDate', 'netAmount'], minSample: 6, status: 'AVAILABLE', missingFields: [] },
      { capabilityId: 'sales.customer-concentration', label: 'تركّز المبيعات حسب العميل', requiredFields: ['customerCode', 'netAmount'], minSample: 12, status: 'AVAILABLE', missingFields: [] },
      { capabilityId: 'sales.profitability', label: 'الربحية', requiredFields: ['netAmount', 'cost'], minSample: 12, status: 'AVAILABLE', missingFields: [] },
    ],
    minSample: 12,
    confidenceThreshold: 0.5,
  },
  {
    archetypeId: 'purchases.transaction-detail',
    version: 1,
    status: 'ACTIVE',
    legacyReportType: 'purchases',
    titleAliases: ['purchases', 'purchase', 'procurement', 'المشتريات', 'فواتير المشتريات'],
    headerAliases: ['productCode', 'quantity', 'netAmount', 'supplierCode', 'documentDate'],
    inputShape: 'purchase transaction rows',
    requiredFields: ['productCode', 'quantity'],
    optionalFields: ['productName', 'supplierName', 'supplierCode', 'warehouse', 'documentNo', 'documentDate', 'unitPrice', 'grossAmount', 'discount', 'netAmount', 'cost', 'currency', 'dueDate'],
    conflictingFields: [],
    grain: 'transaction-line',
    timeFields: ['documentDate'],
    entityFields: ['productCode', 'productName', 'supplierCode', 'supplierName'],
    measureFields: ['quantity', 'unitPrice', 'grossAmount', 'discount', 'netAmount', 'cost'],
    rules: [],
    limitations: ['تحليل الموردين يحتاج supplierCode/supplierName.', 'الاتجاه الزمني يحتاج documentDate.'],
    capabilities: [
      { capabilityId: 'purchases.timeline', label: 'الاتجاه الزمني للمشتريات', requiredFields: ['documentDate', 'netAmount'], minSample: 6, status: 'AVAILABLE', missingFields: [] },
      { capabilityId: 'purchases.supplier-concentration', label: 'تركّز المشتريات حسب المورد', requiredFields: ['supplierCode', 'netAmount'], minSample: 12, status: 'AVAILABLE', missingFields: [] },
    ],
    minSample: 12,
    confidenceThreshold: 0.5,
  },
  {
    archetypeId: 'customer.balance',
    version: 1,
    status: 'ACTIVE',
    legacyReportType: 'customerBalances',
    titleAliases: ['customer balance', 'receivable', 'customer statement', 'رصيد العميل', 'كشف حساب عميل', 'الذمم المدينة'],
    headerAliases: ['customerCode', 'customerName', 'netAmount', 'dueDate'],
    inputShape: 'customer balance rows',
    requiredFields: ['customerCode'],
    optionalFields: ['customerName', 'documentDate', 'netAmount', 'currency', 'dueDate'],
    conflictingFields: [],
    grain: 'customer',
    timeFields: ['documentDate', 'dueDate'],
    entityFields: ['customerCode', 'customerName'],
    measureFields: ['netAmount'],
    rules: [],
    limitations: ['العمر الحقيقي للذمم يحتاج dueDate.', 'قيمة الرصيد تحتاج حقل مالي واضح.'],
    capabilities: [
      { capabilityId: 'customer.aging', label: 'أعمار الذمم المدينة', requiredFields: ['customerCode', 'dueDate', 'netAmount'], minSample: 12, status: 'AVAILABLE', missingFields: [] },
      { capabilityId: 'customer.activity', label: 'نشاط العملاء عبر الزمن', requiredFields: ['customerCode', 'documentDate', 'netAmount'], minSample: 12, status: 'AVAILABLE', missingFields: [] },
    ],
    minSample: 12,
    confidenceThreshold: 0.5,
  },
  {
    archetypeId: 'supplier.balance',
    version: 1,
    status: 'ACTIVE',
    legacyReportType: 'supplierBalances',
    titleAliases: ['supplier balance', 'payable', 'supplier statement', 'رصيد المورد', 'كشف حساب مورد', 'الذمم الدائنة'],
    headerAliases: ['supplierCode', 'supplierName', 'netAmount', 'dueDate'],
    inputShape: 'supplier balance rows',
    requiredFields: ['supplierCode'],
    optionalFields: ['supplierName', 'documentDate', 'netAmount', 'currency', 'dueDate'],
    conflictingFields: [],
    grain: 'supplier',
    timeFields: ['documentDate', 'dueDate'],
    entityFields: ['supplierCode', 'supplierName'],
    measureFields: ['netAmount'],
    rules: [],
    limitations: ['العمر والاستحقاق يحتاجان dueDate.', 'الالتزامات المالية تحتاج حقل قيمة واضح.'],
    capabilities: [
      { capabilityId: 'supplier.aging', label: 'أعمار الذمم الدائنة', requiredFields: ['supplierCode', 'dueDate', 'netAmount'], minSample: 12, status: 'AVAILABLE', missingFields: [] },
      { capabilityId: 'supplier.activity', label: 'نشاط الموردين عبر الزمن', requiredFields: ['supplierCode', 'documentDate', 'netAmount'], minSample: 12, status: 'AVAILABLE', missingFields: [] },
    ],
    minSample: 12,
    confidenceThreshold: 0.5,
  },
  {
    archetypeId: 'inventory.movement',
    version: 1,
    status: 'ACTIVE',
    legacyReportType: 'stockMovement',
    titleAliases: ['stock movement', 'inventory movement', 'movement', 'حركة المخزون', 'حركة الصنف'],
    headerAliases: ['productCode', 'quantity', 'documentDate', 'warehouse'],
    inputShape: 'item movement rows',
    requiredFields: ['productCode', 'quantity'],
    optionalFields: ['productName', 'unit', 'warehouse', 'documentNo', 'documentDate', 'inbound', 'outbound'],
    conflictingFields: [],
    grain: 'movement-line',
    timeFields: ['documentDate'],
    entityFields: ['productCode', 'productName', 'warehouse'],
    measureFields: ['quantity', 'inbound', 'outbound'],
    rules: [],
    limitations: ['التسلسل الزمني يحتاج documentDate.', 'مقارنة المستودعات تحتاج warehouse.'],
    capabilities: [
      { capabilityId: 'inventory.movement-trend', label: 'اتجاه حركة الأصناف', requiredFields: ['productCode', 'documentDate', 'quantity'], minSample: 12, status: 'AVAILABLE', missingFields: [] },
      { capabilityId: 'inventory.warehouse-comparison', label: 'مقارنة حركة المستودعات', requiredFields: ['productCode', 'warehouse', 'quantity'], minSample: 12, status: 'AVAILABLE', missingFields: [] },
    ],
    minSample: 12,
    confidenceThreshold: 0.5,
  },
];

const GENERIC_PROFILE: ArchetypeProfile = {
  archetypeId: 'generic.report',
  version: 1,
  status: 'ACTIVE',
  legacyReportType: 'unknown',
  titleAliases: [],
  headerAliases: [],
  inputShape: 'unknown source',
  requiredFields: [],
  optionalFields: [],
  conflictingFields: [],
  grain: 'unknown',
  timeFields: [],
  entityFields: [],
  measureFields: [],
  rules: [],
  limitations: ['لم يتم التعرف على قالب أعمال متخصص بثقة كافية.'],
  capabilities: [],
  minSample: 12,
  confidenceThreshold: 0.5,
};

const ALL_PROFILES: readonly ArchetypeProfile[] = [...PROFILES, GENERIC_PROFILE].map((profile) => Object.freeze({
  ...profile,
  profileVersion: `${profile.archetypeId}@v${profile.version}`,
}));

export function resolveArchetypeFromHeaders(input: { headers: string[]; title?: string | null }): ArchetypeResolution {
  const fields = uniqueFields(
    input.headers
      .map((header) => matchCanonicalField(header))
      .filter((field): field is CanonicalField => Boolean(field)),
  );
  return resolveArchetype({ fields, title: input.title });
}

const LEGACY_TO_ARCHETYPE: Record<ArchetypeProfile['legacyReportType'], string> = {
  inventory: 'inventory.balance',
  sales: 'sales.transaction-detail',
  purchases: 'purchases.transaction-detail',
  customerBalances: 'customer.balance',
  supplierBalances: 'supplier.balance',
  stockMovement: 'inventory.movement',
  unknown: 'generic.report',
};

function uniqueFields(fields: CanonicalField[]): CanonicalField[] {
  return [...new Set(fields)];
}

function scoreProfile(profile: ArchetypeProfile, available: Set<CanonicalField>, title: string): { score: number; matched: CanonicalField[]; missing: CanonicalField[]; reasons: string[] } {
  if (profile.legacyReportType === 'unknown') return { score: 0, matched: [], missing: [], reasons: ['لا يوجد تطابق متخصص؛ استخدام Generic Smart Pack.'] };
  const matched = profile.requiredFields.filter((field) => available.has(field));
  const missing = profile.requiredFields.filter((field) => !available.has(field));
  const requiredScore = profile.requiredFields.length ? matched.length / profile.requiredFields.length : 0;
  const titleNorm = title.trim().toLowerCase();
  const titleHit = titleNorm && profile.titleAliases.some((alias) => titleNorm.includes(alias.toLowerCase())) ? 1 : 0;
  const score = Math.min(1, requiredScore * 0.8 + titleHit * 0.2);
  const reasons = [
    matched.length ? 'حقول مطلوبة متاحة: ' + matched.join(', ') : 'لا توجد مطابقة حقول مطلوبة.',
    titleHit ? 'عنوان المصدر يدعم القالب.' : 'لا يوجد دعم من عنوان المصدر.',
  ];
  return { score, matched, missing, reasons };
}

export function listArchetypeProfiles(): readonly ArchetypeProfile[] {
  return ALL_PROFILES;
}

export function getArchetypeProfile(archetypeId: string, version = 1): ArchetypeProfile | null {
  return ALL_PROFILES.find((profile) => profile.archetypeId === archetypeId && profile.version === version) ?? null;
}

export function resolveArchetype(input: {
  fields: CanonicalField[];
  title?: string | null;
}): ArchetypeResolution {
  const available = new Set(uniqueFields(input.fields));
  const title = input.title ?? '';
  let best = GENERIC_PROFILE;
  let bestScore = 0;
  let bestMatch = { matched: [] as CanonicalField[], missing: [] as CanonicalField[], reasons: ['لا يوجد تطابق متخصص؛ استخدام Generic Smart Pack.'] };

  for (const profile of PROFILES) {
    const match = scoreProfile(profile, available, title);
    if (match.score > bestScore) {
      bestScore = match.score;
      best = profile;
      bestMatch = match;
    }
  }

  if (bestScore < best.confidenceThreshold) {
    return {
      archetypeId: GENERIC_PROFILE.archetypeId,
      profileVersion: GENERIC_PROFILE.version,
      legacyReportType: 'unknown',
      matchReason: ['الثقة الدلالية أقل من الحد؛ لم يتم فرض قالب متخصص.', 'تم اختيار Generic Smart Pack.'],
      matchedFields: [],
      missingRequiredFields: [],
      conflicts: [],
      confidence: bestScore,
      reviewRequired: true,
      limitations: GENERIC_PROFILE.limitations,
    };
  }

  return {
    archetypeId: best.archetypeId,
    profileVersion: best.version,
    legacyReportType: best.legacyReportType,
    matchReason: bestMatch.reasons,
    matchedFields: bestMatch.matched,
    missingRequiredFields: bestMatch.missing,
    conflicts: best.conflictingFields.filter((field) => available.has(field)),
    confidence: bestScore,
    reviewRequired: bestMatch.missing.length > 0 || bestScore < best.confidenceThreshold,
    limitations: best.limitations,
  };
}

export function resolveLegacyReportType(reportType: ArchetypeProfile['legacyReportType']): ArchetypeProfile {
  const archetypeId = LEGACY_TO_ARCHETYPE[reportType];
  return getArchetypeProfile(archetypeId) ?? GENERIC_PROFILE;
}

export function evaluateFieldAvailability(
  profile: ArchetypeProfile,
  availableFields: CanonicalField[],
  sampleSize: number,
): IntelligenceCapability[] {
  const available = new Set(availableFields);
  return profile.capabilities.map((capability) => {
    const missingFields = capability.requiredFields.filter((field) => !available.has(field));
    const status: AvailabilityStatus = missingFields.length
      ? 'NOT_AVAILABLE'
      : sampleSize < capability.minSample
        ? 'INSUFFICIENT_SAMPLE'
        : 'AVAILABLE';
    return { ...capability, status, missingFields };
  });
}

export function buildGenericSmartPack(input: {
  fields: CanonicalField[];
  sampleSize: number;
  title?: string | null;
}): {
  archetypeId: string;
  profileVersion: number;
  whatWasUnderstood: string;
  calculable: string[];
  notCalculable: string[];
  missingFields: CanonicalField[];
  nextBusinessQuestions: string[];
  reviewRequired: boolean;
} {
  const resolution = resolveArchetype(input);
  const known = uniqueFields(input.fields);
  const standardQuestions: string[] = ['ما الذي حدث في المصدر؟'];
  if (known.includes('documentDate')) standardQuestions.push('كيف تغيرت القيمة عبر الزمن؟');
  if (known.includes('customerCode')) standardQuestions.push('أين يتركز النشاط بين العملاء؟');
  if (known.includes('supplierCode')) standardQuestions.push('أين يتركز الاعتماد على الموردين؟');
  if (known.includes('productCode')) standardQuestions.push('كيف يتوزع النشاط على الأصناف؟');

  const missingFields: CanonicalField[] = [];
  if (!known.includes('documentDate')) missingFields.push('documentDate');
  if (!known.includes('customerCode') && !known.includes('supplierCode')) missingFields.push('customerCode');
  if (!known.includes('currentStock') && !known.includes('quantity')) missingFields.push('quantity');
  const calculable = [
    known.includes('productCode') ? 'تجميع النشاط حسب الصنف' : null,
    known.includes('documentDate') ? 'تجميع زمني عند توفر قيمة قابلة للتجميع' : null,
    known.includes('customerCode') ? 'تجميع حسب العميل' : null,
    known.includes('supplierCode') ? 'تجميع حسب المورد' : null,
  ].filter((value): value is string => Boolean(value));

  const notCalculable = [
    !known.includes('cost') ? 'الربحية والهامش: NOT_AVAILABLE بدون cost' : null,
    !known.includes('dueDate') ? 'الأعمار والاستحقاق الحقيقي: NOT_AVAILABLE بدون dueDate' : null,
    input.sampleSize < 6 ? 'التنبؤ: INSUFFICIENT_SAMPLE لعينة صغيرة' : null,
  ].filter((value): value is string => Boolean(value));

  return {
    archetypeId: resolution.archetypeId,
    profileVersion: resolution.profileVersion,
    whatWasUnderstood: resolution.archetypeId === 'generic.report'
      ? 'تم فهم الحقول الكانونية المتاحة دون فرض نوع أعمال غير مثبت.'
      : 'تم التعرف على قالب أعمال متخصص مع إبقاء حدود الحقول والدليل صريحة.',
    calculable,
    notCalculable,
    missingFields,
    nextBusinessQuestions: standardQuestions,
    reviewRequired: resolution.reviewRequired,
  };
}
