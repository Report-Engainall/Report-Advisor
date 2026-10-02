import type { CanonicalField } from './canonical-schema';
import { evaluateBusinessQuestion, sortBusinessQuestions, type BusinessQuestion } from './business-question-engine';
import { buildBusinessQuestionSet, type BusinessArchetype } from './business-question-catalog';
import { buildClaimsFromReportIntelligence } from './report-claim-adapter';
import type { ClaimProvenance, Claim } from './claim-ledger';
import type { ReportIntelligence } from './report-smart-insights';

export type AdvisoryPacket = {
  claims: Claim[];
  questions: BusinessQuestion<Record<string, unknown>>[];
  primarySignal: Claim | null;
  nextRecommendation: Claim | null;
  proofState: 'VERIFIED' | 'REVIEW_REQUIRED' | 'NOT_AVAILABLE';
  actionState: 'ACTIONABLE' | 'REVIEW_REQUIRED' | 'NOT_AVAILABLE';
  outcomeState: 'OBSERVED' | 'INSUFFICIENT' | 'NOT_AVAILABLE';
};

export type AdvisoryPacketInput = {
  intelligence: ReportIntelligence;
  provenance: ClaimProvenance;
  availableFields: CanonicalField[];
  sampleSize: number;
  scope?: { period?: string | null; filters?: Record<string, string | number | boolean | null> };
  archetypeId?: string | null;
  profileVersion?: number | null;
};

function claimStateForProof(provenance: ClaimProvenance): AdvisoryPacket['proofState'] {
  return provenance.evidenceSnapshotId || provenance.evidencePassportId ? 'VERIFIED' : 'REVIEW_REQUIRED';
}

