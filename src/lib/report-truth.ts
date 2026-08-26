import { supabase } from './supabase';

export interface InventoryReportRow {
  id: string;
  company_id: string;
  warehouse_id: string | null;
  product_id: string;
  quantity: number | null;
  unit_cost: number | null;
  last_movement_date: string | null;
  product: { id: string; name: string | null; reorder_point: number | null } | null;
  warehouse: { id: string; name: string | null } | null;
}

export interface InventoryReportSnapshot {
  rows: InventoryReportRow[];
  totalRows: number;
  totalValue: number | null;
  incompleteRows: number;
  status: 'CALCULATED' | 'INSUFFICIENT_DATA';
}

export async function fetchInventoryReportSnapshot(page = 0, pageSize = 25): Promise<InventoryReportSnapshot> {
  if (!Number.isInteger(page) || page < 0) throw new Error('REPORT_QUERY_INVALID_PAGE');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 500) throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');

  const { data, error } = await supabase.rpc('report_inventory_snapshot', {
    p_page: page,
    p_page_size: pageSize,
  });
  if (error) throw error;

  const rows = (data ?? []) as Array<InventoryReportRow & {
    total_rows: number;
    total_value: number | null;
    incomplete_rows: number;
  }>;
  const first = rows[0];
  const totalRows = Number(first?.total_rows ?? 0);
  const incompleteRows = Number(first?.incomplete_rows ?? 0);
  const totalValue = first?.total_value == null ? null : Number(first.total_value);

  return {
    rows: rows.map(({ total_rows: _totalRows, total_value: _totalValue, incomplete_rows: _incompleteRows, ...row }) => row),
    totalRows,
    totalValue,
    incompleteRows,
    status: totalRows === 0 || incompleteRows > 0 || totalValue == null ? 'INSUFFICIENT_DATA' : 'CALCULATED',
  };
}

export interface PurchaseReportSummary {
  totalPurchases: number | null;
  invoiceCount: number;
  supplierCount: number;
  averagePurchase: number | null;
  incompleteRows: number;
  status: 'CALCULATED' | 'INSUFFICIENT_DATA';
}

export async function fetchPurchaseReportSummary(): Promise<PurchaseReportSummary> {
  const { data, error } = await supabase.rpc('report_purchase_summary');
  if (error) throw error;
  const row = ((data ?? []) as Array<{
    total_purchases: number | null;
    invoice_count: number;
    supplier_count: number;
    average_purchase: number | null;
    incomplete_rows: number;
    status: PurchaseReportSummary['status'];
  }>)[0];
  if (!row) {
    return { totalPurchases: null, invoiceCount: 0, supplierCount: 0, averagePurchase: null, incompleteRows: 0, status: 'INSUFFICIENT_DATA' };
  }
  return {
    totalPurchases: row.total_purchases == null ? null : Number(row.total_purchases),
    invoiceCount: Number(row.invoice_count),
    supplierCount: Number(row.supplier_count),
    averagePurchase: row.average_purchase == null ? null : Number(row.average_purchase),
    incompleteRows: Number(row.incomplete_rows),
    status: row.status,
  };
}
