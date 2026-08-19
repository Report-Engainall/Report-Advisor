export type ProductPlan = 'trial' | 'free' | 'starter' | 'professional' | 'business' | 'enterprise';

export type Capability =
  | 'basic_dashboards' | 'advanced_dashboards' | 'report_studio' | 'scheduled_reports'
  | 'pdf_export' | 'excel_export' | 'advanced_forecasting' | 'inventory_reorder_engine'
  | 'cashflow_crisis_engine' | 'chat2bi' | 'ai_research' | 'ocr_processing'
  | 'large_file_processing' | 'automation_workflows' | 'api_access' | 'webhooks'
  | 'multi_user_rbac' | 'audit_log' | 'data_lineage' | 'priority_support';

export interface EntitlementLimits {
  users: number; monthlyRows: number; documentPages: number; ocrPages: number;
  aiRequests: number; scheduledJobs: number; storageMb: number; apiRequests: number;
}

export interface ProductEntitlement {
  plan: ProductPlan; capabilities: Partial<Record<Capability, boolean>>;
  limits: EntitlementLimits; expiresAt?: string; graceUntil?: string;
}

const fullTrial: Record<Capability, boolean> = {
  basic_dashboards:true, advanced_dashboards:true, report_studio:true, scheduled_reports:true,
  pdf_export:true, excel_export:true, advanced_forecasting:true, inventory_reorder_engine:true,
  cashflow_crisis_engine:true, chat2bi:true, ai_research:true, ocr_processing:true,
  large_file_processing:true, automation_workflows:true, api_access:true, webhooks:true,
  multi_user_rbac:true, audit_log:true, data_lineage:true, priority_support:true,
};

export const DEFAULT_ENTITLEMENTS: Record<ProductPlan, ProductEntitlement> = {
  trial: { plan:'trial', capabilities:fullTrial, limits:{users:5,monthlyRows:500000,documentPages:500,ocrPages:250,aiRequests:300,scheduledJobs:20,storageMb:2048,apiRequests:5000} },
  free: { plan:'free', capabilities:{basic_dashboards:true, data_lineage:true, pdf_export:true}, limits:{users:1,monthlyRows:10000,documentPages:20,ocrPages:10,aiRequests:10,scheduledJobs:0,storageMb:100,apiRequests:0} },
  starter: { plan:'starter', capabilities:{basic_dashboards:true, advanced_dashboards:true, report_studio:true, pdf_export:true, excel_export:true, data_lineage:true, ocr_processing:true}, limits:{users:3,monthlyRows:100000,documentPages:100,ocrPages:50,aiRequests:50,scheduledJobs:5,storageMb:500,apiRequests:500} },
  professional: { plan:'professional', capabilities:{basic_dashboards:true, advanced_dashboards:true, report_studio:true, scheduled_reports:true, pdf_export:true, excel_export:true, advanced_forecasting:true, inventory_reorder_engine:true, chat2bi:true, ocr_processing:true, large_file_processing:true, automation_workflows:true, data_lineage:true, audit_log:true}, limits:{users:10,monthlyRows:1000000,documentPages:1000,ocrPages:500,aiRequests:1000,scheduledJobs:50,storageMb:5000,apiRequests:10000} },
  business: { plan:'business', capabilities:Object.fromEntries(Object.keys(fullTrial).map(k=>[k,true])) as Record<Capability,boolean>, limits:{users:50,monthlyRows:10000000,documentPages:5000,ocrPages:2500,aiRequests:5000,scheduledJobs:250,storageMb:25000,apiRequests:100000} },
  enterprise: { plan:'enterprise', capabilities:Object.fromEntries(Object.keys(fullTrial).map(k=>[k,true])) as Record<Capability,boolean>, limits:{users:1000,monthlyRows:100000000,documentPages:50000,ocrPages:25000,aiRequests:50000,scheduledJobs:1000,storageMb:250000,apiRequests:1000000} },
};

export function hasCapability(entitlement: ProductEntitlement | null | undefined, capability: Capability) {
  if (!entitlement) return false;
  if (entitlement.expiresAt && Date.now() > new Date(entitlement.expiresAt).getTime()) {
    return entitlement.graceUntil ? Date.now() <= new Date(entitlement.graceUntil).getTime() && !!entitlement.capabilities[capability] : false;
  }
  return entitlement.capabilities[capability] === true;
}

export function trialRemainingDays(expiresAt?: string) {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
}
