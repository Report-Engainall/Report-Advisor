import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/pages/OnboardingPage.tsx', import.meta.url), 'utf8');
for (const marker of ['من أول تقرير إلى قرار قابل للتنفيذ','الحقيقة أولًا','المستشار الحقيقي','قرار موثق','عمل ونتيجة']) {
  if (!source.includes(marker)) throw new Error('Commercial onboarding value marker missing: ' + marker);
}
if (!source.includes('to="/import"')) throw new Error('Commercial onboarding must expose the primary report-upload CTA');
if (!source.includes('to="/command-center"')) throw new Error('Commercial onboarding must expose the command-center CTA');
console.log('commercial-onboarding-experience: PASS');
