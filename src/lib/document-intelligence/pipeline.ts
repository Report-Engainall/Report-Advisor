import { buildRelationshipGraph, classifyTable, inferHeaderlessSchema, type EntityResolution } from './hardening';
import { profileColumns, type ColumnProfile } from './schema-discovery';
import { routeMany, type RoutingDecision } from './routing';
import { decideReview, type Criticality, validateInvoiceTotals, validateLineMath, type ValidationIssue } from './validation';

export type DocumentPreflightInput = {
  rows: unknown[][];
  headers?: unknown[];
  sourceHash: string;
};

export type DocumentPreflightResult = {
  profiles: ColumnProfile[];
  table: ReturnType<typeof classifyTable>;
  headerlessInference: ReturnType<typeof inferHeaderlessSchema>;
  routes: RoutingDecision[];
  issues: ValidationIssue[];
  status: 'READY' | 'REVIEW' | 'QUARANTINE';
  sourceHash: string;
};

export function runDocumentPreflight(input: DocumentPreflightInput): DocumentPreflightResult {
  const profiles = profileColumns(input.rows, input.headers ?? []);
  const graph = buildRelationshipGraph(profiles);
  const table = classifyTable(profiles, input.headers ?? []);
  const headerlessInference = inferHeaderlessSchema(profiles, graph);
  const fields = headerlessInference
    .filter(item => item.field)
    .map(item => ({ field: item.field as string, confidence: item.confidence }));
  const routes = routeMany(fields);

  const issues: ValidationIssue[] = [];
  for (const row of input.rows) {
    const record = Object.fromEntries(
      profiles.map(profile => [profile.candidates[0]?.field ?? `column_${profile.index}`, row[profile.index]])
    );
    issues.push(...validateLineMath(record), ...validateInvoiceTotals(record));
  }

  const criticalRoutes = routes.filter(route => route.criticality === 'CRITICAL' || route.criticality === 'HIGH');
  const criticalDecision = criticalRoutes.length
    ? criticalRoutes.map(route => decideReview({ confidence: route.confidence, criticality: route.criticality as Criticality })).reduce((worst, current) => {
        const rank = { AUTO_APPROVE: 0, REVIEW: 1, QUARANTINE: 2 } as const;
        return rank[current.status] > rank[worst.status] ? current : worst;
      })
    : decideReview({ confidence: table.score, criticality: 'MEDIUM', evidence: table.evidence });

  const status = issues.some(issue => issue.status === 'FAIL') || criticalDecision.status === 'QUARANTINE'
    ? 'QUARANTINE'
    : criticalDecision.status === 'REVIEW' || issues.some(issue => issue.status === 'WARN')
      ? 'REVIEW'
      : 'READY';

  return { profiles, table, headerlessInference, routes, issues, status, sourceHash: input.sourceHash };
}

export function assertEntityResolutionSafe(resolution: EntityResolution): void {
  if (resolution.action === 'QUARANTINE') {
    throw new Error(`Entity resolution quarantined for ${resolution.canonicalField}: ${resolution.sourceValue}`);
  }
}
