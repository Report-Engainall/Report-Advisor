import assert from 'node:assert/strict';
import { createDecision } from '../src/lib/free-toolbox/decision-log.ts';
import { acceptExtractedFacts,attachExtractedFactsToLineage,extractedFactsToEvidence,type DocumentExtractionFact } from '../src/lib/documentIntelligenceGateway.ts';
import type { LineageGraph } from '../src/lib/free-toolbox/data-lineage.ts';
assert.throws(()=>createDecision({title:'بدون دليل',reason:'invalid',status:'proposed',priority:1,evidenceIds:[],action:'HOLD'}),/DECISION_EVIDENCE_REQUIRED/);
const decision=createDecision({title:'قرار موثق',reason:'evidence-backed',status:'proposed',priority:1,evidenceIds:[' evidence-1 ','evidence-1','evidence-2'],action:'BUY_SOON'});assert.deepEqual(decision.evidenceIds,['evidence-1','evidence-2']);
const facts:DocumentExtractionFact[]=[
 {field:'revenue',value:1200,confidence:.94,source:'pdf-parser',sourceDocumentId:'doc-a',sourceHash:'hash-a',page:4,location:'table:2,row:3'},
 {field:'revenue',value:900,confidence:.91,source:'pdf-parser',sourceDocumentId:'doc-b',sourceHash:'hash-b',page:4,location:'table:2,row:3'},
 {field:'ungrounded',value:1,confidence:1.1,source:''},
];
const envelope={plan:{route:'native-text' as const,steps:['extract'],reason:'regression',qualityTarget:90},choices:[],stage:'READY_FOR_EXTRACTION' as const,warnings:[],facts:[]};
const accepted=acceptExtractedFacts(envelope,facts);assert.equal(accepted.facts.length,2);assert.equal(accepted.facts[0]?.sourceDocumentId,'doc-a');
const evidence=extractedFactsToEvidence(accepted.facts);assert.equal(evidence.length,2);assert.equal(evidence[0]?.sourceDocumentId,'doc-a');assert.equal(evidence[0]?.sourceHash,'hash-a');assert.equal(evidence[0]?.page,4);assert.equal(evidence[0]?.location,'table:2,row:3');
const graph:LineageGraph={nodes:[{id:'insight-1',type:'insight',label:'Revenue insight'}],edges:[]};const linked=attachExtractedFactsToLineage(graph,accepted.facts,'insight-1');const sourceNodes=linked.nodes.filter(n=>n.type==='source');const factNodes=linked.nodes.filter(n=>n.type==='metric');assert.equal(sourceNodes.length,2);assert.equal(factNodes.length,2);assert.notEqual(factNodes[0]?.id,factNodes[1]?.id);assert.deepEqual(sourceNodes.map(n=>n.evidence?.[0]?.sourceDocumentId).sort(),['doc-a','doc-b']);assert.deepEqual(sourceNodes.map(n=>n.evidence?.[0]?.sourceHash).sort(),['hash-a','hash-b']);assert.equal(linked.edges.filter(e=>e.label==='supports').length,2);
assert.deepEqual(attachExtractedFactsToLineage(graph,accepted.facts,'missing-target'),graph);const twice=attachExtractedFactsToLineage(linked,accepted.facts,'insight-1');assert.equal(twice.nodes.length,linked.nodes.length);assert.equal(twice.edges.length,linked.edges.length);
console.log('PASS: decision evidence remains fail-closed and document provenance is preserved through evidence and lineage without fabricating targets.');
