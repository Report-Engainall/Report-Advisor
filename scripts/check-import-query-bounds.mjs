import { readFileSync } from 'node:fs';
const source=readFileSync('src/lib/queries.ts','utf8');
const start=source.indexOf('export async function fetchImportRecordPage');
const end=source.indexOf('export async function markAlertRead',start);
if(start<0||end<0) throw new Error('fetchImportRecordPage boundary not found');
const fn=source.slice(start,end);
if(!source.includes('const DEFAULT_IMPORT_PAGE_SIZE = 50')) throw new Error('import history pagination contract missing: DEFAULT_IMPORT_PAGE_SIZE');
for(const token of ['.range(from, to)','fetchImportRecordPage(page = 0, pageSize = DEFAULT_IMPORT_PAGE_SIZE)','count == null']){
  if(!fn.includes(token)) throw new Error('import history pagination contract missing: '+token);
}
const compat=readFileSync('src/lib/queries-compat.ts','utf8');
if(compat.includes('supabase.rpc')||compat.includes('supabase.from')) throw new Error('queries-compat must not own database business logic');
console.log('Import query bounds/pagination regression: PASS');
