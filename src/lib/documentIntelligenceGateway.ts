import { preferredBackends, type AICapabilityBackend } from './aiCapabilityRegistry';
import { chooseDocumentRoute, type DocumentPlan, type DocumentProfile } from './free-toolbox/document-route';
import type { Evidence } from './free-toolbox/evidence-ledger';
import type { EvidenceRef, LineageGraph } from './free-toolbox/data-lineage';

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

export interface DocumentExtractionFact {
  field: string;
  value: string | number | null;
  confidence: number;
  source: string;
  page?: number;
  location?: string;
  sourceDocumentId?: string;
  sourceHash?: string;
}

export interface DocumentExtractionEnvelope {
  plan: DocumentPlan;
  choices: DocumentBackendChoice[];
  stage: 'PLANNED' | 'READY_FOR_EXTRACTION' | 'INSUFFICIENT_BACKEND';
  warnings: string[];
  facts: DocumentExtractionFact[];
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

export function acceptExtractedFacts(envelope: DocumentExtractionEnvelope, facts: DocumentExtractionFact[]): DocumentExtractionEnvelope {
  const valid = facts.filter(fact => Number.isFinite(fact.confidence) && fact.confidence >= 0 && fact.confidence <= 1 && Boolean(fact.source));
  return {
    ...envelope,
    stage: envelope.stage === 'INSUFFICIENT_BACKEND' ? envelope.stage : 'READY_FOR_EXTRACTION',
    facts: valid,
    warnings: [...envelope.warnings, ...(valid.length < facts.length ? ['تم رفض حقول مستخرجة تفتقد source أو confidence صالح.'] : [])],
  };
}

function stableEvidenceId(fact: DocumentExtractionFact): string {
  return [fact.source, fact.sourceDocumentId, fact.sourceHash, fact.page, fact.location, fact.field].filter(value => value !== undefined && value !== '').join(':');
}

/**
 * Adapt only source-bearing extraction facts into the existing evidence ledger.
 * No document identity, location, confidence, or value is invented here.
 */
export function extractedFactsToEvidence(facts: DocumentExtractionFact[]): Evidence[] {
  return facts
    .filter(fact => Boolean(fact.source) && Number.isFinite(fact.confidence) && fact.confidence >= 0 && fact.confidence <= 1)
    .map(fact => ({
      id: stableEvidenceId(fact),
      sourceId: fact.source,
      sourceDocumentId: fact.sourceDocumentId,
      sourceHash: fact.sourceHash,
      page: fact.page,
      location: fact.location,
      method: 'derived',
      field: fact.field,
      raw: fact.value === null ? undefined : String(fact.value),
      normalized: fact.value,
      confidence: fact.confidence,
    }));
}

function toLineageEvidence(evidence: Evidence): EvidenceRef {
  return {
    sourceId: evidence.sourceId,
    sourceDocumentId: evidence.sourceDocumentId,
    sourceHash: evidence.sourceHash,
    label: evidence.field ?? 'document fact',
    location: evidence.location ?? (evidence.page !== undefined ? `page:${evidence.page}` : undefined),
    value: typeof evidence.normalized === 'string' || typeof evidence.normalized === 'number' ? evidence.normalized : undefined,
  };
}

function provenanceKey(evidence: Evidence): string {
  return [evidence.sourceId, evidence.sourceDocumentId, evidence.sourceHash]
    .filter(value => value !== undefined && value !== '')
    .join(':');
}

/**
 * Attach extracted facts to an already-existing lineage target (insight/metric/decision).
 * The target id must already exist; this function never fabricates downstream nodes.
 */
export function attachExtractedFactsToLineage(graph: LineageGraph, facts: DocumentExtractionFact[], targetId: string): LineageGraph {
  const evidence = extractedFactsToEvidence(facts);
  if (!graph.nodes.some(node => node.id === targetId) || evidence.length === 0) return graph;

  const additions = evidence.flatMap(item => {
    const sourceKey = provenanceKey(item);
    const sourceNodeId = `document-source:${sourceKey}`;
    const factNodeId = `document-fact:${sourceKey}:${item.field}`;
    const sourceLabel = item.sourceDocumentId ? `${item.sourceId} (${item.sourceDocumentId})` : item.sourceId;
    const lineageEvidence = toLineageEvidence(item);
    return [
      { id: sourceNodeId, type: 'source' as const, label: sourceLabel, evidence: [lineageEvidence] },
      { id: factNodeId, type: 'metric' as const, label: item.field ?? 'document fact', evidence: [lineageEvidence] },
    ];
  });

  const uniqueNodes = [...graph.nodes];
  for (const node of additions) {
    if (!uniqueNodes.some(existing => existing.id === node.id)) uniqueNodes.push(node);
  }

  const edges = [...graph.edges];
  for (const item of evidence) {
    const sourceKey = provenanceKey(item);
    const sourceNodeId = `document-source:${sourceKey}`;
    const factNodeId = `document-fact:${sourceKey}:${item.field}`;
    if (!edges.some(edge => edge.from === sourceNodeId && edge.to === factNodeId)) edges.push({ from: sourceNodeId, to: factNodeId, label: 'extracted-from' });
    if (!edges.some(edge => edge.from === factNodeId && edge.to === targetId)) edges.push({ from: factNodeId, to: targetId, label: 'supports' });
  }

  return { nodes: uniqueNodes, edges };
}
