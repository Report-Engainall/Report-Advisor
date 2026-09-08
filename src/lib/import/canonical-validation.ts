export type CanonicalImportEntity = 'sales_invoices' | 'products' | 'customers';

const IDENTITY_FIELDS: Record<CanonicalImportEntity, string[]> = {
  sales_invoices: ['invoice_number'],
  products: ['sku', 'name'],
  customers: ['code', 'name'],
};

export function requiredCanonicalFields(entity: CanonicalImportEntity): string[] {
  return [...IDENTITY_FIELDS[entity]];
}

export function validateMappedRow(
  entity: CanonicalImportEntity,
  row: Record<string, unknown>,
  columns: Array<{ name: string; mappedField?: string | null }>,
): { valid: boolean; missing: string[] } {
  const canonical = new Map<string, unknown>();
  for (const column of columns) {
    const field = column.mappedField ?? column.name;
    if (!field) continue;
    const value = row[column.name];
    if (value !== undefined) canonical.set(field, value);
  }

  const missing = requiredCanonicalFields(entity).filter((field) => {
    if (entity === 'customers' && field === 'code') return false;
    const value = canonical.get(field);
    return value == null || String(value).trim() === '';
  });

  if (entity === 'customers') {
    const code = canonical.get('code');
    const name = canonical.get('name');
    if ((code == null || String(code).trim() === '') && (name == null || String(name).trim() === '')) {
      return { valid: false, missing: ['code|name'] };
    }
  }

  return { valid: missing.length === 0, missing };
}
