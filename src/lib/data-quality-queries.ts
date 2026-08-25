import { supabase } from './supabase';

/**
 * Tenant-native data-quality reads.
 *
 * Security is intentionally delegated to Supabase RLS/current_company_id().
 * The UI does not receive or supply a company identifier.
 *
 * Projections are deliberately bounded to fields consumed by DataQualityPage.
 * This reduces payload size without changing tenant semantics or metric inputs.
 */
export interface DataQualityDatasets {
  customers: Record<string, unknown>[];
  products: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
  balances: Record<string, unknown>[];
}

export async function fetchDataQualityDatasets(): Promise<DataQualityDatasets> {
  const [customersRes, productsRes, invoicesRes, balancesRes] = await Promise.all([
    supabase.from('customers').select('name,phone,code'),
    supabase.from('products').select('sku,name,cost_price,selling_price,reorder_point'),
    supabase.from('sales_invoices').select('total,paid_amount,customer_id,invoice_date,invoice_number'),
    supabase.from('inventory_balances').select('quantity,unit_cost,product_id,warehouse_id'),
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