function buildQuestions(input: AdvisoryPacketInput, claims: Claim[]): BusinessQuestion<Record<string, unknown>>[] {
  const signalClaims = claims.filter((claim) => claim.claimId.startsWith('signal:'));
  const recommendationClaims = claims.filter((claim) => claim.claimId.startsWith('recommendation:'));
  const primarySignal = signalClaims[0] ?? null;
  const nextRecommendation = recommendationClaims[0] ?? null;

  const business = input.intelligence;
  const topFinding = business.findings?.[0] ?? null;
  const topRisk = business.risks?.[0] ?? null;
  const topOpportunity = business.opportunities?.[0] ?? null;
  const contributorFinding = business.findings?.find((item) => item.id.endsWith(':change-contributor')) ?? business.findings?.find((item) => item.id.endsWith(':top-party')) ?? null;

  const whatAnswer = input.sampleSize > 0
    ? 'تم تحليل ' + input.sampleSize + ' سجلًا من المصدر الكانوني. ' + (topFinding?.statement ?? input.intelligence.summary)
    : null;

  const whereAnswer = contributorFinding
    ? contributorFinding.dimensionLabel + ': ' + String(contributorFinding.dimensionValue ?? 'غير محدد') + ' — ' + contributorFinding.statement
    : topFinding?.dimensionLabel
      ? topFinding.dimensionLabel + ': ' + String(topFinding.dimensionValue ?? 'غير محدد')
      : null;

  const contributorsAnswer = contributorFinding
    ? contributorFinding.statement + ' الدليل: ' + contributorFinding.evidence.join(' · ')
    : null;

  const detractorsAnswer = topRisk
    ? topRisk.statement + ' الإجراء المقترح: ' + topRisk.action
    : null;

  const whyAnswer = primarySignal
    ? primarySignal.statement + ' وهذه قراءة للملاحظة/المساهمة وليست إثباتًا سببيًا.'
    : null;

  const soWhatAnswer = topRisk
    ? topRisk.title + ' — ' + topRisk.action
    : topOpportunity
      ? topOpportunity.title + ' — ' + topOpportunity.action
      : topFinding?.action ?? null;

  const nextAnswer = nextRecommendation
    ? nextRecommendation.statement
    : business.advisorBrief?.recommendedAction ?? null;

  const universal = [
    evaluateBusinessQuestion<Record<string, unknown>>({
      id: 'report.what-happened',
      label: 'ماذا حدث في هذا المصدر؟',
      requiredFields: [],
      minimumSample: 1,
      priority: 100,
      availableFields: input.availableFields,
      sampleSize: input.sampleSize,
      answer: whatAnswer,
    }),
    evaluateBusinessQuestion<Record<string, unknown>>({
      id: 'report.where',
      label: 'أين تركز التغير؟',
      requiredFields: [],
      minimumSample: 1,
      priority: 95,
      availableFields: input.availableFields,
      sampleSize: input.sampleSize,
      answer: whereAnswer,
    }),
    evaluateBusinessQuestion<Record<string, unknown>>({
      id: 'report.contributors',
      label: 'من/ما الذي ساهم في التغير؟',
      requiredFields: [],
      minimumSample: 1,
      priority: 90,
      availableFields: input.availableFields,
      sampleSize: input.sampleSize,
      answer: contributorsAnswer,
    }),
    evaluateBusinessQuestion<Record<string, unknown>>({
      id: 'report.detractors',
      label: 'من/ما الذي سحب النتيجة إلى الأسفل؟',
      requiredFields: [],
      minimumSample: 1,
      priority: 85,
      availableFields: input.availableFields,
      sampleSize: input.sampleSize,
      answer: detractorsAnswer,
    }),
    evaluateBusinessQuestion<Record<string, unknown>>({
      id: 'report.primary-signal',
      label: 'ما أهم إشارة مثبتة الآن؟',
      requiredFields: [],
      minimumSample: 1,
      priority: 90,
      availableFields: input.availableFields,
      sampleSize: input.sampleSize,
      answer: primarySignal
        ? primarySignal.statement
        : null,
    }),
    evaluateBusinessQuestion<Record<string, unknown>>({
      id: 'report.why',
      label: 'ما الذي يفسر الملاحظة، وما حدود ذلك؟',
      requiredFields: [],
      minimumSample: 1,
      priority: 80,
      availableFields: input.availableFields,
      sampleSize: input.sampleSize,
      answer: whyAnswer,
      reviewRequired: Boolean(primarySignal),
    }),
    evaluateBusinessQuestion<Record<string, unknown>>({
      id: 'report.so-what',
      label: 'ما أثر ذلك على القرار؟',
      requiredFields: [],
      minimumSample: 1,
      priority: 75,
      availableFields: input.availableFields,
      sampleSize: input.sampleSize,
      answer: soWhatAnswer,
      reviewRequired: Boolean(topRisk || topOpportunity),
    }),
    evaluateBusinessQuestion<Record<string, unknown>>({
      id: 'report.what-next',
      label: 'ما الإجراء التالي المقترح؟',
      requiredFields: [],
      minimumSample: 1,
      priority: 70,
      availableFields: input.availableFields,
      sampleSize: input.sampleSize,
      answer: nextAnswer,
      reviewRequired: Boolean(nextRecommendation || business.advisorBrief?.recommendedAction),
    }),
    evaluateBusinessQuestion<Record<string, unknown>>({
      id: 'report.proof',
      label: 'هل يمكن إثبات هذه النتيجة من المصدر؟',
      requiredFields: [],
      minimumSample: 1,
      priority: 60,
      availableFields: input.availableFields,
      sampleSize: input.sampleSize,
      answer: claimStateForProof(input.provenance) === 'VERIFIED'
        ? { sourceHash: input.provenance.sourceHash, jobId: input.provenance.reportExecutionJobId, evidenceSnapshotId: input.provenance.evidenceSnapshotId ?? null, passportId: input.provenance.evidencePassportId ?? null }
        : null,
    }),
    evaluateBusinessQuestion<Record<string, unknown>>({
      id: 'report.after-action',
      label: 'هل لدينا نتيجة فعلية بعد الإجراء؟',
      requiredFields: [],
      minimumSample: 1,
      priority: 50,
      availableFields: input.availableFields,
      sampleSize: input.sampleSize,
      answer: null,
    }),
  ];

  const archetypeFamily: BusinessArchetype = input.archetypeId?.startsWith('sales.')
    ? 'sales'
    : input.archetypeId?.startsWith('purchases.')
      ? 'purchases'
      : input.archetypeId?.startsWith('inventory.')
        ? 'inventory'
        : input.archetypeId?.startsWith('receivables.')
          ? 'receivables'
          : input.archetypeId?.startsWith('payments.')
            ? 'payments'
            : input.archetypeId?.startsWith('profitability.')
              ? 'profitability'
              : 'generic';
  const specialized = buildBusinessQuestionSet<Record<string, unknown>>(archetypeFamily, evaluateBusinessQuestion, {
    availableFields: input.availableFields,
    sampleSize: input.sampleSize,
    answers: {},
  }).filter((question) => !universal.some((existing) => existing.id === question.id));

  return sortBusinessQuestions([...universal, ...specialized]);
}

export function buildAdvisoryPacket(input: AdvisoryPacketInput): AdvisoryPacket {
  const claims = buildClaimsFromReportIntelligence({
    intelligence: input.intelligence,
    provenance: input.provenance,
    inputFields: input.availableFields,
    sampleSize: input.sampleSize,
    scope: input.scope,
    archetypeId: input.archetypeId,
    profileVersion: input.profileVersion,
  });

  const questions = buildQuestions(input, claims);
  const primarySignal = claims.find((claim) => claim.claimId.startsWith('signal:')) ?? null;
  const nextRecommendation = claims.find((claim) => claim.claimId.startsWith('recommendation:')) ?? null;
  const proofState = claimStateForProof(input.provenance);

  return {
    claims,
    questions,
    primarySignal,
    nextRecommendation,
    proofState,
    actionState: nextRecommendation ? (proofState === 'VERIFIED' ? 'ACTIONABLE' : 'REVIEW_REQUIRED') : 'NOT_AVAILABLE',
    outcomeState: 'INSUFFICIENT',
  };
}
