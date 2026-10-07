import type { CanonicalField } from './report-intelligence/canonical-schema';
import { buildBrainPacket, type BrainPacket } from './intelligence/brain-runtime';
import { matchCanonicalField } from './report-intelligence/canonical-schema';
import { applyArchetypeRuleSet } from './report-intelligence/archetype-evaluator';
import { detectReportArchetype, getReportArchetype, type ArchetypeProfile } from './report-intelligence/archetype-registry';
import { buildAdvisoryPacket, type AdvisoryPacket } from './report-intelligence/report-advisory-orchestrator';
import {
  deriveReportIntelligence,
  selectExecutiveRecommendation,
  selectExecutiveSignal,
  type BusinessFinding,
  type ReportIntelligence,
  type ReportRecommendation,
  type ReportSignal,
} from './report-intelligence/report-smart-insights';

export type UniversalIntelligenceStageStatus =
  | 'VERIFIED'
  | 'TRUSTED'
  | 'DERIVED'
  | 'REVIEW_REQUIRED'
  | 'PROPOSED'
  | 'NOT_AVAILABLE'
  | 'INSUFFICIENT_DATA'
  | 'GAP_DETECTED';

export type UniversalIntelligenceStage = {
  key: string;
  label: string;
  status: UniversalIntelligenceStageStatus;
  headline: string;
  detail: string;
  evidence: string[];
  next: string;
};

export type ConfidenceDimension = {
  key: 'data' | 'mapping' | 'calculation' | 'evidence' | 'signal' | 'forecast' | 'recommendation' | 'decision-readiness' | 'overall-advisory';
  label: string;
  score: number;
  state: 'AVAILABLE' | 'NOT_AVAILABLE' | 'REVIEW';
  basis: string[];
};

export type ConfidenceGovernance = {
  scoreSemantics: 'GOVERNANCE_SCORE_NOT_PROBABILITY';
  dimensions: ConfidenceDimension[];
  bottleneck: ConfidenceDimension | null;
  overall: number;
};

export type UniversalIntelligenceResult = {
  intelligence: ReportIntelligence;
  advisory: AdvisoryPacket;
  archetype: ArchetypeProfile | null;
  archetypeState: string;
  archetypeReason: string;
  confidence: number;
  confidenceGovernance: ConfidenceGovernance;
  mappedFieldCount: number;
  totalFieldCount: number;
  stages: UniversalIntelligenceStage[];
  topQuestions: Array<{
    id: string;
    label: string;
    state: string;
    answer: string;
    followUp: string | null;
  }>;
  brain: BrainPacket;
};

type UniversalReportInput = Parameters<typeof deriveReportIntelligence>[0] & {
  sourcePath?: string | null;
  sourceHash?: string | null;
  reportJobId?: string | null;
  archetypeId?: string | null;
  tenantId?: string | null;
  evidenceSnapshotId?: string | null;
  evidencePassportId?: string | null;
  evidenceVerified?: boolean;
  availableFields?: CanonicalField[];
  decisionOutcomes?: Array<{ label: 'correct' | 'incorrect' | 'partial' | 'unknown'; actualValue?: number | null; expectedValue?: number | null }>;
};

function text(value: unknown): string {
  return String(value ?? '').trim();
}

function canonicalFields(input: UniversalReportInput): CanonicalField[] {
  const provided = Array.isArray(input.availableFields) ? input.availableFields : [];
  const dataset = input.sourceAnalysis?.datasets?.[0];
  const columns = dataset && typeof dataset === 'object' && Array.isArray((dataset as Record<string, unknown>).columns)
    ? (dataset as Record<string, unknown>).columns as Array<Record<string, unknown>>
    : [];

  const candidates = [
    ...provided,
    ...columns.flatMap((column) => [text(column.mappedField), text(column.name)]),
    ...(input.canonicalRows ?? []).flatMap((row) => Object.keys(row.data ?? {})),
  ];

  const fields = new Set<CanonicalField>();
  for (const candidate of candidates) {
    const exact = text(candidate) as CanonicalField;
    if (provided.includes(exact)) fields.add(exact);
    const matched = matchCanonicalField(candidate);
    if (matched) fields.add(matched);
    if (provided.includes(candidate as CanonicalField)) fields.add(candidate as CanonicalField);
  }
  return [...fields];
}

