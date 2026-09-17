export interface ReportExecutionScope {
  tenantId: string;
  dataset: string;
  from: string;
  to: string;
  asOf: string;
  statusPolicy: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`REPORT_SCOPE_${field.toUpperCase()}_REQUIRED`);
  return value.trim();
}

function requiredDate(value: unknown, field: string): string {
  const result = requiredString(value, field);
  if (!ISO_DATE.test(result)) throw new Error(`REPORT_SCOPE_${field.toUpperCase()}_INVALID`);
  const parsed = new Date(`${result}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== result) {
    throw new Error(`REPORT_SCOPE_${field.toUpperCase()}_INVALID`);
  }
  return result;
}

/** Resolve the generic request parameters into an explicit, auditable report scope. */
export function resolveReportExecutionScope(input: {
  tenantId: unknown;
  parameters: Record<string, unknown>;
}): ReportExecutionScope {
  const tenantId = requiredString(input.tenantId, 'tenant');
  if (!input.parameters || typeof input.parameters !== 'object' || Array.isArray(input.parameters)) {
    throw new Error('REPORT_SCOPE_PARAMETERS_INVALID');
  }
  const parameters = input.parameters;
  const from = requiredDate(parameters.from, 'from');
  const to = requiredDate(parameters.to, 'to');
  const asOf = requiredDate(parameters.asOf, 'asOf');
  if (from > to) throw new Error('REPORT_SCOPE_PERIOD_INVALID');
  if (asOf < to) throw new Error('REPORT_SCOPE_AS_OF_BEFORE_PERIOD_END');
  return {
    tenantId,
    dataset: requiredString(parameters.dataset, 'dataset'),
    from,
    to,
    asOf,
    statusPolicy: requiredString(parameters.statusPolicy, 'statusPolicy'),
  };
}
