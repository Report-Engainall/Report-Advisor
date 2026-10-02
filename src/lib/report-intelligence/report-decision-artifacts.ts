import type {ReportIntelligence, ReportRecommendation, ReportSignal} from './report-smart-insights';

export type ClaimStatus = 'OBSERVED' | 'DERIVED' | 'INFERRED' | 'RECOMMENDED';
export type ReportClaim = {
  id: string; status: ClaimStatus; statement: string; inputFields: string[];
  calculationMethod: string; periodScope: string | null; sampleSize: number | null;
  sourceHash: string; reportExecutionJobId: string; evidenceSnapshotId: string | null;
  evidencePassportId: string | null; limitations: string[]; archetypeId: string | null;
  profileVersion: string | null; ruleId: string;
};
export type BusinessQuestionStatus = 'ANSWERED' | 'NOT_AVAILABLE' | 'INSUFFICIENT_SAMPLE' | 'REVIEW_REQUIRED' | 'BLOCKED';
export type BusinessQuestionKey = 'WHAT' | 'WHERE' | 'WHO_OR_WHAT_CONTRIBUTED' | 'WHY' | 'SO_WHAT' | 'WHAT_NEXT' | 'PROOF' | 'AFTER_ACTION';
export type BusinessQuestion = { key: BusinessQuestionKey; title: string; status: BusinessQuestionStatus; answer: string; claimIds: string[]; limitations: string[]; };
export type DecisionPacket = {
  businessQuestion: string; what: BusinessQuestion; why: BusinessQuestion; soWhat: BusinessQuestion;
  impact: { status: 'AVAILABLE' | 'NOT_AVAILABLE' | 'INSUFFICIENT_SAMPLE'; statement: string; };
  proof: BusinessQuestion; limitations: string[]; recommendation: ReportRecommendation | null;
  decisionStatus: string | null; approvalStatus: string | null; workStatus: string | null;
  expectedOutcome: string | null; actualOutcome: string | null; profileVersion: string | null; reproducibilityKey: string;
};
export type ReportDecisionArtifacts = { claims: ReportClaim[]; questions: BusinessQuestion[]; decisionPacket: DecisionPacket; };
type ArtifactInput = { jobId: string; sourceHash: string; rowCount: number | null; specialty: string | null; renderedOutput: Record<string, unknown>; intelligence: ReportIntelligence; };
function text(value: unknown): string { return String(value ?? '').trim(); }
function buildObservedSourceClaim(input: ArtifactInput): ReportClaim {
  return {
    id: 'claim:source', status: 'OBSERVED',
    statement: 'المصدر ' + (text(input.renderedOutput.fileName) || "الحالي") + ' تم ربطه ببصمته الأصلية وتحليله على ' + String(input.rowCount ?? "عدد صفوف غير متاح") + ' صفًا.',
    inputFields: ['source_path', 'source_hash', 'row_count', 'source_format'],
    calculationMethod: 'source-runtime-readback', periodScope: text(input.renderedOutput.periodScope) || null, sampleSize: input.rowCount,
    sourceHash: input.sourceHash, reportExecutionJobId: input.jobId, evidenceSnapshotId: text(input.renderedOutput.evidenceSnapshotId) || null,
    evidencePassportId: text(input.renderedOutput.evidencePassportId) || null, limitations: ['رصد المصدر لا يثبت سببية أو أثرًا مستقبليًا.'],
    archetypeId: text(input.renderedOutput.archetypeId) || null, profileVersion: text(input.renderedOutput.profileVersion) || null, ruleId: 'SOURCE_RUNTIME_READBACK'
  };
}
function buildSignalClaim(input: ArtifactInput, signal: ReportSignal): ReportClaim {
  return {
    id: 'claim:' + signal.id, status: 'DERIVED', statement: signal.message, inputFields: signal.evidence,
    calculationMethod: 'deterministic-signal-rule:' + signal.id, periodScope: text(input.renderedOutput.periodScope) || null,
    sampleSize: signal.affectedRows ?? input.rowCount, sourceHash: input.sourceHash, reportExecutionJobId: input.jobId,
    evidenceSnapshotId: text(input.renderedOutput.evidenceSnapshotId) || null, evidencePassportId: text(input.renderedOutput.evidencePassportId) || null,
    limitations: ['الاستنتاج مشتق من البيانات المتاحة، ولا يثبت السببية وحده.', 'القيمة المالية النهائية لا تُفترض من عدد السجلات المتأثرة.'],
    archetypeId: text(input.renderedOutput.archetypeId) || null, profileVersion: text(input.renderedOutput.profileVersion) || null, ruleId: signal.id,
  };
}
function buildRecommendationClaim(input: ArtifactInput, recommendation: ReportRecommendation): ReportClaim {
  return {
    id: 'claim:recommendation:' + recommendation.id, status: 'RECOMMENDED', statement: recommendation.action, inputFields: recommendation.evidence,
    calculationMethod: 'deterministic-recommendation-policy:' + recommendation.id, periodScope: text(input.renderedOutput.periodScope) || null,
    sampleSize: input.rowCount, sourceHash: input.sourceHash, reportExecutionJobId: input.jobId,
    evidenceSnapshotId: text(input.renderedOutput.evidenceSnapshotId) || null, evidencePassportId: text(input.renderedOutput.evidencePassportId) || null,
    limitations: ['التوصية اقتراح نظام وليست قرارًا بشريًا.', 'الأثر المتوقع ليس نتيجة مقاسة.'],
    archetypeId: text(input.renderedOutput.archetypeId) || null, profileVersion: text(input.renderedOutput.profileVersion) || null, ruleId: recommendation.id,
  };
}
function makeQuestion(key: BusinessQuestionKey, title: string, status: BusinessQuestionStatus, answer: string, claimIds: string[], limitations: string[] = []): BusinessQuestion {
  return { key, title, status, answer, claimIds, limitations };
}
export function buildReportDecisionArtifacts(input: ArtifactInput): ReportDecisionArtifacts {
  const signals = input.intelligence.signals; const recommendations = input.intelligence.recommendations;
  const claims = [buildObservedSourceClaim(input), ...signals.map((signal) => buildSignalClaim(input, signal))];
  for (const recommendation of recommendations) claims.push(buildRecommendationClaim(input, recommendation));
  const topSignal = signals[0] ?? null; const topRecommendation = recommendations[0] ?? null;
  const topClaimId = topSignal ? 'claim:' + topSignal.id : null;
  const proofReady = Boolean(text(input.renderedOutput.evidenceSnapshotId) && text(input.renderedOutput.evidencePassportId) && input.renderedOutput.evidenceVerificationStatus === 'VERIFIED');
  const whereAnswered = Boolean(topSignal?.affectedRows != null || topSignal?.drivers?.some((driver) => Boolean(driver.value.trim())));
  const contributorAnswered = Boolean(topSignal?.drivers?.length);
  const questions: BusinessQuestion[] = [
    makeQuestion('WHAT', 'ماذا حدث؟', topSignal ? 'ANSWERED' : 'NOT_AVAILABLE', topSignal?.message ?? 'لا توجد إشارة أعمال مثبتة من المصدر الحالي.', topClaimId ? [topClaimId] : []),
    makeQuestion('WHERE', 'أين ظهر ذلك؟', whereAnswered ? 'ANSWERED' : 'NOT_AVAILABLE', whereAnswered ? 'النطاق المثبت في المصدر: ' + String(topSignal?.affectedRows ?? 'مساهمة/بُعد قابل للفحص') + ' سجل/سياق.' : 'لا يحتوي المصدر الحالي على نطاق/بُعد كافٍ لتحديد الموضع.', topClaimId ? [topClaimId] : [], whereAnswered ? [] : ['يلزم حقل أو بُعد إضافي لتحديد الموضع بدقة.']),
    makeQuestion('WHO_OR_WHAT_CONTRIBUTED', 'من/ما الذي ساهم؟', contributorAnswered ? 'ANSWERED' : 'NOT_AVAILABLE', contributorAnswered ? (topSignal?.drivers ?? []).map((driver) => driver.value).join('، ') : 'لا يوجد driver محفوظ يمكن نسبته بأمان.', topClaimId ? [topClaimId] : [], contributorAnswered ? ['المساهمة لا تعني السببية.'] : []),
    makeQuestion('WHY', 'لماذا؟', contributorAnswered ? 'REVIEW_REQUIRED' : 'NOT_AVAILABLE', contributorAnswered ? 'يوجد اتجاه/مساهمة قابلة للفحص، لكن لا تُنسب السببية قبل مطابقة السياق والدليل الأصلي.' : 'لا توجد أدلة سببية كافية في المصدر الحالي.', topClaimId ? [topClaimId] : [], ['لا تُستخدم صياغة سببية قطعية دون دليل سببي مستقل.']),
    makeQuestion('SO_WHAT', 'ما الأثر التشغيلي؟', topSignal ? 'ANSWERED' : 'NOT_AVAILABLE', topSignal?.soWhat ?? 'الأثر التشغيلي غير متاح.', topClaimId ? [topClaimId] : []),
    makeQuestion('WHAT_NEXT', 'ماذا نفعل الآن؟', topRecommendation ? 'ANSWERED' : 'NOT_AVAILABLE', topRecommendation?.action ?? 'لا توجد توصية موثقة من الإشارات الحالية.', topRecommendation ? ['claim:recommendation:' + topRecommendation.id] : []),
    makeQuestion('PROOF', 'ما الدليل؟', proofReady ? 'ANSWERED' : 'BLOCKED', proofReady ? 'Evidence Passport وEvidence Snapshot مرتبطان بالمصدر ' + input.sourceHash + '.' : 'لا يمكن إعلان claim موثق قبل وجود Evidence Passport وEvidence Snapshot صالحين.', claims.slice(0, 6).map((claim) => claim.id), proofReady ? [] : ['Evidence gate غير مكتمل.']),
    makeQuestion('AFTER_ACTION', 'ماذا حدث بعد التنفيذ؟', text(input.renderedOutput.outcomeStatus) && text(input.renderedOutput.outcomeStatus) !== 'NOT_AVAILABLE' ? 'ANSWERED' : 'NOT_AVAILABLE', text(input.renderedOutput.outcomeStatus) && text(input.renderedOutput.outcomeStatus) !== 'NOT_AVAILABLE' ? 'حالة النتيجة الحالية: ' + text(input.renderedOutput.outcomeStatus) : 'لا توجد نتيجة مقاسة بعد؛ اكتمال العمل لا يساوي Outcome Proven.', [], ['لا يتم إنشاء learning أو impact من دون actual outcome موثق.']),
  ];
  const byKey = new Map(questions.map((question) => [question.key, question]));
  const profileVersion = text(input.renderedOutput.profileVersion) || null;
  const actualImpact = Number(input.renderedOutput.actualImpact ?? input.renderedOutput.outcomeActualImpact);
  const actualOutcomeAvailable = Number.isFinite(actualImpact) && text(input.renderedOutput.outcomeStatus) !== '' && text(input.renderedOutput.outcomeStatus) !== 'insufficient';
  return {
    claims, questions,
    decisionPacket: {
      businessQuestion: input.intelligence.businessQuestion, what: byKey.get('WHAT')!, why: byKey.get('WHY')!, soWhat: byKey.get('SO_WHAT')!,
      impact: { status: actualOutcomeAvailable ? 'AVAILABLE' : text(input.renderedOutput.outcomeStatus) === 'insufficient' ? 'INSUFFICIENT_SAMPLE' : 'NOT_AVAILABLE', statement: actualOutcomeAvailable ? 'الأثر الفعلي المقاس = ' + String(actualImpact) : text(input.renderedOutput.outcomeStatus) === 'insufficient' ? 'تم تنفيذ العمل دون قياس أثر فعلي؛ لا يمكن إثبات outcome مالي.' : 'الأثر المالي/النتيجة الفعلية غير متاحين ما لم تُسجل ملاحظة بعد التنفيذ.' },
      proof: byKey.get('PROOF')!,
      limitations: ['لا توجد سببية مثبتة من التحليل الوصفي وحده.', 'لا توجد نتيجة مالية فعلية قبل رصد Outcome مستقل.', profileVersion ? 'التفسير مرتبط بإصدار profile معلن.' : 'PROFILE_VERSION غير معلن؛ لا يجوز افتراض إعادة تفسير تاريخي صامت.'],
      recommendation: topRecommendation, decisionStatus: text(input.renderedOutput.decisionStatus) || null, approvalStatus: text(input.renderedOutput.approvalStatus) || null,
      workStatus: text(input.renderedOutput.actionStatus) || null, expectedOutcome: topRecommendation?.expectedOutcome ?? null, actualOutcome: text(input.renderedOutput.outcomeStatus) || null,
      profileVersion, reproducibilityKey: [input.sourceHash, input.jobId, profileVersion || 'PROFILE_VERSION_UNDECLARED'].join(':')
    }
  };
}