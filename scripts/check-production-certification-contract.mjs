import fs from 'node:fs';
const files = {
  'src/lib/production/productionCertification.ts': ['certifyProduction','BLOCKER','certified','0.95'],
  'src/lib/entitlements/entitlementPolicy.ts': ['decideEntitlement','MISSING_TENANT','EXPIRED','QUOTA_EXCEEDED','CAPABILITY_DISABLED'],
};
for (const [file,tokens] of Object.entries(files)) { const s=fs.readFileSync(file,'utf8'); for(const t of tokens) if(!s.includes(t)) throw new Error(`${file}: missing ${t}`); }
console.log('production certification and entitlement contracts: PASS');
