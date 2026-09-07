import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('services/document-intelligence/app/main.py', 'utf8');
const confidenceContract = fs.readFileSync('scripts/check-ocr-confidence-contract.mjs', 'utf8');

assert.match(source, /response\.get\("rec_scores", \[\]\)/);
assert.match(source, /confidence_scores\.append\(float\(scores\[index\]\)\)/);
assert.match(source, /confidence = min\(confidence_scores\) if confidence_scores else 0\.0/);
assert.match(source, /if confidence < 0\.7:/);
assert.match(source, /OCR confidence is below the usable threshold/);
assert.doesNotMatch(source, /confidence=0\.0,[\s\S]*parser="paddleocr"/);
assert.doesNotMatch(source, /def _legacy_fallback_marker/);
assert.match(source, /parse_with_ocr\(data, filename, file\.content_type\) or parse_fallback\(data, filename, file\.content_type, ocr_required=True\)/);
assert.match(confidenceContract, /usable\(0\.69, 'فاتورة 123'\), false/);
assert.match(confidenceContract, /usable\(0\.9, 'فاتورة 123'\), true/);

console.log('OCR runtime contract: PASS');
