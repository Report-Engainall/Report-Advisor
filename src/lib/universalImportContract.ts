import type { SourceKind } from './universalDataContract';

export type ImportCapability = 'tabular' | 'document' | 'ocr' | 'table-extraction';

export interface ImportProfile {
  id: string;
  label: string;
  target: 'sales' | 'purchases' | 'inventory' | 'customers' | 'suppliers' | 'products' | 'payments' | 'documents' | 'auto';
  requiredAliases: string[][];
  optionalAliases?: string[][];
  capabilities: ImportCapability[];
}

export interface ImportRoute {
  sourceKind: SourceKind;
  capabilities: ImportCapability[];
  parser: 'xlsx' | 'csv' | 'pdf-text' | 'pdf-table' | 'docx' | 'image-ocr' | 'api' | 'database' | 'manual';
  deterministic: boolean;
}

export const IMPORT_ROUTES: ImportRoute[] = [
  { sourceKind: 'excel', capabilities: ['tabular'], parser: 'xlsx', deterministic: true },
  { sourceKind: 'csv', capabilities: ['tabular'], parser: 'csv', deterministic: true },
  { sourceKind: 'pdf', capabilities: ['document', 'table-extraction'], parser: 'pdf-table', deterministic: true },
  { sourceKind: 'word', capabilities: ['document', 'table-extraction'], parser: 'docx', deterministic: true },
  { sourceKind: 'image', capabilities: ['document', 'ocr', 'table-extraction'], parser: 'image-ocr', deterministic: false },
  { sourceKind: 'api', capabilities: ['tabular'], parser: 'api', deterministic: true },
  { sourceKind: 'database', capabilities: ['tabular'], parser: 'database', deterministic: true },
  { sourceKind: 'manual', capabilities: ['tabular'], parser: 'manual', deterministic: true },
];

export const IMPORT_PROFILES: ImportProfile[] = [
  { id: 'sales', label: 'المبيعات', target: 'sales', requiredAliases: [['sku', 'رقم الصنف', 'كود الصنف', 'item code', 'product code'], ['quantity', 'الكمية', 'qty']], capabilities: ['tabular', 'table-extraction'] },
  { id: 'purchases', label: 'المشتريات', target: 'purchases', requiredAliases: [['sku', 'رقم الصنف', 'كود الصنف', 'item code'], ['quantity', 'الكمية', 'qty']], capabilities: ['tabular', 'table-extraction'] },
  { id: 'inventory', label: 'المخزون', target: 'inventory', requiredAliases: [['sku', 'رقم الصنف', 'كود الصنف', 'item code'], ['quantity', 'الكمية', 'qty', 'stock']], capabilities: ['tabular', 'table-extraction'] },
  { id: 'customers', label: 'العملاء', target: 'customers', requiredAliases: [['customer number', 'رقم العميل', 'customer id', 'كود العميل'], ['customer', 'العميل', 'اسم العميل', 'client', 'الزبون']], capabilities: ['tabular', 'table-extraction'] },
  { id: 'suppliers', label: 'الموردون', target: 'suppliers', requiredAliases: [['supplier number', 'رقم المورد', 'supplier id'], ['supplier', 'المورد', 'اسم المورد']], capabilities: ['tabular', 'table-extraction'] },
  { id: 'products', label: 'الأصناف', target: 'products', requiredAliases: [['sku', 'رقم الصنف', 'كود الصنف', 'item code'], ['product', 'الصنف', 'اسم الصنف', 'item name']], capabilities: ['tabular', 'table-extraction'] },
];

const normalize = (value: string) => value.toLowerCase().replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[\s_\-]+/g, ' ').trim();

export function resolveImportRoute(sourceKind: SourceKind): ImportRoute {
  const route = IMPORT_ROUTES.find(item => item.sourceKind === sourceKind);
  if (!route) throw new Error(`Unsupported import source: ${sourceKind}`);
  return route;
}

export function matchImportProfile(headers: string[], target?: ImportProfile['target']): { profile: ImportProfile; matched: Record<string, string>; missing: string[][] }[] {
  const normalizedHeaders = headers.map(normalize);
  return IMPORT_PROFILES.filter(profile => !target || profile.target === target).map(profile => {
    const matched: Record<string, string> = {};
    const missing: string[][] = [];
    for (const aliases of profile.requiredAliases) {
      const found = aliases.find(alias => normalizedHeaders.includes(normalize(alias)));
      if (found) matched[aliases[0]] = headers[normalizedHeaders.indexOf(normalize(found))];
      else missing.push(aliases);
    }
    return { profile, matched, missing };
  });
}
