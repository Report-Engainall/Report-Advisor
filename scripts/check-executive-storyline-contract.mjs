import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const page=fs.readFileSync(path.join(root,'src/pages/ExecutiveReportPage.tsx'),'utf8');
const required=['CommercialOpportunityRadar','buildCommercialOpportunityRadar','setTopCustomers','setTopProducts','setCategories','setAging','salesDelta'];
for(const token of required) if(!page.includes(token)) throw new Error('EXECUTIVE_STORYLINE_MISSING:'+token);
if(!page.includes('\u0642\u0635\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629')) throw new Error('EXECUTIVE_STORYLINE_MISSING_TITLE');
if(!page.includes('\u062d\u0627\u0644\u0629 \u0627\u0644\u062f\u0644\u064a\u0644')) throw new Error('EXECUTIVE_STORYLINE_MISSING_TRUST');
console.log('EXECUTIVE_STORYLINE_CONTRACT: PASS');
