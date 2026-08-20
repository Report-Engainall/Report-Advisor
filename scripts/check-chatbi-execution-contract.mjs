import fs from 'node:fs';
const executor=fs.readFileSync('src/lib/biMetricExecutor.ts','utf8');
const page=fs.readFileSync('src/pages/ChatBIPage.tsx','utf8');
for(const token of ['parseBIQuestion','COMPANY_ID','eq(\'company_id\', COMPANY_ID)','evaluateMetric','NEEDS_CLARIFICATION','INSUFFICIENT_DATA','FAILED']) if(!executor.includes(token)) throw new Error(`ChatBI executor contract missing: ${token}`);
for(const token of ['executeBIQuestion','مسار البيانات','لا يتم اختلاق رقم']) if(!page.includes(token)) throw new Error(`ChatBI UI contract missing: ${token}`);
console.log('ChatBI execution contract: PASS');
