import fs from 'node:fs';
const security=fs.readFileSync('src/lib/securityScope.ts','utf8');
for(const t of ['companyId','branchIds','warehouseIds','canAccessResource','SECURITY_SCOPE_REQUIRED']) if(!security.includes(t)) throw new Error(`Security contract missing: ${t}`);
const cap=fs.existsSync('src/lib/industryCapability.ts') ? fs.readFileSync('src/lib/industryCapability.ts','utf8') : '';
if(!cap.includes('Capability') || !cap.includes('Industry')) throw new Error('Industry capability contract missing');
console.log('Capability + Security contracts: PASS');
