import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const dir=path.join(root,'tests','fixtures','realistic-reports');
const readme=path.join(dir,'README.md');
const minimum=20;
const supported=/\.(pdf|xlsx|xls|xlsm|csv|tsv|ods|docx|doc|json|jsonl|xml|txt|md)$/i;

if(!fs.existsSync(dir)){ console.error(`BLOCKED: missing report corpus directory: ${dir}`); process.exit(2); }
if(!fs.existsSync(readme)){ console.error(`BLOCKED: missing report corpus manifest: ${readme}`); process.exit(2); }

const declared=fs.readFileSync(readme,'utf8').split(/\r?\n/).map(x=>x.trim()).filter(x=>/^[-*] .+\.(pdf|xlsx|xls|xlsm|csv|tsv|ods|docx|doc|json|jsonl|xml|txt|md)$/i.test(x)).map(x=>x.replace(/^[-*] /,''));
const actual=fs.readdirSync(dir,{withFileTypes:true}).filter(x=>x.isFile()&&supported.test(x.name)).map(x=>x.name).sort();
const missing=declared.filter(x=>!actual.includes(x));
console.log(`DECLARED=${declared.length} ACTUAL=${actual.length} MINIMUM=${minimum}`);
if(missing.length) console.log(`MISSING_DECLARED=${missing.join(',')}`);
if(actual.length<minimum || missing.length){
  console.error('BLOCKED: report corpus is incomplete. No report-level PASS may be claimed. Restore/attach the actual corpus, then rerun this gate before processing every report.');
  process.exit(2);
}
console.log(`PASS: report corpus ready (${actual.length} files) and all declared fixtures are present.`);