function fieldStats(input: UniversalReportInput) {
  const dataset = input.sourceAnalysis?.datasets?.[0];
  const columns = dataset && typeof dataset === 'object' && Array.isArray((dataset as Record<string, unknown>).columns)
    ? (dataset as Record<string, unknown>).columns as Array<Record<string, unknown>>
    : [];
  const total = columns.length;
  const mapped = columns.filter((column) => {
    const raw = text(column.mappedField);
    return Boolean(raw || matchCanonicalField(text(column.name)));
  }).length;
  const rows = Math.max(0, Number(input.rowCount ?? input.canonicalRows?.length ?? 0));
  let nullCells = 0;
  let cells = 0;
  for (const row of input.canonicalRows ?? []) {
    for (const column of columns) {
      cells += 1;
      const key = text(column.mappedField || column.name);
      const value = row.data?.[key];
      if (value == null || text(value) === '') nullCells += 1;
    }
  }
  const completeness = cells ? Math.round(100 - (nullCells / cells) * 100) : null;
  return { total, mapped, rows, completeness };
}

function strongestEvidence(signal: ReportSignal | null, recommendation: ReportRecommendation | null, intelligence: ReportIntelligence): string[] {
  if (signal?.evidence?.length) return signal.evidence.slice(0, 6);
  if (recommendation?.evidence?.length) return recommendation.evidence.slice(0, 6);
  const finding = intelligence.findings?.[0] ?? intelligence.risks?.[0] ?? intelligence.opportunities?.[0];
  return finding?.evidence?.slice(0, 6) ?? [];
}

function stage(
  key: string,
  label: string,
  status: UniversalIntelligenceStageStatus,
  headline: string,
  detail: string,
  evidence: string[],
  next: string,
): UniversalIntelligenceStage {
  return { key, label, status, headline, detail, evidence, next };
}

function confidenceDimension(
  key: ConfidenceDimension['key'],
  label: string,
  score: number,
  state: ConfidenceDimension['state'],
  basis: string[],
): ConfidenceDimension {
  return {
    key,
    label,
    score: Math.max(0, Math.min(100, Math.round(score))),
    state,
    basis: basis.filter(Boolean).slice(0, 4),
  };
}

