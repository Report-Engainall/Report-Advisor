import { preferredBackends, type AICapabilityBackend } from './aiCapabilityRegistry';
import { chooseDocumentRoute, type DocumentPlan, type DocumentProfile } from './free-toolbox/document-route';

export type DocumentCapability = 'document-parsing' | 'ocr' | 'table-extraction';
export type DocumentBackendStatus = 'AVAILABLE' | 'OPTIONAL' | 'UNAVAILABLE';

export interface DocumentBackendChoice {
  capability: DocumentCapability;
  backend: AICapabilityBackend['backend'];
  status: DocumentBackendStatus;
  requiresInstall: boolean;
  mayCostMoney: boolean;
  reason: string;
}

export interface DocumentExtractionEnvelope {
  plan: DocumentPlan;
  choices: DocumentBackendChoice[];
  stage: 'PLANNED' | 'READY_FOR_EXTRACTION' | 'INSUFFICIENT_BACKEND';
  warnings: string[];
  facts: Array<{ field: string; value: string | number | null; confidence: number; source: string; page?: number }>;
}

function choose(capability: DocumentCapability): DocumentBackendChoice {
  const candidates = preferredBackends(capability);
  const deterministic = candidates.find(item => item.backend === 'deterministic' && !item.requiresUserDeviceInstall);
  const optional = candidates.find(item => item.optional && !item.requiresUserDeviceInstall);
  const selected = deterministic ?? optional ?? candidates[0];
  if (!selected) return { capability, backend: 'deterministic', status: 'UNAVAILABLE', requiresInstall: false, mayCostMoney: false, reason: 'لا يوجد backend مسجل لهذه القدرة.' };
  return {
    capability,
    backend: selected.backend,
    status: selected.optional ? 'OPTIONAL' : 'AVAILABLE',
    requiresInstall: Boolean(selected.requiresUserDeviceInstall),
    mayCostMoney: Boolean(selected.mayCostMoney),
    reason: selected.optional ? 'Backend اختياري؛ لا يغيّر المسار المجاني الأساسي.' : 'Backend أساسي مجاني ومتاح ضمن سياسة النظام.',
  };
}

export function planDocumentIntelligence(profile: DocumentProfile): DocumentExtractionEnvelope {
  const plan = chooseDocumentRoute(profile);
  const choices = [choose('document-parsing'), choose('table-extraction'), choose('ocr')];
  const requiredForPlan: DocumentCapability[] = plan.route === 'ocr' ? ['ocr'] : plan.route === 'table-extract' ? ['table-extraction'] : plan.route === 'hybrid' ? ['document-parsing', 'table-extraction'] : ['document-parsing'];
  const blocked = requiredForPlan.some(capability => choices.find(choice => choice.capability === capability)?.status === 'UNAVAILABLE');
  const installWarnings = choices.filter(choice => choice.requiresInstall).map(choice => `${choice.backend}: لا يُفرض على العميل.`);
  return {
    plan,
    choices,
    stage: blocked ? 'INSUFFICIENT_BACKEND' : 'READY_FOR_EXTRACTION',
    warnings: [
      ...installWarnings,
      ...choices.filter(choice => choice.mayCostMoney).map(choice => `${choice.backend}: محظور في المسار المجاني.`),
    ],
    facts: [],
  };
}

export function acceptExtractedFacts(envelope: DocumentExtractionEnvelope, facts: DocumentExtractionEnvelope['facts']): DocumentExtractionEnvelope {
  const valid = facts.filter(fact => Number.isFinite(fact.confidence) && fact.confidence >= 0 && fact.confidence <= 1 && Boolean(fact.source));
  return {
    ...envelope,
    stage: envelope.stage === 'INSUFFICIENT_BACKEND' ? envelope.stage : 'READY_FOR_EXTRACTION',
    facts: valid,
    warnings: [...envelope.warnings, ...(valid.length < facts.length ? ['تم رفض حقول مستخرجة تفتقد source أو confidence صالح.'] : [])],
  };
}
