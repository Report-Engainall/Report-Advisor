import type { DashboardKPIs } from '@/lib/dashboard-canonical';

export interface DecisionDomain {
  id: 'SALES' | 'RECEIVABLES' | 'MARGIN' | 'INVENTORY' | 'CUSTOMERS' | 'PRODUCTS' | 'COLLECTION';
  label: string;
  covered: boolean;
  requiredEvidence: string[];
}

export interface DecisionCoverage {
  covered: number;
  total: number;
  percent: number | null;
  domains: DecisionDomain[];
  state: 'FULL' | 'PARTIAL' | 'INSUFFICIENT_DATA';
}

const finite = (value: number | null): boolean => typeof value === 'number' && Number.isFinite(value);

export function buildDecisionCoverage(kpis: DashboardKPIs | null): DecisionCoverage {
  if (!kpis) return { covered: 0, total: 7, percent: null, domains: [], state: 'INSUFFICIENT_DATA' };

  const domains: DecisionDomain[] = [
    { id: 'SALES', label: 'المبيعات', covered: finite(kpis.totalSales), requiredEvidence: ['totalSales'] },
    { id: 'RECEIVABLES', label: 'الذمم', covered: finite(kpis.totalReceivables) && finite(kpis.overdueReceivables), requiredEvidence: ['totalReceivables', 'overdueReceivables'] },
    { id: 'MARGIN', label: 'الهامش', covered: finite(kpis.grossProfit) && finite(kpis.grossMargin), requiredEvidence: ['grossProfit', 'grossMargin'] },
    { id: 'INVENTORY', label: 'المخزون', covered: finite(kpis.inventoryValue), requiredEvidence: ['inventoryValue'] },
    { id: 'CUSTOMERS', label: 'العملاء', covered: finite(kpis.totalCustomers) && finite(kpis.activeCustomers), requiredEvidence: ['totalCustomers', 'activeCustomers'] },
    { id: 'PRODUCTS', label: 'المنتجات', covered: finite(kpis.totalProducts), requiredEvidence: ['totalProducts'] },
    { id: 'COLLECTION', label: 'التحصيل', covered: finite(kpis.collectionRate), requiredEvidence: ['collectionRate'] },
  ];

  const covered = domains.filter(domain => domain.covered).length;
  const percent = Math.round((covered / domains.length) * 100);
  return { covered, total: domains.length, percent, domains, state: covered === 0 ? 'INSUFFICIENT_DATA' : covered === domains.length ? 'FULL' : 'PARTIAL' };
}
