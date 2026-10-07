import assert from 'node:assert/strict';
import { buildBrainPacket, validateBrainPacket } from '../src/lib/intelligence/brain-runtime.ts';

const rows = [
  { customerCode:'C1', supplierCode:'S1', productCode:'P1', documentNo:'I1', documentDate:'2026-01-01', netAmount:1000, grossAmount:1100, discount:100, quantity:100, returnQty:2, currentStock:4, dailySalesRate:1, stockAgeDays:210, openingStock:20, inbound:0, outbound:16, profit:80, paidAmount:300, balance:700, leadTimeDays:8, targetAmount:1200, requestedQty:10, fulfilledQty:8, orderedQty:20, receivedQty:18 },
  { customerCode:'C2', supplierCode:'S2', productCode:'P2', documentNo:'I2', documentDate:'2026-01-02', netAmount:900, grossAmount:1000, discount:100, quantity:90, returnQty:12, currentStock:0, dailySalesRate:2, stockAgeDays:190, openingStock:10, inbound:0, outbound:10, profit:50, paidAmount:200, balance:700, leadTimeDays:10, targetAmount:1000, requestedQty:12, fulfilledQty:6, orderedQty:18, receivedQty:12 },
  { customerCode:'C3', supplierCode:'S3', productCode:'P3', documentNo:'I3', documentDate:'2026-01-03', netAmount:850, grossAmount:900, discount:50, quantity:85, returnQty:4, currentStock:3, dailySalesRate:1.5, stockAgeDays:160, openingStock:8, inbound:0, outbound:4, profit:60, paidAmount:500, balance:350, leadTimeDays:12, targetAmount:900, requestedQty:10, fulfilledQty:9, orderedQty:16, receivedQty:15 },
  { customerCode:'C4', supplierCode:'S4', productCode:'P4', documentNo:'I4', documentDate:'2026-01-04', netAmount:700, grossAmount:750, discount:50, quantity:70, returnQty:3, currentStock:0, dailySalesRate:1, stockAgeDays:220, openingStock:5, inbound:0, outbound:5, profit:40, paidAmount:100, balance:600, leadTimeDays:15, targetAmount:900, requestedQty:9, fulfilledQty:5, orderedQty:12, receivedQty:8 },
  { customerCode:'C5', supplierCode:'S5', productCode:'P5', documentNo:'I5', documentDate:'2026-01-05', netAmount:650, grossAmount:700, discount:50, quantity:65, returnQty:2, currentStock:5, dailySalesRate:1, stockAgeDays:20, openingStock:7, inbound:2, outbound:4, profit:30, paidAmount:150, balance:500, leadTimeDays:18, targetAmount:800, requestedQty:8, fulfilledQty:7, orderedQty:15, receivedQty:10 },
  { customerCode:'C1', supplierCode:'S1', productCode:'P1', documentNo:'I6', documentDate:'2026-02-01', netAmount:500, grossAmount:550, discount:50, quantity:50, returnQty:1, currentStock:2, dailySalesRate:1, stockAgeDays:240, openingStock:9, inbound:0, outbound:7, profit:20, paidAmount:250, balance:250, leadTimeDays:8, targetAmount:700, requestedQty:7, fulfilledQty:5, orderedQty:10, receivedQty:7 },
  { customerCode:'C2', supplierCode:'S2', productCode:'P2', documentNo:'I7', documentDate:'2026-02-02', netAmount:450, grossAmount:500, discount:50, quantity:45, returnQty:7, currentStock:0, dailySalesRate:2, stockAgeDays:200, openingStock:7, inbound:0, outbound:7, profit:10, paidAmount:100, balance:350, leadTimeDays:10, targetAmount:700, requestedQty:8, fulfilledQty:4, orderedQty:10, receivedQty:8 },
  { customerCode:'C3', supplierCode:'S3', productCode:'P3', documentNo:'I8', documentDate:'2026-02-03', netAmount:400, grossAmount:450, discount:50, quantity:40, returnQty:3, currentStock:4, dailySalesRate:1.2, stockAgeDays:30, openingStock:5, inbound:3, outbound:4, profit:15, paidAmount:300, balance:100, leadTimeDays:12, targetAmount:600, requestedQty:6, fulfilledQty:5, orderedQty:10, receivedQty:9 },
  { customerCode:'C4', supplierCode:'S4', productCode:'P4', documentNo:'I9', documentDate:'2026-02-04', netAmount:350, grossAmount:400, discount:50, quantity:35, returnQty:2, currentStock:0, dailySalesRate:1, stockAgeDays:250, openingStock:4, inbound:0, outbound:4, profit:5, paidAmount:50, balance:300, leadTimeDays:15, targetAmount:600, requestedQty:7, fulfilledQty:3, orderedQty:9, receivedQty:5 },
  { customerCode:'C5', supplierCode:'S5', productCode:'P5', documentNo:'I10', documentDate:'2026-02-05', netAmount:300, grossAmount:350, discount:50, quantity:30, returnQty:1, currentStock:6, dailySalesRate:1, stockAgeDays:10, openingStock:8, inbound:2, outbound:4, profit:8, paidAmount:200, balance:100, leadTimeDays:18, targetAmount:500, requestedQty:5, fulfilledQty:4, orderedQty:8, receivedQty:6 },
];

