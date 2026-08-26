import { fetchPurchaseInvoices, fetchSalesInvoices } from '@/lib/queries';
import type { PurchaseInvoice, SalesInvoice } from '@/lib/types';

const PAGE_SIZE = 500;

export async function fetchAllSalesInvoices(): Promise<SalesInvoice[]> {
  const rows: SalesInvoice[] = [];
  let page = 0;
  for (;;) {
    const result = await fetchSalesInvoices(page, PAGE_SIZE);
    rows.push(...result.data);
    if (result.data.length === 0 || result.data.length < PAGE_SIZE || result.count == null || rows.length >= result.count) return rows;
    page += 1;
  }
}

export async function fetchAllPurchaseInvoices(): Promise<PurchaseInvoice[]> {
  const rows: PurchaseInvoice[] = [];
  let page = 0;
  for (;;) {
    const result = await fetchPurchaseInvoices(page, PAGE_SIZE);
    rows.push(...result.data);
    if (result.data.length === 0 || result.data.length < PAGE_SIZE || result.count == null || rows.length >= result.count) return rows;
    page += 1;
  }
}
