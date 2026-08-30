import fs from 'node:fs';
const migration=fs.readFileSync('supabase/migrations/20260830062000_revoke_unused_recommendation_status_rpc.sql','utf8');
if(!/REVOKE ALL ON FUNCTION public\.update_recommendation_status\(uuid,text\) FROM PUBLIC, anon, authenticated;/i.test(migration)) throw new Error('Unused recommendation-status RPC remains browser executable');
const queries=fs.readFileSync('src/lib/queries.ts','utf8');
const compat=fs.readFileSync('src/lib/queries-compat.ts','utf8');
if(!queries.includes("update_recommendation_status")||!compat.includes("update_recommendation_status")) throw new Error('Expected compatibility wrapper missing; review caller removal before revoking RPC');
console.log('Unused recommendation-status RPC hardening contract: PASS');
