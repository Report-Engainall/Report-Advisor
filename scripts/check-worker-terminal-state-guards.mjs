import fs from 'node:fs';
const s=fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql','utf8');
const required=[
 ['completion only transitions active jobs',/status in \('leased', 'processing'\)/],
 ['failure only transitions active jobs',/fail_report_execution_job[\s\S]*?status in \('leased', 'processing'\)/],
 ['retry only transitions failed jobs',/retry_report_execution_job[\s\S]*?status = 'failed'/],
 ['retry respects max attempts',/retry_report_execution_job[\s\S]*?attempt < max_attempts/],
];
for(const [name,re] of required) if(!re.test(s)) throw new Error(`missing guard: ${name}`);
for(const [name] of required) console.log(`PASS: ${name}`);
