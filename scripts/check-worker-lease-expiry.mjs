import fs from 'node:fs';
const s=fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql','utf8');
const ok=/heartbeat_report_execution_job[\s\S]*?lease_expires_at\s*[^\n]*>\s*now\(\)/.test(s);
if(!ok) throw new Error('heartbeat must reject expired leases');
console.log('PASS: heartbeat rejects expired leases');
