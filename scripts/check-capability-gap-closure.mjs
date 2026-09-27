const capabilities={
  schema:['header-aliases','unknown-schema-discovery','headerless-reverse-schema','field-normalization'],
  documents:['xlsx','csv','pdf-text','pdf-ocr','table-extraction','document-classification'],
  financial:['debit-credit','balance-integrity','multi-currency','reconciliation','exchange-statements'],
  imports:['preview','dedupe','business-key','transactional-upsert','rollback','quarantine'],
  intelligence:['entity-resolution','anomaly-detection','evidence-fusion','decision-trace','what-if'],
  safety:['tenant-isolation','rls','direct-write-guard','report-truth','privacy'],
  scale:['bounded-processing','workers','cache','concurrency','large-file-regression'],
  release:['golden-datasets','scenario-regression','evidence-gate','production-closure']
};
export function capabilityCoverage(statuses={}){const missing=[];for(const [domain,items] of Object.entries(capabilities))for(const item of items)if(statuses[domain+'.'+item]!==true)missing.push(domain+'.'+item);return{total:Object.values(capabilities).flat().length,missing,complete:missing.length===0};}
export function capabilityCatalogIntegrity(){const entries=Object.entries(capabilities).flatMap(([domain,items])=>items.map(item=>domain+'.'+item));const unique=new Set(entries);if(unique.size!==entries.length)throw new Error('Capability catalog contains duplicate capability identifiers');if(entries.length!==40)throw new Error('Capability catalog cardinality drift: expected 40, got '+entries.length);for(const [domain,items] of Object.entries(capabilities)){if(!domain.trim()||!Array.isArray(items)||items.length===0)throw new Error('Capability catalog domain invalid: '+domain);for(const item of items){if(!/^[a-z0-9-]+$/.test(item))throw new Error('Capability identifier invalid: '+domain+'.'+item);}}return{total:entries.length,domains:Object.keys(capabilities).length};}
if(process.argv[1]?.endsWith('check-capability-gap-closure.mjs')){const r=capabilityCatalogIntegrity();console.log('Capability catalog contract PASS: '+r.total+' capabilities enumerated across '+r.domains+' domains. This contract does not assert implementation closure.');}
