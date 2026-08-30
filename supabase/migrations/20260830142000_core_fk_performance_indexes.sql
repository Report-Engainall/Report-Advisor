-- Core FK indexes for high-frequency tenant and decision/report joins.
-- Additive only; IF NOT EXISTS keeps this migration idempotent at the object level.
create index if not exists idx_artifact_verification_runs_company_id on public.artifact_verification_runs(company_id);
create index if not exists idx_branches_company_id on public.branches(company_id);
create index if not exists idx_categories_company_id on public.categories(company_id);
create index if not exists idx_customers_company_id on public.customers(company_id);
create index if not exists idx_forecasts_company_id on public.forecasts(company_id);
create index if not exists idx_import_profiles_company_id on public.import_profiles(company_id);
create index if not exists idx_inventory_movements_company_id on public.inventory_movements(company_id);
create index if not exists idx_suppliers_company_id on public.suppliers(company_id);
create index if not exists idx_warehouses_company_id on public.warehouses(company_id);
create index if not exists idx_business_intelligence_decisions_recommendation_id on public.business_intelligence_decisions(recommendation_id);
create index if not exists idx_recommendations_decision_id on public.recommendations(decision_id);
create index if not exists idx_decision_work_items_decision_id on public.decision_work_items(decision_id);
create index if not exists idx_decision_work_items_recommendation_id on public.decision_work_items(recommendation_id);
create index if not exists idx_decision_approvals_decision_id on public.decision_approvals(decision_id);
create index if not exists idx_decision_action_receipts_work_item_id on public.decision_action_receipts(work_item_id);
