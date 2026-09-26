import { describe, expect, it } from 'vitest';
import { inferSourceDomain, sourceDomainLabel } from './source-domain';

describe('source-domain classification contract', () => {
  it('classifies Arabic inventory reports from canonical inventory fields', () => {
    expect(inferSourceDomain([
      { mappedField: 'name' },
      { mappedField: 'sku' },
      { mappedField: 'warehouse' },
      { mappedField: 'received_quantity' },
      { mappedField: 'stock_balance' },
    ])).toBe('inventory-report');
  });

  it('classifies Arabic sales invoices from invoice identity and totals', () => {
    expect(inferSourceDomain([
      { mappedField: 'invoice_number' },
      { mappedField: 'invoice_date' },
      { mappedField: 'subtotal' },
      { mappedField: 'total' },
    ])).toBe('sales-invoice');
  });

  it('classifies customer masters only when customer identity and contact/segment evidence coexist', () => {
    expect(inferSourceDomain([
      { mappedField: 'customer_name' },
      { mappedField: 'code' },
      { mappedField: 'phone' },
      { mappedField: 'segment' },
    ])).toBe('customer-master');
  });

  it('classifies payments without inventing a specialized database entity', () => {
    expect(inferSourceDomain([
      { mappedField: 'paid_amount' },
      { mappedField: 'payment_date' },
      { mappedField: 'payment_method' },
    ])).toBe('payment-report');
  });

  it('preserves unknown generic sources as a safe fallback', () => {
    expect(inferSourceDomain([{ mappedField: null }])).toBe('source-data');
    expect(sourceDomainLabel('generic:inventory-report')).toBe('تقرير مخزون');
    expect(sourceDomainLabel('generic:unrecognized-domain')).toBe('generic:unrecognized-domain');
  });
});
