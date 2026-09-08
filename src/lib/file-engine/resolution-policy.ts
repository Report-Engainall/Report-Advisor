import type { RowResolution } from './universal-intelligence';

export type ResolutionAction = 'write_new' | 'skip_exact' | 'review_duplicate' | 'review_conflict';

export type ResolutionDecision = {
  fingerprint: string;
  outcome: RowResolution['outcome'];
  action: ResolutionAction;
  allowedToWrite: boolean;
  reason: string;
};

export function decideResolution(resolution: RowResolution): ResolutionDecision {
  switch (resolution.outcome) {
    case 'new':
      return { fingerprint: resolution.fingerprint, outcome: resolution.outcome, action: 'write_new', allowedToWrite: true, reason: 'لا يوجد صف مطابق؛ يسمح بالكتابة الجديدة.' };
    case 'skip_exact':
      return { fingerprint: resolution.fingerprint, outcome: resolution.outcome, action: 'skip_exact', allowedToWrite: false, reason: 'تطابق حتمي؛ يمنع إنشاء نسخة ثانية.' };
    case 'candidate_duplicate':
      return { fingerprint: resolution.fingerprint, outcome: resolution.outcome, action: 'review_duplicate', allowedToWrite: false, reason: 'تشابه غير حاسم؛ يلزم قرار مراجعة قبل الكتابة.' };
    case 'conflict':
      return { fingerprint: resolution.fingerprint, outcome: resolution.outcome, action: 'review_conflict', allowedToWrite: false, reason: `تعارض في الحقول: ${resolution.differingFields.slice(0, 8).join(', ') || 'غير محدد'}.` };
  }
}

export function summarizeResolutionDecisions(resolutions: RowResolution[]): {
  newCount: number;
  exactSkipped: number;
  duplicateReview: number;
  conflictReview: number;
  writableCount: number;
  blockedCount: number;
} {
  const decisions = resolutions.map(decideResolution);
  return {
    newCount: decisions.filter((d) => d.action === 'write_new').length,
    exactSkipped: decisions.filter((d) => d.action === 'skip_exact').length,
    duplicateReview: decisions.filter((d) => d.action === 'review_duplicate').length,
    conflictReview: decisions.filter((d) => d.action === 'review_conflict').length,
    writableCount: decisions.filter((d) => d.allowedToWrite).length,
    blockedCount: decisions.filter((d) => !d.allowedToWrite).length,
  };
}
