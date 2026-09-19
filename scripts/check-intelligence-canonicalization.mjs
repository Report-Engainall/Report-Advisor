import assert from 'node:assert/strict';
import fs from 'node:fs';

const customerCanonical = fs.readFileSync('src/lib/product-intelligence/customer-product-intelligence.ts', 'utf8');
const customerAdapter = fs.readFileSync('src/lib/free-toolbox/customer-product-intelligence.ts', 'utf8');
const supplierCanonical = fs.readFileSync('src/lib/product-intelligence/supplier-intelligence.ts', 'utf8');
const supplierAdapter = fs.readFileSync('src/lib/free-toolbox/supplier-intelligence.ts', 'utf8');
const scenarioCanonical = fs.readFileSync('src/lib/intelligence/scenarioEngine.ts', 'utf8');
const scenarioAdapter = fs.readFileSync('src/lib/free-toolbox/scenario-engine.ts', 'utf8');

for (const token of ['analyzeCustomerProductContinuity', 'buildCustomerProductSignals', 'CustomerProductPoint', 'CustomerProductObservation']) {
  assert.match(customerCanonical, new RegExp(`\\b${token}\\b`));
}
assert.match(customerAdapter, /from ['"]\.\.\/product-intelligence\/customer-product-intelligence['"]/);
assert.doesNotMatch(customerAdapter, /function\s+analyzeCustomerProductContinuity/);
assert.doesNotMatch(customerAdapter, /function\s+buildCustomerProductSignals/);

for (const token of ['analyzeSuppliers', 'analyzeSupplier', 'SupplierPeriod', 'SupplierEvent']) {
  assert.match(supplierCanonical, new RegExp(`\\b${token}\\b`));
}
assert.match(supplierAdapter, /from ['"]\.\.\/product-intelligence\/supplier-intelligence['"]/);
assert.doesNotMatch(supplierAdapter, /function\s+analyzeSuppliers/);
assert.doesNotMatch(supplierAdapter, /function\s+analyzeSupplier/);

for (const token of ['runScenarios', 'simulateScenario', 'runCustomScenario', 'rankCustomScenarios', 'runScenario']) {
  assert.match(scenarioCanonical, new RegExp(`\\b${token}\\b`));
}
assert.match(scenarioAdapter, /from ['"]\.\.\/intelligence\/scenarioEngine['"]/);
assert.doesNotMatch(scenarioAdapter, /function\s+(runScenarios|simulateScenario|runCustomScenario|rankCustomScenarios)/);

console.log('Intelligence canonicalization contract: PASS (customer/product, supplier, and scenario implementations have one canonical owner; toolbox paths are adapters only).');
