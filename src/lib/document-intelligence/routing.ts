import type { Criticality } from './validation';
import { classifyConfidence } from './validation';

export type CanonicalRoute = {
  canonicalField: string;
  entity: string;
  destination: string;
  criticality: Criticality;
};

export type RoutingDecision = CanonicalRoute & {
  confidence: number;
  action: 'AUTO_APPROVE' | 'REVIEW' | 'QUARANTINE' | 'UNMAPPED';
};

const ROUTES: Record<string, CanonicalRoute> = {
  product_code: { canonicalField: 'product_code', entity: 'product', destination: 'products', criticality: 'CRITICAL' },
  product_name: { canonicalField: 'product_name', entity: 'product', destination: 'products', criticality: 'HIGH' },
  barcode: { canonicalField: 'barcode', entity: 'product', destination: 'products', criticality: 'MEDIUM' },
  quantity: { canonicalField: 'quantity', entity: 'inventory', destination: 'inventory', criticality: 'HIGH' },
  unit: { canonicalField: 'unit', entity: 'product', destination: 'products', criticality: 'MEDIUM' },
  unit_price: { canonicalField: 'unit_price', entity: 'pricing', destination: 'pricing', criticality: 'HIGH' },
  customer_id: { canonicalField: 'customer_id', entity: 'customer', destination: 'customers', criticality: 'HIGH' },
  supplier_id: { canonicalField: 'supplier_id', entity: 'supplier', destination: 'suppliers', criticality: 'HIGH' },
  invoice_number: { canonicalField: 'invoice_number', entity: 'invoice', destination: 'invoices', criticality: 'CRITICAL' },
  invoice_date: { canonicalField: 'invoice_date', entity: 'invoice', destination: 'invoices', criticality: 'CRITICAL' },
  total_amount: { canonicalField: 'total_amount', entity: 'invoice', destination: 'invoices', criticality: 'CRITICAL' }
};

export function routeCanonicalField(field: string, confidence: number): RoutingDecision {
  const route = ROUTES[field];
  if (!route) return {
    canonicalField: field,
    entity: 'unknown',
    destination: 'quarantine',
    criticality: 'OPTIONAL',
    confidence,
    action: 'UNMAPPED'
  };
  return { ...route, confidence, action: classifyConfidence(confidence, route.criticality) };
}

export function routeMany(fields: Array<{ field: string; confidence: number }>): RoutingDecision[] {
  return fields.map(f => routeCanonicalField(f.field, f.confidence));
}
