export type AICapability = 'chat' | 'embedding' | 'document-parsing' | 'ocr' | 'table-extraction' | 'forecasting' | 'anomaly-detection';

export type AIBackendKind = 'ollama' | 'docling' | 'paddleocr' | 'tesseract' | 'deterministic' | 'supabase' | 'python';

export interface AICapabilityBackend {
  capability: AICapability;
  backend: AIBackendKind;
  priority: number;
  local: boolean;
  optional: boolean;
}

export const AI_CAPABILITY_REGISTRY: readonly AICapabilityBackend[] = [
  { capability: 'chat', backend: 'ollama', priority: 100, local: true, optional: true },
  { capability: 'embedding', backend: 'ollama', priority: 100, local: true, optional: true },
  { capability: 'document-parsing', backend: 'docling', priority: 100, local: true, optional: true },
  { capability: 'document-parsing', backend: 'deterministic', priority: 50, local: true, optional: false },
  { capability: 'ocr', backend: 'paddleocr', priority: 100, local: true, optional: true },
  { capability: 'ocr', backend: 'tesseract', priority: 50, local: true, optional: false },
  { capability: 'table-extraction', backend: 'docling', priority: 100, local: true, optional: true },
  { capability: 'table-extraction', backend: 'deterministic', priority: 50, local: true, optional: false },
  { capability: 'forecasting', backend: 'deterministic', priority: 100, local: true, optional: false },
  { capability: 'anomaly-detection', backend: 'deterministic', priority: 100, local: true, optional: false },
];

export function preferredBackends(capability: AICapability): AICapabilityBackend[] {
  return AI_CAPABILITY_REGISTRY.filter(item => item.capability === capability).sort((a, b) => b.priority - a.priority);
}

export function hasOptionalBackend(capability: AICapability, backend: AIBackendKind): boolean {
  return AI_CAPABILITY_REGISTRY.some(item => item.capability === capability && item.backend === backend && item.optional);
}
