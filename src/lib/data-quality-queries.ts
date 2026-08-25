import { supabase } from './supabase';

/**
 * Tenant-native data-quality reads.
 *
 * Security is intentionally delegated to Supabase RLS/current_company_id().
 * The UI does not receive or supply a company identifier.
 */
export interface DataQualityDatasets {
  customers: Record<string, unknown>[];
  products: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
  balances: Record<string, unknown>[];
}

export async function fetchDataQualityDatasets(): Promise<DataQualityDatasets> {
  const [customersRes, productsRes, invoicesRes, balancesRes] = await Promise.all([
    supabase.from('customers').select('*'),
    supabase.from('products').select('*'),
    supabase.from('sales_invoices').select('*'),
    supabase.from('inventory_balances').select('*'),
  ]);

  const firstError = customersRes.error || productsRes.error || invoicesRes.error || balancesRes.error;
  if (firstError) throw firstError;

  return {
    customers: (customersRes.data || []) as Record<string, unknown>[],
    products: (productsRes.data || []) as Record<string, unknown>[],
    invoices: (invoicesRes.data || []) as Record<string, unknown>[],
    balances: (balancesRes.data || []) as Record<string, unknown>[],
  };
}