function buildConfidenceGovernance(input: {
  rows: number;
  completeness: number | null;
  mapped: number;
  total: number;
  sourceHash: string | null;
  evidenceSnapshotId: string | null;
  evidencePassportId: string | null;
  primaryFinding: BusinessFinding | null;
  signal: ReportSignal | null;
  recommendation: ReportRecommendation | null;
  advisory: AdvisoryPacket;
  forecast: ReportIntelligence['forecast'];
}): ConfidenceGovernance {
  const dataScore = input.rows > 0 ? input.completeness == null ? 55 : input.completeness : 0;
  const mappingScore = input.total > 0 ? (input.mapped / input.total) * 100 : 0;
  const calculationReady = Boolean(input.primaryFinding && Number.isFinite(Number(input.primaryFinding.value)) && input.primaryFinding.evidence.length > 0);
  const calculationScore = calculationReady ? 85 : input.rows > 0 && input.mapped > 0 ? 55 : 0;
  const evidenceScore = input.evidenceSnapshotId && input.evidencePassportId ? 100 : input.signal?.evidence?.length || input.recommendation?.evidence?.length ? 65 : 0;
  const signalScore = input.signal ? input.signal.evidence.length > 0 ? 90 : 55 : 0;
  const forecastAvailable = input.forecast.status === 'AVAILABLE' && input.forecast.nextValue != null;
  const forecastScore = forecastAvailable ? input.forecast.observedPeriods >= 3 ? 70 : 50 : 0;
  const recommendationScore = input.recommendation ? input.recommendation.evidence.length > 0 ? 85 : 50 : 0;
  const decisionScore = input.advisory.actionState === 'ACTIONABLE'
    ? input.evidenceSnapshotId && input.evidencePassportId ? 100 : 70
    : input.advisory.actionState === 'REVIEW_REQUIRED' ? 50 : 0;

  const dimensions: ConfidenceDimension[] = [
    confidenceDimension('data', 'ثقة البيانات', dataScore, input.rows > 0 ? (input.completeness == null ? 'REVIEW' : 'AVAILABLE') : 'NOT_AVAILABLE', [
      'rows=' + input.rows,
      input.completeness == null ? 'اكتمال الخلايا غير محسوب' : 'completeness=' + input.completeness + '%',
      input.sourceHash ? 'بصمة المصدر موجودة' : 'بصمة المصدر غير متاحة في هذا السياق',
    ]),
    confidenceDimension('mapping', 'ثقة التعيين الدلالي', mappingScore, input.total > 0 ? 'AVAILABLE' : 'NOT_AVAILABLE', [
      'mappedFields=' + input.mapped + '/' + Math.max(1, input.total),
      input.mapped === input.total && input.total > 0 ? 'كل الحقول المعروفة مرتبطة' : 'يوجد حقل أو أكثر يحتاج مراجعة',
    ]),
    confidenceDimension('calculation', 'ثقة الحساب', calculationScore, calculationReady ? 'AVAILABLE' : 'REVIEW', [
      calculationReady ? 'توجد نتيجة رقمية مع دليل مرتبط' : 'لا توجد نتيجة حسابية موثقة بالكامل في هذا السياق',
      'الدرجة حوكمة للجاهزية وليست احتمالًا إحصائيًا',
    ]),
    confidenceDimension('evidence', 'ثقة الدليل', evidenceScore, input.evidenceSnapshotId && input.evidencePassportId ? 'AVAILABLE' : input.signal || input.recommendation ? 'REVIEW' : 'NOT_AVAILABLE', [
      input.evidenceSnapshotId ? 'Evidence Snapshot موجود' : 'Evidence Snapshot غير مكتمل',
      input.evidencePassportId ? 'Evidence Passport موجود' : 'Evidence Passport غير مكتمل',
    ]),
    confidenceDimension('signal', 'ثقة الإشارة', signalScore, input.signal ? 'AVAILABLE' : 'NOT_AVAILABLE', [
      input.signal ? 'signal=' + input.signal.id : 'لا توجد إشارة تنفيذية مؤهلة',
      input.signal?.evidence?.length ? 'evidenceItems=' + input.signal.evidence.length : '',
    ]),
    confidenceDimension('forecast', 'ثقة التنبؤ', forecastScore, forecastAvailable ? 'REVIEW' : 'NOT_AVAILABLE', [
      forecastAvailable ? 'observedPeriods=' + input.forecast.observedPeriods : 'لا يوجد Forecast متاح في هذا السياق',
      forecastAvailable ? 'لا توجد معايرة فعلية كافية هنا؛ السقف الحوكمي 70' : 'لا يتم اختراع Forecast عند غياب العينة',
    ]),
    confidenceDimension('recommendation', 'ثقة التوصية', recommendationScore, input.recommendation ? 'AVAILABLE' : 'NOT_AVAILABLE', [
      input.recommendation ? 'recommendation=' + input.recommendation.id : 'لا توجد توصية مؤهلة',
      input.recommendation?.evidence?.length ? 'evidenceItems=' + input.recommendation.evidence.length : '',
    ]),
    confidenceDimension('decision-readiness', 'جاهزية القرار', decisionScore, input.advisory.actionState === 'ACTIONABLE' ? 'AVAILABLE' : input.advisory.actionState === 'REVIEW_REQUIRED' ? 'REVIEW' : 'NOT_AVAILABLE', [
      'actionState=' + input.advisory.actionState,
      input.evidencePassportId && input.evidenceSnapshotId ? 'سلسلة الدليل مكتملة' : 'السلسلة الدليلية غير مكتملة',
    ]),
  ];

  const available = dimensions.filter((item) => item.state !== 'NOT_AVAILABLE');
  const bottleneck = available.length ? [...available].sort((a, b) => a.score - b.score || a.label.localeCompare(b.label, 'ar'))[0] : null;
  const overall = available.length ? Math.min(...available.map((item) => item.score)) : 0;
  const overallDimension = confidenceDimension(
    'overall-advisory',
    'الثقة الاستشارية الكلية',
    overall,
    available.length ? (bottleneck && bottleneck.score < 70 ? 'REVIEW' : 'AVAILABLE') : 'NOT_AVAILABLE',
    bottleneck ? ['أضعف حلقة: ' + bottleneck.label + ' (' + bottleneck.score + '%)', 'الدرجة الكلية = الحد الأدنى للأبعاد المتاحة حتى لا يخفي المتوسط ضعف دليل أو حساب.'] : ['لا توجد أبعاد كافية لإصدار درجة حوكمة.'],
  );

  return {
    scoreSemantics: 'GOVERNANCE_SCORE_NOT_PROBABILITY',
    dimensions: [...dimensions, overallDimension],
    bottleneck,
    overall,
  };
}

