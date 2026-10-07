import { supabase, resolveCurrentCompanyId } from './supabase';

export type ProfitabilityScenarioAssumptions = {
  schemaVersion: 1;
  source: {
    type: 'profitability_snapshot';
    asOf: string;
    currency: string;
  };
  baseline: {
    revenue: number;
    cost: number;
  };
  variables: {
    priceChange: number;
    volumeChange: number;
    costChange: number;
  };
  constraints: {
    priceMin: number;
    priceMax: number;
    volumeMin: number;
    volumeMax: number;
    costMin: number;
    costMax: number;
  };
  boundary: 'DETERMINISTIC_SENSITIVITY_NOT_FORECAST';
};

export type ProfitabilityScenarioOutputs = {
  baseline: {
    revenue: number;
    cost: number;
    profit: number;
    margin: number | null;
  };
  scenario: {
    revenue: number;
    cost: number;
    profit: number;
    margin: number | null;
    revenueDelta: number;
    costDelta: number;
    profitDelta: number;
    profitChange: number | null;
    marginDelta: number | null;
  };
  result: 'IMPROVES_PROFIT' | 'REDUCES_PROFIT' | 'NEUTRAL';
  runKey: string;
  resultHash: string;
  computedAt: string;
};

export type GovernedScenarioRecord = {
  id: string;
  scenarioKey: string;
  assumptions: ProfitabilityScenarioAssumptions;
  outputs: ProfitabilityScenarioOutputs;
  confidence: number | null;
  riskScore: number | null;
  status: string;
  createdAt: string;
};

const LATEST_KEY = 'profitability-sensitivity-latest';

const requireTenant = async (): Promise<string> => {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  return companyId;
};

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const record = value as Record<string, unknown>;
  return '{' + Object.keys(record).sort().map((key) => JSON.stringify(key) + ':' + stableStringify(record[key])).join(',') + '}';
}

export async function sha256Text(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function buildScenarioRunKey(assumptions: ProfitabilityScenarioAssumptions): Promise<string> {
  const hash = await sha256Text(stableStringify(assumptions));
  return `profitability-sensitivity-v1:${assumptions.source.asOf}:${hash.slice(0, 24)}`;
}

function parseRecord(row: Record<string, unknown>): GovernedScenarioRecord {
  return {
    id: String(row.id),
    scenarioKey: String(row.scenario_key),
    assumptions: row.assumptions as ProfitabilityScenarioAssumptions,
    outputs: row.outputs as ProfitabilityScenarioOutputs,
    confidence: row.confidence == null ? null : Number(row.confidence),
    riskScore: row.risk_score == null ? null : Number(row.risk_score),
    status: String(row.status),
    createdAt: String(row.created_at),
  };
}

export async function fetchLatestGovernedScenario(): Promise<GovernedScenarioRecord | null> {
  const companyId = await requireTenant();
  const { data, error } = await supabase
    .from('governed_scenarios')
    .select('id,scenario_key,assumptions,outputs,confidence,risk_score,status,created_at')
    .eq('company_id', companyId)
    .eq('scenario_key', LATEST_KEY)
    .maybeSingle();
  if (error) throw error;
  return data ? parseRecord(data as Record<string, unknown>) : null;
}

export async function saveGovernedScenario(
  assumptions: ProfitabilityScenarioAssumptions,
  outputs: Omit<ProfitabilityScenarioOutputs, 'runKey' | 'resultHash' | 'computedAt'>,
): Promise<GovernedScenarioRecord> {
  const companyId = await requireTenant();
  const computedAt = new Date().toISOString();
  const runKey = await buildScenarioRunKey(assumptions);
  const resultHash = await sha256Text(stableStringify({ assumptions, outputs }));

  const fullOutputs: ProfitabilityScenarioOutputs = { ...outputs, runKey, resultHash, computedAt };
  const evidence = {
    provenance: assumptions.source,
    deterministic: true,
    formula: 'revenue = baseRevenue × (1 + volumeChange) × (1 + priceChange); cost = baseCost × (1 + costChange) × (1 + volumeChange)',
    boundary: assumptions.boundary,
    runKey,
    resultHash,
    savedAt: computedAt,
  };

  const immutable = {
    company_id: companyId,
    scenario_key: runKey,
    assumptions,
    outputs: fullOutputs,
    confidence: null,
    risk_score: null,
    status: 'simulated',
    expires_at: null,
  };
  const { error: immutableError } = await supabase
    .from('governed_scenarios')
    .upsert(immutable, { onConflict: 'company_id,scenario_key' });
  if (immutableError) throw immutableError;

  const { data: latestRow, error: latestReadError } = await supabase
    .from('governed_scenarios')
    .select('outputs')
    .eq('company_id', companyId)
    .eq('scenario_key', LATEST_KEY)
    .maybeSingle();
  if (latestReadError) throw latestReadError;

  const previousOutputs = latestRow?.outputs && typeof latestRow.outputs === 'object'
    ? latestRow.outputs as Record<string, unknown>
    : {};
  const priorAudit = Array.isArray(previousOutputs.auditTrail) ? previousOutputs.auditTrail : [];

  const latestOutputs = {
    ...fullOutputs,
    auditTrail: [
      ...priorAudit.slice(-19),
      { event: 'SIMULATED', runKey, resultHash, at: computedAt },
    ],
    evidence,
  };

  const { data: latest, error: latestError } = await supabase
    .from('governed_scenarios')
    .upsert({
      company_id: companyId,
      scenario_key: LATEST_KEY,
      assumptions,
      outputs: latestOutputs,
      confidence: null,
      risk_score: null,
      status: 'simulated',
      expires_at: null,
    }, { onConflict: 'company_id,scenario_key' })
    .select('id,scenario_key,assumptions,outputs,confidence,risk_score,status,created_at')
    .single();
  if (latestError) throw latestError;

  return parseRecord(latest as Record<string, unknown>);
}

export function isValidScenarioRecord(record: GovernedScenarioRecord): boolean {
  return record.assumptions?.schemaVersion === 1
    && record.assumptions?.boundary === 'DETERMINISTIC_SENSITIVITY_NOT_FORECAST'
    && Number.isFinite(record.assumptions?.baseline?.revenue)
    && Number.isFinite(record.assumptions?.baseline?.cost)
    && Number.isFinite(record.outputs?.scenario?.profit)
    && Boolean(record.outputs?.runKey)
    && Boolean(record.outputs?.resultHash);
}
