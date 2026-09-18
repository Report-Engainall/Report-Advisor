import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const page=fs.readFileSync(path.join(root,'src/pages/ExecutiveReportPage.tsx'),'utf8');
const lens=fs.readFileSync(path.join(root,'src/components/SectorReportLens.tsx'),'utf8');
for(const token of ['SectorReportLens','resolveCurrentCompanyId','supabase','setIndustry'])if(!page.includes(token))throw new Error('SECTOR_REPORT_WIRING_MISSING:'+token);
for(const token of ['صيدل','Batch / Expiry / FEFO','الوصفات والصرف','يتطلب مصدرًا متخصصًا','لا تتحول غياب بيانات الدفعات'])if(!lens.includes(token))throw new Error('SECTOR_REPORT_LENS_MISSING');
console.log('SECTOR_REPORT_LENS_CONTRACT: PASS');
