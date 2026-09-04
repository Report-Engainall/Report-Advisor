import { resolveCurrentCompanyId, supabase } from './supabase';
import type { Customer, Product } from './types';

function requiredText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field}_REQUIRED`);
  return normalized;
}

function nonNegative(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${field}_INVALID`);
  return value;
}

function positiveOrZero(value: number, field: string): number {
  return nonNegative(value, field);
}

export type CustomerInput = Pick<Customer, 'name' | 'code' | 'phone' | 'email' | 'segment' | 'credit_limit' | 'payment_terms_days'>;
export type ProductInput = Pick<Product, 'sku' | 'name' | 'barcode' | 'unit' | 'cost_price' | 'selling_price' | 'min_stock' | 'reorder_point' | 'is_active'>;

const CUSTOMER_SEGMENTS = new Set(['vip', 'regular', 'occasional']);

function normalizeCustomerInput(input: CustomerInput) {
  const name = requiredText(input.name, 'CUSTOMER_NAME');
  const segment = input.segment.trim();
  if (!CUSTOMER_SEGMENTS.has(segment)) throw new Error('CUSTOMER_SEGMENT_INVALID');
  const credit_limit = positiveOrZero(Number(input.credit_limit), 'CUSTOMER_CREDIT_LIMIT');
  const payment_terms_days = Number(input.payment_terms_days);
  if (!Number.isInteger(payment_terms_days) || payment_terms_days < 0 || payment_terms_days > 3650) throw new Error('CUSTOMER_PAYMENT_TERMS_INVALID');
  return {
    name,
    code: input.code?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    segment,
    credit_limit,
    payment_terms_days,
  };
}

function normalizeProductInput(input: ProductInput) {
  return {
    sku: requiredText(input.sku, 'PRODUCT_SKU'),
    name: requiredText(input.name, 'PRODUCT_NAME'),
    barcode: input.barcode?.trim() || null,
    unit: requiredText(input.unit, 'PRODUCT_UNIT'),
    cost_price: positiveOrZero(Number(input.cost_price), 'PRODUCT_COST_PRICE'),
    selling_price: positiveOrZero(Number(input.selling_price), 'PRODUCT_SELLING_PRICE'),
    min_stock: positiveOrZero(Number(input.min_stock), 'PRODUCT_MIN_STOCK'),
    reorder_point: positiveOrZero(Number(input.reorder_point), 'PRODUCT_REORDER_POINT'),
    is_active: Boolean(input.is_active),
  };
}

async function tenantId(): Promise<string> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  return companyId;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const companyId = await tenantId();
  const { data, error } = await supabase.from('customers').insert({ company_id: companyId, ...normalizeCustomerInput(input) }).select('*').single();
  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  const companyId = await tenantId();
  if (!id) throw new Error('CUSTOMER_ID_REQUIRED');
  const { data, error } = await supabase.from('customers').update(normalizeCustomerInput(input)).eq('id', id).eq('company_id', companyId).select('*').single();
  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(id: string): Promise<void> {
  const companyId = await tenantId();
  if (!id) throw new Error('CUSTOMER_ID_REQUIRED');
  const { data, error } = await supabase.from('customers').delete().eq('id', id).eq('company_id', companyId).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('CUSTOMER_NOT_FOUND_OR_FORBIDDEN');
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const companyId = await tenantId();
  const { data, error } = await supabase.from('products').insert({ company_id: companyId, ...normalizeProductInput(input) }).select('*').single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const companyId = await tenantId();
  if (!id) throw new Error('PRODUCT_ID_REQUIRED');
  const { data, error } = await supabase.from('products').update(normalizeProductInput(input)).eq('id', id).eq('company_id', companyId).select('*').single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const companyId = await tenantId();
  if (!id) throw new Error('PRODUCT_ID_REQUIRED');
  const { data, error } = await supabase.from('products').delete().eq('id', id).eq('company_id', companyId).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('PRODUCT_NOT_FOUND_OR_FORBIDDEN');
}