import { supabase, resolveCurrentCompanyId } from './supabase';
import type { InventoryBalance, PurchaseInvoice, SalesInvoice } from './types';

const EXPORT_PAGE_SIZE = 500;
const EXPORT_MAX_ROWS = 5000;

async function tenantId(): Promise<string> {
  const id = await resolveCurrentCompanyId();
  if (!id) throw new Error('TENANT_REQUIRED');
  return id;
}

async function paged<T>(table: 'sales_invoices' | 'purchase_invoices' | 'inventory_balances', select: string): Promise<T[]> {
  const companyId = await tenantId();
  const { count, error: countError } = await supabase.from(table).select('id', { count: 'exact', head: true }).eq('company_id', companyId);
  if (countError) throw countError;
  const total = count ?? 0;
  if (total > EXPORT_MAX_ROWS) throw new Error(`EXPORT_DATASET_TOO_LARGE:${total}>${EXPORT_MAX_ROWS}`);
  const rows: T[] = [];
  for (let offset = 0; offset < total; offset += EXPORT_PAGE_SIZE) {
    const { data, error } = await supabase.from(table).select(select).eq('company_id', companyId).range(offset, Math.min(offset + EXPORT_PAGE_SIZE - 1, total - 1));
    if (error) throw error;
    rows.push(...((data ?? []) as T[]));
  }
  return rows;
}

export async function fetchSalesInvoicesForExport(): Promise<SalesInvoice[]> {
  return paged<SalesInvoice>('sales_invoices', '*, customer:customers(id,name)');
}

export async function fetchPurchaseInvoicesForExport(): Promise<PurchaseInvoice[]> {
  return paged<PurchaseInvoice>('purchase_invoices', '*, supplier:suppliers(id,name)');
}

export async function fetchInventoryBalancesForExport(): Promise<InventoryBalance[]> {
  return paged<InventoryBalance>('inventory_balances', '*, product:products(id,name,reorder_point), warehouse:warehouses(id,name)');
}
