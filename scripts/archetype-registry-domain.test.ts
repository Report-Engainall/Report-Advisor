import assert from 'node:assert/strict';
import {
  buildGenericSmartPack,
  evaluateFieldAvailability,
  getArchetypeProfile,
  resolveArchetype,
  resolveArchetypeFromHeaders,
} from '../src/lib/report-intelligence/archetype-registry.ts';

const inventory = resolveArchetype({
  fields: ['productCode', 'currentStock', 'productName'],
  title: 'أرصدة المخزون',
});
assert.equal(inventory.archetypeId, 'inventory.balance');
assert.equal(inventory.profileVersion, 'inventory.balance@v1');
assert.equal(inventory.reviewRequired, false);
assert.deepEqual(inventory.missingRequiredFields, []);

const arabicHeaders = resolveArchetypeFromHeaders({
  headers: ['رقم الصنف', 'الرصيد الحالي', 'اسم الصنف'],
  title: 'تقرير المخزون',
});
assert.equal(arabicHeaders.archetypeId, 'inventory.balance');
assert.equal(arabicHeaders.profileVersion, 'inventory.balance@v1');
assert.equal(arabicHeaders.confidence, 1);
assert.equal(arabicHeaders.reviewRequired, false);

const sales = resolveArchetype({
  fields: ['productCode', 'quantity', 'netAmount'],
  title: 'Sales Detail',
});
assert.equal(sales.archetypeId, 'sales.transaction-detail');
assert.equal(sales.profileVersion, 'sales.transaction-detail@v1');
assert.ok(sales.confidence >= 0.8);

const unknown = resolveArchetype({ fields: ['currency'], title: 'كشف غير معروف' });
assert.equal(unknown.archetypeId, 'generic.report');
assert.equal(unknown.profileVersion, 'generic.report@v1');
assert.equal(unknown.reviewRequired, true);

const generic = buildGenericSmartPack({
  fields: ['productCode', 'currency'],
  sampleSize: 20,
  title: 'مصدر مخصص',
});
assert.equal(generic.archetypeId, 'generic.report');
assert.ok(generic.calculable.includes('تجميع النشاط حسب الصنف'));
assert.ok(generic.notCalculable.some((item) => item.includes('الربحية والهامش')));
assert.ok(generic.nextBusinessQuestions.length >= 1);

const profile = getArchetypeProfile('inventory.balance');
assert.ok(profile);
const availability = evaluateFieldAvailability(profile!, ['productCode', 'currentStock'], 20);
const valuation = availability.find((item) => item.capabilityId === 'inventory.valuation');
assert.equal(valuation?.status, 'NOT_AVAILABLE');
assert.deepEqual(valuation?.missingFields, ['cost']);

const trendProfile = getArchetypeProfile('inventory.movement');
assert.ok(trendProfile);
const shortSample = evaluateFieldAvailability(
  trendProfile!,
  ['productCode', 'quantity', 'documentDate'],
  4,
);
assert.equal(
  shortSample.find((item) => item.capabilityId === 'inventory.movement-trend')?.status,
  'INSUFFICIENT_SAMPLE',
);

const ambiguous = resolveArchetypeFromHeaders({
  headers: ['الرصيد'],
  title: 'كشف مورد',
});
assert.equal(ambiguous.archetypeId, 'generic.report');
assert.equal(ambiguous.profileVersion, 'generic.report@v1');
assert.equal(ambiguous.reviewRequired, true);

for (const archetypeId of [
  'inventory.balance',
  'sales.transaction-detail',
  'purchases.transaction-detail',
  'customer.balance',
  'supplier.balance',
  'inventory.movement',
]) {
  const activeProfile = getArchetypeProfile(archetypeId);
  assert.ok(activeProfile?.advisorPlaybook, archetypeId + ' must expose advisor playbook');
  assert.ok(activeProfile!.advisorPlaybook.questionSequence.length >= 3);
  assert.ok(activeProfile!.advisorPlaybook.evidenceRequirements.length >= 1);
  assert.ok(activeProfile!.advisorPlaybook.actionTemplates.length >= 1);
}

console.log('PASS archetype-registry-domain');
