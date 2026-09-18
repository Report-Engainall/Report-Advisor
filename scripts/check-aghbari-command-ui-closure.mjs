#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const analytics = read('src/pages/AnalyticsPage.tsx');
const quality = read('src/pages/DataQualitySnapshotPage.tsx');
const alternatives = read('src/pages/AlternativeGroupsPage.tsx');

const assertions = [
  [analytics.includes('ما الذي تريد فهمه الآن؟'), 'Analytics hub must be question-led.'],
  [analytics.includes('TruthContextStrip months={snapshot.months} status={snapshot.kpis.status} asOf={snapshot.asOf}'), 'Analytics hub must preserve canonical truth context.'],
  [analytics.includes('المصدر الكانوني هو المرجع'), 'Analytics hub must expose source authority.'],
  [quality.includes("useState<number | null>(null)"), 'Data quality score must support an unscored EMPTY state.'],
  [quality.includes('totalRecords === 0 ? null'), 'EMPTY data must not become a 0% quality score.'],
  [quality.includes('لا توجد درجة بعد'), 'EMPTY data must be visibly labeled as not scored.'],
  [alternatives.includes('المجموعة هي عدسة تحليل، وليست تصنيفًا تجميليًا.'), 'Alternative groups must be framed as a business analysis lens.'],
  [alternatives.includes('id="alternative-group-name"'), 'Alternative group form must have accessible labels.'],
  [alternatives.includes("aria-label={'حذف '+m.sku+' من المجموعة'}"), 'Alternative member removal must keep an item-specific accessible label.'],
  [!alternatives.includes('className="input" className="input"'), 'Alternative group form must not contain duplicate className attributes.'],
];

const failed = assertions.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error('FAIL:', message);
  process.exit(1);
}
console.log('PASS: Aghbari command UI closure contract');
