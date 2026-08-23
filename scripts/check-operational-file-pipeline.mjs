import { buildOperationalPreview, buildPreviewFingerprint } from '../src/lib/file-engine/operational-pipeline.ts';

const headers = ['رقم الصنف', 'اسم الصنف', 'السعر', 'الكمية'];
const incoming = [
  { 'رقم الصنف': '٠٠١', 'اسم الصنف': 'سكر', 'السعر': 10, 'الكمية': 5 },
  { 'رقم الصنف': '002', 'اسم الصنف': 'أرز', 'السعر': 20, 'الكمية': 7 },
  { 'رقم الصنف': '003', 'اسم الصنف': 'شاي', 'السعر': 30, 'الكمية': 2 },
];
const existing = [
  { 'رقم الصنف': '001', 'اسم الصنف': 'سكر', 'السعر': 10, 'الكمية': 5 },
  { 'رقم الصنف': '002', 'اسم الصنف': 'أرز', 'السعر': 19, 'الكمية': 7 },
];

const preview = buildOperationalPreview(headers, incoming, existing);
if (preview.selectedBusinessKey !== 'رقم الصنف') throw new Error('Business key was not detected.');
if (preview.counts.unchanged !== 1 || preview.counts.updated !== 1 || preview.counts.new !== 1) throw new Error(`Unexpected reconciliation counts: ${JSON.stringify(preview.counts)}`);
if (preview.rows[0].businessKey !== '001') throw new Error('Arabic digits were not canonicalized.');
if (preview.requiresApproval) throw new Error('Clean preview should not require approval.');
if (buildPreviewFingerprint(incoming, headers) !== buildPreviewFingerprint([...incoming].reverse(), headers)) throw new Error('Fingerprint must be order independent.');

const duplicate = buildOperationalPreview(headers, [...incoming, incoming[0]], existing);
if (duplicate.counts.conflict !== 2 || !duplicate.requiresApproval) throw new Error('Duplicate business keys must require approval.');

const missingKey = buildOperationalPreview(headers, [{ 'اسم الصنف': 'بدون كود', 'السعر': 10, 'الكمية': 1 }], existing);
if (missingKey.counts.error !== 1 || !missingKey.requiresApproval) throw new Error('Missing business key must block approval.');

console.log('Operational file pipeline: PASS');