const packet = buildBrainPacket({
  rows,
  sourceHash:'sha256:' + 'a'.repeat(64),
  reportJobId:'brain-runtime-test-job',
  archetypeId:'inventory.stockout-reorder',
  availableFields:Object.keys(rows[0]),
  evidenceVerified:true,
  evidenceSnapshotId:'evidence-snapshot-test',
  evidencePassportId:'evidence-passport-test',
  recommendation:{
    title:'معالجة الأصناف الحرجة',
    action:'راجع الأصناف منخفضة التغطية واربطها بالتوريد.',
    ownerHint:'المشتريات',
    expectedOutcome:'خفض حالات النفاد',
    measurement:'نسبة الأصناف ذات الرصيد الصفري',
    evidence:['source rows','stock field','daily sales field'],
  },
  decisionOutcomes:[
    {label:'correct',expectedValue:10,actualValue:9},
    {label:'partial',expectedValue:10,actualValue:12},
    {label:'correct',expectedValue:10,actualValue:11},
  ],
});

assert.equal(packet.version,'brain.v1');
assert.ok(packet.metrics.some(item => item.id==='inventory.coverage-days'));
assert.ok(packet.metrics.some(item => item.id==='inventory.zero-negative-share' && item.status==='CALCULATED'));
assert.ok(packet.signals.length >= 3);
assert.equal(packet.benchmark.state,'INTERNAL_COMPARABLE');
assert.equal(packet.benchmark.metricId,'sales.average-document');
assert.equal(packet.benchmark.dimension,'documentNo');
assert.ok(packet.benchmark.entityCount >= 5);
assert.equal(packet.outcome.state,'PARTIAL');
assert.equal(packet.outcome.learning,'CANDIDATE');
assert.equal(packet.work.state,'PROPOSED');
assert.equal(packet.decision.recommendationEligible,true);
assert.deepEqual(validateBrainPacket(packet),[]);

const blocked = buildBrainPacket({
  rows,
  sourceHash:'sha256:' + 'b'.repeat(64),
  reportJobId:'brain-runtime-blocked-job',
  archetypeId:'inventory.stockout-reorder',
  availableFields:Object.keys(rows[0]),
  evidenceVerified:false,
  evidenceSnapshotId:null,
  evidencePassportId:null,
});
assert.equal(blocked.status,'INSUFFICIENT_DATA');
assert.equal(blocked.decision.recommendationEligible,false);
assert.ok(blocked.decision.blockers.includes('VERIFIED_EVIDENCE_REQUIRED'));
assert.ok(blocked.work.state === 'BLOCKED' || blocked.work.state === 'NOT_AVAILABLE');
console.log('BRAIN_RUNTIME_PASS', JSON.stringify({
  metrics: packet.metrics.filter(item=>item.status==='CALCULATED').length,
  signals: packet.signals.length,
  benchmark: packet.benchmark.state,
  outcome: packet.outcome.state,
  learning: packet.outcome.learning,
  readiness: packet.decision.readiness,
}));
