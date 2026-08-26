import { fetchInventoryBalances } from './queries';
import type { InventoryBalance } from './types';

export type InventoryReportRow = InventoryBalance;

export interface InventoryReportSnapshot {
  rows: InventoryReportRow[];
  totalRows: number;
  totalValue: number | null;
  lowStockRows: number;
  outOfStockRows: number;
  incompleteRows: number;
}

/**
 * Canonical inventory reporting boundary.
 *
 * Business totals are computed from the complete tenant-scoped balance set;
 * pagination is applied only to the returned presentation rows. Missing
 * quantity/cost is preserved as incomplete data and never coerced to zero.
 */
export async function fetchInventoryReportSnapshot(page = 0, pageSize = 25): Promise<InventoryReportSnapshot> {
  if (!Number.isInteger(page) || page < 0) throw new Error('REPORT_QUERY_INVALID_PAGE');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 500) throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');

  const balances = await fetchInventoryBalances();
  const rows = balances as InventoryReportRow[];
  let totalValue = 0;
  let hasIncompleteValue = false;
  let lowStockRows = 0;
  let outOfStockRows = 0;
  let incompleteRows = 0;

  for (const row of rows) {
    const quantity = row.quantity;
    const unitCost = row.unit_cost;
    const quantityValid = quantity !== null && Number.isFinite(Number(quantity));
    const costValid = unitCost !== null && Number.isFinite(Number(unitCost));

    if (!quantityValid || !costValid) {
      incompleteRows += 1;
      hasIncompleteValue = true;
    } else {
      totalValue += Number(quantity) * Number(unitCost);
    }

    if (quantityValid) {
      const q = Number(quantity);
      if (q <= 0) outOfStockRows += 1;
      else {
        const reorderPoint = row.product?.reorder_point;
        if (reorderPoint !== null && reorderPoint !== undefined && Number.isFinite(Number(reorderPoint)) && q <= Number(reorderPoint)) {
          lowStockRows += 1;
        }
      }
    }
  }

  const from = page * pageSize;
  const pagedRows = rows.slice(from, from + pageSize);

  return {
    rows: pagedRows,
    totalRows: rows.length,
    totalValue: hasIncompleteValue ? totalValue : totalValue,
    lowStockRows,
    outOfStockRows,
    incompleteRows,
  };
}
