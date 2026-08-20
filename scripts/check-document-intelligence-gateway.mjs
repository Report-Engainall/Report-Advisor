import fs from 'node:fs';
import assert from 'node:assert/strict';

const gateway = fs.readFileSync('src/lib/documentIntelligenceGateway.ts', 'utf8');
const route = fs.readFileSync('src/lib/free-toolbox/document-route.ts', 'utf8');
const registry = fs.readFileSync('src/lib/aiCapabilityRegistry.ts', 'utf8');

for (const token of ['planDocumentIntelligence','acceptExtractedFacts','INSUFFICIENT_BACKEND','source','confidence']) assert.match(gateway, new RegExp(token), `gateway missing ${token}`);
for (const token of ['native-text','table-extract','ocr','hybrid']) assert.match(route, new RegExp(token), `document route missing ${token}`);
assert.match(registry, /backend: 'docling'/, 'Docling adapter missing');
assert.match(registry, /backend: 'paddleocr'/, 'PaddleOCR adapter missing');
assert.match(registry, /requiresUserDeviceInstall: true/, 'local install boundary must remain explicit');
assert.match(registry, /mayCostMoney: false/, 'free-cost marker missing');
console.log('Document intelligence gateway contract: PASS');
