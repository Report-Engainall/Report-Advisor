import { describe, expect, it } from 'vitest';
import { inferSourceDomain, resolveCanonicalEntityType, sourceDomainLabel } from './source-domain';

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

  it('promotes fully mapped products/customers/sales sources to real canonical targets', () => {
    expect(resolveCanonicalEntityType('product-master', [
      { mappedField: 'sku' }, { mappedField: 'name' }, { mappedField: 'unit' }, { mappedField: 'cost_price' },
      { mappedField: 'selling_price' }, { mappedField: 'min_stock' }, { mappedField: 'reorder_point' }, { mappedField: 'is_active' },
    ])).toBe('products');
    expect(resolveCanonicalEntityType('customer-master', [
      { mappedField: 'name' }, { mappedField: 'code' }, { mappedField: 'segment' }, { mappedField: 'credit_limit' }, { mappedField: 'payment_terms_days' },
    ])).toBe('customers');
    expect(resolveCanonicalEntityType('sales-invoice', [
      { mappedField: 'invoice_number' }, { mappedField: 'invoice_date' }, { mappedField: 'subtotal' }, { mappedField: 'tax_amount' },
      { mappedField: 'total' }, { mappedField: 'paid_amount' }, { mappedField: 'status' },
    ])).toBe('sales_invoices');
  });

  it('promotes customer-name aliases when the remaining customer fields are complete', () => {
    expect(resolveCanonicalEntityType('customer-master', [
      { mappedField: 'customer_name' }, { mappedField: 'segment' }, { mappedField: 'credit_limit' }, { mappedField: 'payment_terms_days' },
    ])).toBe('customers');
  });

  it('keeps specialized but incomplete sources in the generic canonical evidence lane', () => {
    expect(resolveCanonicalEntityType('product-master', [
      { mappedField: 'sku' }, { mappedField: 'name' }, { mappedField: 'unit' },
    ])).toBe('generic:product-master');
  });

  it('preserves unknown generic sources as a safe fallback', () => {
    expect(inferSourceDomain([{ mappedField: null }])).toBe('source-data');
    expect(sourceDomainLabel('generic:inventory-report')).toBe('تقرير مخزون');
    expect(sourceDomainLabel('generic:unrecognized-domain')).toBe('generic:unrecognized-domain');
  });
});
