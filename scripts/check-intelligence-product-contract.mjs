import fs from 'node:fs';
const source = fs.readFileSync('src/pages/IntelligencePage.tsx', 'utf8');
const required = ['مركز الذكاء والقرار','fetchRecommendations','fetchAlerts','fetchForecasts','updateRecommendationStatus','FORECAST','مساحة القرار','لا توجد تنبؤات مصدرية','لا توجد تنبيهات مصدرية حاليًا','لا توجد توصيات مصدرية حاليًا','مسار نتيجة تشغيلية موثقة'];
const missing = required.filter(token => !source.includes(token));
if (missing.length) { console.error('Intelligence product contract: FAIL'); missing.forEach(token => console.error(`- missing: ${token}`)); process.exit(1); }
if (/Math\.random\(|fake|mock/i.test(source)) { console.error('Intelligence product contract: FAIL — synthetic marker detected'); process.exit(1); }
console.log('Intelligence product contract: PASS');
