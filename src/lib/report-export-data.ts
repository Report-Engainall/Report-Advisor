import { supabase, resolveCurrentCompanyId } from './supabase';
import type { PurchaseInvoice, SalesInvoice } from './types';

const EXPORT_PAGE_SIZE = 500;
const EXPORT_MAX_ROWS = 5000;

async function tenantId(): Promise<string> {
  const id = await resolveCurrentCompanyId();
  if (!id) throw new Error('TENANT_REQUIRED');
  return id;
}

async function paged<T>(table: 'sales_invoices' | 'purchase_invoices', select: string): Promise<T[]> {
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

export interface InventoryExportRow {
  id: string;
  product_id: string | null;
  product_name: string | null;
  warehouse_id: string | null;
  warehouse_name: string | null;
  quantity: number | null;
  unit_cost: number | null;
  value: number | null;
  value_status: 'CALCULATED' | 'INSUFFICIENT_DATA';
}

export interface InventoryExportResult {
  status: 'CALCULATED' | 'INSUFFICIENT_DATA';
  rows: InventoryExportRow[];
}

export async function fetchInventoryBalancesForExport(): Promise<InventoryExportResult> {
  const companyId = await tenantId();
  const { data, error } = await supabase.rpc('get_inventory_export_truth', { p_company_id: companyId });
  if (error) throw error;
  const payload = (data ?? {}) as { status?: string; rows?: unknown[] };
  const rows = Array.isArray(payload.rows) ? payload.rows.map((raw): InventoryExportRow => {
    const row = raw as Record<string, unknown>;
    const finite = (value: unknown): number | null => {
      if (value === null || value === undefined) return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };
    return {
      id: String(row.id ?? ''),
      product_id: row.product_id == null ? null : String(row.product_id),
      product_name: row.product_name == null ? null : String(row.product_name),
      warehouse_id: row.warehouse_id == null ? null : String(row.warehouse_id),
      warehouse_name: row.warehouse_name == null ? null : String(row.warehouse_name),
      quantity: finite(row.quantity),
      unit_cost: finite(row.unit_cost),
      value: finite(row.value),
      value_status: row.value_status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED',
    };
  }) : [];
  return {
    status: payload.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED',
    rows,
  };
}