export function buildUniversalReportIntelligence(input: UniversalReportInput): UniversalIntelligenceResult {
  const fields = canonicalFields(input);
  const stats = fieldStats(input);
  const exactArchetype = text(input.archetypeId) ? getReportArchetype(text(input.archetypeId)) : null;
  const detection = exactArchetype
    ? { profile: exactArchetype, state: 'SUPPORTED', reason: 'EXACT_RUNTIME_ARCHETYPE' }
    : detectReportArchetype({
        sourcePath: input.sourcePath ?? null,
        specialty: input.specialty ?? null,
        availableFields: fields,
      });
  const effectiveSpecialty = input.specialty ?? detection.profile?.adapterSpecialty ?? null;
  const base = deriveReportIntelligence({ ...input, specialty: effectiveSpecialty });

  let intelligence = base;
  const archetype = detection.profile;
  if (archetype) {
    intelligence = applyArchetypeRuleSet(
      archetype,
      { ...input, specialty: effectiveSpecialty } as Parameters<typeof applyArchetypeRuleSet>[1],
      base,
    );
  }

  const provenance = {
    tenantId: input.tenantId ?? 'preview',
    sourceHash: text(input.sourceHash).replace(/^sha256:/, '') || 'preview:unhashed',
    reportExecutionJobId: input.reportJobId ?? 'preview:report',
    evidenceSnapshotId: input.evidenceSnapshotId ?? null,
    evidencePassportId: input.evidencePassportId ?? null,
  };

  const advisory = buildAdvisoryPacket({
    intelligence,
    provenance,
    availableFields: fields,
    sampleSize: stats.rows,
    archetypeId: archetype?.id ?? null,
    profileVersion: archetype?.version ?? null,
  });

  const signal = selectExecutiveSignal(intelligence);
  const recommendation = selectExecutiveRecommendation(intelligence, signal);
  const evidence = strongestEvidence(signal, recommendation, intelligence);
  const primaryFinding = intelligence.findings?.[0] ?? intelligence.risks?.[0] ?? intelligence.opportunities?.[0] ?? null;
  const hasRows = stats.rows > 0;
  const quality = stats.completeness ?? null;
  const confidence = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (hasRows ? 45 : 0)
        + (quality == null ? 15 : quality * 0.35)
        + (stats.total ? (stats.mapped / stats.total) * 20 : 0)
        + (signal ? 10 : 0),
      ),
    ),
  );

  const brain = buildBrainPacket({
    rows: (input.canonicalRows ?? []).map((row) => row.data ?? {}),
    sourceHash: input.sourceHash ?? null,
    reportJobId: input.reportJobId ?? null,
    archetypeId: archetype?.id ?? null,
    availableFields: fields,
    evidenceVerified: input.evidenceVerified === true && advisory.proofState === 'VERIFIED',
    evidenceSnapshotId: input.evidenceSnapshotId ?? null,
    evidencePassportId: input.evidencePassportId ?? null,
    recommendation: recommendation ? {
      title: recommendation.title,
      action: recommendation.action,
      ownerHint: recommendation.ownerHint,
      expectedOutcome: recommendation.expectedOutcome,
      measurement: recommendation.measurement,
      evidence: recommendation.evidence,
    } : null,
    decisionOutcomes: input.decisionOutcomes ?? [],
  });

  const confidenceGovernance = buildConfidenceGovernance({
    rows: stats.rows,
    completeness: quality,
    mapped: stats.mapped,
    total: stats.total,
    sourceHash: input.sourceHash ?? null,
    evidenceSnapshotId: provenance.evidenceSnapshotId,
    evidencePassportId: provenance.evidencePassportId,
    primaryFinding,
    signal,
    recommendation,
    advisory,
    forecast: intelligence.forecast,
  });

  const proofText = provenance.evidenceSnapshotId && provenance.evidencePassportId
    ? 'Evidence Passport + snapshot مرتبطان بالمصدر.'
    : 'النتيجة قابلة للمراجعة، لكن اعتماد القرار النهائي يحتاج Evidence Passport/Snapshot مكتملًا.';

  const stages: UniversalIntelligenceStage[] = [
    stage(
      'source',
      'المصدر',
      hasRows ? 'VERIFIED' : 'INSUFFICIENT_DATA',
      input.sourcePath ? 'المصدر معروف ومربوط بالتحليل.' : 'المصدر حاضر داخل سياق التحليل.',
      `${stats.rows.toLocaleString('ar-YE')} سجلًا متاحًا للتحليل${input.sourceHash ? ' · بصمة المصدر موجودة' : ''}.`,
      input.sourceHash ? ['sourceHash=' + input.sourceHash] : [],
      'ثبّت هوية الملف والدورة قبل مشاركة القرار.',
    ),
    stage(
      'extraction',
      'الاستخراج',
      hasRows ? 'TRUSTED' : 'INSUFFICIENT_DATA',
      hasRows ? 'تم استخراج سجلات قابلة للتحليل.' : 'لم ينتج الاستخراج عينة كافية.',
      'الذكاء يبني على الصفوف القانونية نفسها، وليس على أرقام تجميلية.',
      ['rows=' + stats.rows, 'fields=' + stats.total],
      stats.rows ? 'انتقل من الاستخراج إلى فحص الحقول والاكتمال.' : 'أكمل الاستخراج أو صحح المصدر.',
    ),
    stage(
      'truth',
      'كشف الحقيقة',
      quality != null && quality >= 85 ? 'VERIFIED' : 'REVIEW_REQUIRED',
      quality == null ? 'جودة البيانات تحتاج قياسًا إضافيًا.' : `اكتمال الخلايا ${quality}%، والربط الدلالي ${stats.mapped}/${Math.max(1, stats.total)} حقل.`,
      quality != null && quality >= 85
        ? 'الحقول الأساسية قابلة للاعتماد ضمن نطاق المصدر.'
        : 'وجود حقول ناقصة أو غير معرّفة يحد من قوة الاستنتاج.',
      ['mappedFields=' + stats.mapped, ...(quality == null ? [] : ['completeness=' + quality + '%'])],
      quality != null && quality >= 85 ? 'ابحث عن الإشارة وليس مجرد الوصف.' : 'راجع الحقول التي تحد من القرار.',
    ),
    stage(
      'signal',
      'الإشارة',
      signal ? 'DERIVED' : 'NOT_AVAILABLE',
      signal ? signal.message : 'لم تظهر إشارة تنفيذية مؤهلة من البيانات الحالية.',
      signal ? signal.title : 'لا نحول غياب الإشارة إلى حكم إيجابي.',
      evidence,
      signal ? 'اختبر لماذا ظهرت الإشارة قبل تحويلها إلى توصية.' : 'وسّع العينة أو حسّن تعريف الحقول.',
    ),
    stage(
      'why',
      'لماذا',
      signal ? 'REVIEW_REQUIRED' : 'NOT_AVAILABLE',
      signal ? (signal.priorityReason?.[0] ?? 'توجد أسباب مرتبطة بالأولوية.') : 'لا يوجد تفسير مثبت.',
      signal ? 'هذا تفسير تحليلي للقرائن المرصودة وليس إثباتًا سببيًا ما لم توجد أدلة إضافية.' : 'لا نختلق سببًا غير موجود في المصدر.',
      signal?.drivers?.flatMap((driver) => driver.proof).slice(0, 6) ?? [],
      signal ? 'راجع المحرك أو البعد الأكثر مساهمة.' : 'لا يوجد مسار سبب موثوق بعد.',
    ),
    stage(
      'meaning',
      'ماذا يعني',
      signal ? 'DERIVED' : 'NOT_AVAILABLE',
      signal?.soWhat || primaryFinding?.statement || intelligence.summary,
      signal?.impact || primaryFinding?.limitation || 'الأثر المالي أو التشغيلي النهائي غير مثبت.',
      strongestEvidence(signal, recommendation, intelligence),
      'حدد ما الذي يجب تغييره وما الذي يجب قياسه.',
    ),
    stage(
      'recommendation',
      'التوصية',
      recommendation ? 'PROPOSED' : 'NOT_AVAILABLE',
      recommendation?.title || intelligence.advisorBrief.recommendedAction || 'لا توجد توصية كافية.',
      recommendation?.action || recommendation?.limitation || 'التوصية غير متاحة دون دليل كافٍ.',
      recommendation?.evidence?.slice(0, 6) ?? evidence,
      recommendation ? 'اعرض التوصية كاقتراح، لا كقرار منفذ.' : 'أكمل الدليل قبل التوصية.',
    ),
    stage(
      'measurement',
      'القياس',
      recommendation?.measurement ? 'PROPOSED' : 'NOT_AVAILABLE',
      recommendation?.measurement || intelligence.advisorBrief.measurement || 'لا يوجد مقياس مثبت بعد.',
      recommendation?.expectedOutcome || 'النتيجة المتوقعة ليست نتيجة محققة.',
      recommendation?.evidence?.slice(0, 4) ?? evidence,
      'ثبّت خط أساس ثم أعد القياس بعد الإجراء.',
    ),
    stage(
      'decision',
      'القرار',
      advisory.actionState === 'ACTIONABLE' ? 'TRUSTED' : advisory.actionState === 'REVIEW_REQUIRED' ? 'REVIEW_REQUIRED' : 'NOT_AVAILABLE',
      advisory.actionState === 'ACTIONABLE' ? 'التوصية مؤهلة لمسار قرار/عمل بعد اكتمال الحوكمة.' : 'القرار ليس معتمدًا بعد.',
      proofText,
      [advisory.proofState, advisory.actionState],
      advisory.actionState === 'ACTIONABLE' ? 'حوّل التوصية إلى مهمة محددة بمالك وموعد.' : 'أكمل Passport/Snapshot أو ارفع فجوة الإثبات.',
    ),
    stage(
      'work',
      'العمل',
      advisory.actionState === 'ACTIONABLE' ? 'PROPOSED' : 'REVIEW_REQUIRED',
      recommendation?.action || 'لا توجد مهمة تنفيذية مؤهلة بعد.',
      recommendation?.ownerHint ? 'المالك المقترح: ' + recommendation.ownerHint : 'مالك التنفيذ غير محدد.',
      recommendation?.evidence?.slice(0, 4) ?? evidence,
      'بعد التنفيذ، سجّل النتيجة بنفس هوية التقرير.',
    ),
    stage(
      'outcome',
      'النتيجة',
      brain.outcome.state === 'OBSERVED' ? 'VERIFIED' : brain.outcome.state === 'PARTIAL' ? 'REVIEW_REQUIRED' : 'NOT_AVAILABLE',
      brain.outcome.state === 'OBSERVED'
        ? 'توجد نتيجة تنفيذية مرصودة مرتبطة بتاريخ ملاحظة.'
        : brain.outcome.state === 'PARTIAL'
          ? 'توجد ملاحظات تنفيذية، لكن النتيجة جزئية ولا تصلح كأثر كامل.'
          : 'لا توجد نتيجة تنفيذية مثبتة في هذا السياق.',
      brain.outcome.boundary,
      brain.outcome.actualValue != null && brain.outcome.expectedValue != null
        ? [`actual=${brain.outcome.actualValue}`, `expected=${brain.outcome.expectedValue}`]
        : [],
      brain.outcome.state === 'OBSERVED' ? 'راجع أثر التنفيذ مقابل المتوقع.' : 'أعد القياس على نفس المصدر/المؤشر ثم ثبّت النتيجة.',
    ),
    stage(
      'learning',
      'التعلّم',
      brain.outcome.learning === 'CANDIDATE' ? 'DERIVED' : brain.outcome.learning === 'REVIEW_REQUIRED' ? 'REVIEW_REQUIRED' : 'NOT_AVAILABLE',
      brain.outcome.learning === 'CANDIDATE'
        ? 'تكوّن مرشح تعلّم من نتائج فعلية متعددة.'
        : brain.outcome.learning === 'REVIEW_REQUIRED'
          ? 'توجد إشارة تعلّم، لكنها تحتاج نتائج إضافية ومراجعة بشرية.'
          : 'التعلّم ينتظر نتيجة فعلية قابلة للمقارنة.',
      brain.outcome.boundary,
      [`observations=${brain.outcome.observations}`],
      brain.outcome.learning === 'CANDIDATE' ? 'راجع تغير القاعدة أو العتبة قبل اعتماد نسخة جديدة.' : 'اجمع actual مقابل expected ثم أعد التقييم.',
    ),
    stage(
      'benchmark',
      'المقارنة',
      brain.benchmark.state === 'INTERNAL_COMPARABLE' ? 'DERIVED' : 'GAP_DETECTED',
      brain.benchmark.state === 'INTERNAL_COMPARABLE'
        ? `مقارنة داخلية متاحة عبر ${brain.benchmark.entityCount} كيانات.`
        : brain.benchmark.boundary,
      brain.benchmark.boundary,
      brain.benchmark.current != null && brain.benchmark.median != null
        ? [`current=${brain.benchmark.current}`, `median=${brain.benchmark.median}`, `topQuartile=${brain.benchmark.topQuartile}`]
        : [],
      brain.benchmark.state === 'INTERNAL_COMPARABLE' ? 'افتح الفارق عن الوسيط والربع الأعلى قبل تحديد الإجراء.' : 'أضف كيانات مقارنة كافية داخل المصدر أو مرجعًا خارجيًا موثقًا.',
    ),
  ];

  const topQuestions = advisory.questions.slice(0, 8).map((question) => {
    const rawAnswer = question.answer;
    let answer = '';
    if (rawAnswer && typeof rawAnswer === 'object') {
      const record = rawAnswer as Record<string, unknown>;
      answer = text(record.summary ?? record.statement ?? record.action ?? record.observation ?? record.finding ?? '');
    }
    return {
      id: question.id,
      label: question.label,
      state: String(question.state),
      answer: answer || 'لا توجد إجابة مكتملة من الدليل الحالي.',
      followUp: question.followUpQuestion ?? null,
    };
  });

  return {
    intelligence,
    advisory,
    archetype,
    archetypeState: detection.state,
    archetypeReason: detection.reason,
    confidence,
    confidenceGovernance,
    mappedFieldCount: stats.mapped,
    totalFieldCount: stats.total,
    stages,
    topQuestions,
    brain,
  };
}
