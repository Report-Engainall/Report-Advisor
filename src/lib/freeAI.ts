import { DEFAULT_AI_RUNTIME_POLICY, type AIRuntimePolicy } from './aiRuntimePolicy';

export interface FreeAIResult {
  text: string;
  engine: 'deterministic' | 'browser' | 'free-hosted' | 'unavailable';
  confidence: number;
  warnings: string[];
}

export interface FreeAIContext {
  question: string;
  facts?: Array<{ label: string; value: string | number; unit?: string }>;
}

/**
 * Zero-cost policy boundary. This module deliberately does not contain API keys,
 * paid provider URLs, or pay-as-you-go fallbacks. Business facts are summarized
 * deterministically first; an optional browser model may only explain them.
 */
export function answerWithFreePolicy(context: FreeAIContext, policy: AIRuntimePolicy = DEFAULT_AI_RUNTIME_POLICY): FreeAIResult {
  const facts = context.facts ?? [];
  if (!context.question.trim()) {
    return { text: 'يرجى كتابة السؤال.', engine: 'deterministic', confidence: 1, warnings: [] };
  }

  if (facts.length > 0) {
    const summary = facts.map(f => `${f.label}: ${f.value}${f.unit ? ` ${f.unit}` : ''}`).join('، ');
    return {
      text: `النتيجة المبنية على البيانات الفعلية: ${summary}`,
      engine: 'deterministic',
      confidence: 0.95,
      warnings: policy.allowBrowserModels ? ['يمكن استخدام نموذج المتصفح اختياريًا لتحسين الصياغة فقط.'] : [],
    };
  }

  return {
    text: 'لا توجد حقائق بيانات كافية للإجابة. لن يتم توليد رقم أو معلومة تخمينية.',
    engine: 'unavailable',
    confidence: 0,
    warnings: ['insufficient_data'],
  };
}
