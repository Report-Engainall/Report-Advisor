import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const page=fs.readFileSync(path.join(root,'src/pages/CompanySettingsPage.tsx'),'utf8');
const component=fs.readFileSync(path.join(root,'src/components/SectorIntelligencePack.tsx'),'utf8');
for(const token of ['company.industry','SectorIntelligencePack'])if(!page.includes(token))throw new Error('SECTOR_PACK_NOT_WIRED:'+token);
for(const token of ['pharmacy','distribution','retail','services','requires-source','Batch / Expiry / FEFO','الوصفات والصرف'])if(!component.includes(token))throw new Error('SECTOR_PACK_MISSING:'+token);
if(!component.includes('لا نعرض batch/expiry/FEFO'))throw new Error('SECTOR_PACK_MISSING_FAIL_CLOSED');
console.log('SECTOR_INTELLIGENCE_PACK_CONTRACT: PASS');
