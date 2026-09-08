import { supabase, resolveCurrentCompanyId } from './supabase';
import { rankAlternativeCandidates, type AlternativeCandidate, type RankedAlternative } from './alternative-ranking';

export type AlternativeGroup = {
  groupId: string;
  groupName: string;
  description: string | null;
  baseUnit: string;
  isActive: boolean;
  members: RankedAlternative[];
};

type RpcGroup = {
  group_id: string;
  group_name: string;
  description: string | null;
  base_unit: string;
  is_active: boolean;
  members: Array<Record<string, unknown>>;
};

function asCandidate(row: Record<string, unknown>): AlternativeCandidate {
  return {
    memberId: String(row.member_id ?? ''),
    sku: String(row.sku ?? ''),
    conversionFactor: Number(row.conversion_factor ?? 1),
    productId: typeof row.product_id === 'string' ? row.product_id : null,
    productName: typeof row.product_name === 'string' ? row.product_name : null,
    unit: typeof row.unit === 'string' ? row.unit : null,
    productActive: row.is_product_active !== false,
    costPrice: row.cost_price == null ? null : Number(row.cost_price),
    sellingPrice: row.selling_price == null ? null : Number(row.selling_price),
  };
}

export async function fetchAlternativeGroups(limit = 100): Promise<AlternativeGroup[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) throw new Error('ALTERNATIVE_QUERY_INVALID_LIMIT');
  const { data, error } = await supabase.rpc('get_alternative_item_groups', { p_limit: limit });
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error('ALTERNATIVE_DATA_UNAVAILABLE');
  return (data as RpcGroup[]).map((group) => ({
    groupId: group.group_id,
    groupName: group.group_name,
    description: group.description,
    baseUnit: group.base_unit,
    isActive: group.is_active,
    members: rankAlternativeCandidates((group.members ?? []).map(asCandidate)),
  }));
}
