export const TRACE_KEYS = ['user_action_id', 'request_id', 'job_id', 'import_id', 'evidence_id', 'report_id', 'decision_id', 'outcome_id', 'tenant_id'] as const;
export type TraceContext = Record<(typeof TRACE_KEYS)[number], string>;

export function requireTraceContext(input: Partial<TraceContext>): TraceContext {
  for (const key of TRACE_KEYS) if (!input[key]) throw new Error(`TRACE_CONTEXT_MISSING:${key}`);
  return Object.freeze({ ...input } as TraceContext);
}

const REDACT_KEYS = /(?:email|phone|mobile|address|name|token|secret|password|authorization|cookie|api.?key)/i;
export function redactTraceMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, REDACT_KEYS.test(key) ? '[REDACTED]' : value]));
}

export function childTrace(parent: TraceContext, patch: Partial<TraceContext>): TraceContext {
  return requireTraceContext({ ...parent, ...patch });
}
