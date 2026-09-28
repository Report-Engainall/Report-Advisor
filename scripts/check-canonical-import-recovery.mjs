import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');

assert.match(source, /selectedFileRef\.current = selected;/);
assert.match(source, /const retryCurrentFile = useCallback\(\(\) => \{/);
assert.match(source, /if \(current\) \{/);
assert.match(source, /void handleFile\(current\);/);
assert.match(source, /aria-label="إعادة قراءة المصدر الحالي"/);
assert.match(source, /إعادة قراءة المصدر الحالي/);
assert.match(source, /aria-label="اختيار مصدر آخر"/);
assert.match(source, /aria-label="تحديث سجل الاستيرادات"/);
assert.match(source, /onDrop=\{\(event\) => \{ event\.preventDefault\(\); event\.stopPropagation\(\); handleDroppedFiles\(event\.dataTransfer\.files\); \}\}/);

console.log('Canonical import failure-recovery contract: PASS');
