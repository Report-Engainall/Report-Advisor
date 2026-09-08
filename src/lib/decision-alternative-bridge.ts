import type { Recommendation } from './types';
import type { AlternativeGroup, } from './alternative-queries';
import type { RankedAlternative } from './alternative-ranking';

export type DecisionAlternative = RankedAlternative & {
  recommendationId: string;
  groupId: string;
  groupName: string;
  selectionEligible: boolean;
  selectionReason: string;
};

/**
 * Bridges an existing recommendation to existing alternative master data.
 * It is deliberately read-only: it never creates or mutates alternatives or decisions.
 */
export function buildDecisionAlternatives(
  recommendation: Recommendation | null,
  groups: AlternativeGroup[],
): DecisionAlternative[] {
  if (!recommendation) return [];
  return groups
    .filter(group => group.isActive)
    .flatMap(group => group.members.map(member => ({
      ...member,
      recommendationId: recommendation.id,
      groupId: group.groupId,
      groupName: group.groupName,
      selectionEligible: member.productActive,
      selectionReason: member.productActive
        ? `بديل فعّال من مجموعة ${group.groupName}`
        : 'المنتج المرتبط بالبديل غير فعّال؛ لا يُرشّح للتنفيذ',
    })))
    .sort((a, b) => (Number(b.selectionEligible) - Number(a.selectionEligible)) || (b.finalScore - a.finalScore) || a.sku.localeCompare(b.sku));
}
