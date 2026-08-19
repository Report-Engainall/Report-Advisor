-- Subscription state is an authorization boundary. Normal tenant clients may read it but cannot self-upgrade, downgrade, extend trials, or change limits.
DROP POLICY IF EXISTS entitlements_insert ON tenant_entitlements;
CREATE POLICY entitlements_insert ON tenant_entitlements FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS entitlements_update ON tenant_entitlements;
CREATE POLICY entitlements_update ON tenant_entitlements FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS entitlements_delete ON tenant_entitlements;
CREATE POLICY entitlements_delete ON tenant_entitlements FOR DELETE TO authenticated USING (false);

COMMENT ON TABLE tenant_entitlements IS 'Tenant-scoped commercial entitlement state. Client writes are forbidden; controlled RPC/webhook/service paths must perform changes.';
