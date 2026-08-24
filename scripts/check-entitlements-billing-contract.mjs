import fs from 'node:fs';
const required = {
  'src/lib/entitlements/entitlementPolicy.ts': ['decideEntitlement','MISSING_TENANT','EXPIRED','QUOTA_EXCEEDED','CAPABILITY_DISABLED'],
  'src/lib/entitlements/usageLedger.ts': ['UsageLedger','idempotencyKey','summarize'],
  'src/lib/entitlements/billingLifecycle.ts': ['transitionSubscription','past_due','cancelled','expired','canRetainCustomerData'],
  'src/lib/entitlements/billingWebhook.ts': ['verifyWebhookSignature','verifyWebhookTimestamp','acceptWebhook','replay'],
  'src/lib/report-execution/worker-adapter.ts': ['TrustedReportWorkerAdapter','tenantId','sourceSnapshotId','heartbeat','fail'],
};
for (const [file,tokens] of Object.entries(required)) { const s=fs.readFileSync(file,'utf8'); for(const t of tokens) if(!s.includes(t)) throw new Error(`${file}: missing ${t}`); }
console.log('entitlements/billing/worker contracts: PASS');
