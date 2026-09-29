import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { executeCanonicalImport } from '../src/server/canonical-import-executor.ts';

const repoRoot = process.cwd();
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const corpusRoot = path.resolve(process.env.REAL_REPORT_CORPUS_ROOT || 'tests/fixtures/realistic-reports');
const reportDir = path.resolve(process.env.E2E_REPORT_DIR || 'artifacts/real-report-corpus');
const supabaseUrl = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').trim();
const anonKey = (process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const supported = new Set(['.xlsx','.xls','.xlsm','.csv','.tsv','.ods','.pdf','.docx','.json','.jsonl','.txt','.md','.xml','.png','.jpg','.jpeg','.tiff','.webp','.bmp']);
const resumeRunId = (process.env.RESUME_RUN_ID || '').trim();
const resumeFromPath = (process.env.RESUME_FROM_PATH || '').trim();
const ciScopeKey = resumeRunId || process.env.GITHUB_RUN_ID || exactHead.slice(0, 12);
const ciIdentityKey = ciScopeKey + '-' + exactHead.slice(0, 12);
const ciEmail = 'report-advisor-corpus-ci-' + ciIdentityKey + '@aghbari.example';
const ciCompanyName = 'Aghbari Report Corpus CI ' + ciScopeKey;

if (!/^[0-9a-f]{40}$/.test(exactHead)) throw new Error('REAL_REPORT_CORPUS_EXACT_HEAD_MISSING');
if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error('REAL_REPORT_CORPUS_SUPABASE_RUNTIME_MISSING');
await fs.mkdir(reportDir, { recursive: true });

function relativePath(file) { return path.relative(repoRoot, file).split(path.sep).join('/'); }
async function discoverFiles(root) {
  const result = [];
  async function visit(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries.sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) { await visit(absolute); continue; }
      const ext = path.extname(entry.name).toLowerCase();
      if (entry.name.toLowerCase() !== 'readme.md' && supported.has(ext)) result.push(absolute);
    }
  }
  await visit(root);
  return result;
}
async function fingerprint(file) {
  const bytes = await fs.readFile(file);
  return { bytes: bytes.byteLength, hash: 'sha256:' + crypto.createHash('sha256').update(bytes).digest('hex'), buffer: bytes };
}
function mimeFor(name) {
  const map={pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',xls:'application/vnd.ms-excel',xlsm:'application/vnd.ms-excel.sheet.macroEnabled.12',ods:'application/vnd.oasis.opendocument.spreadsheet',csv:'text/csv',tsv:'text/tab-separated-values',json:'application/json',jsonl:'application/x-ndjson',txt:'text/plain',md:'text/markdown',xml:'application/xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',tiff:'image/tiff',webp:'image/webp',bmp:'image/bmp'};
  return map[name.toLowerCase().split('.').pop() || ''] || 'application/octet-stream';
}
function extFor(name) { const ext=(name.toLowerCase().split('.').pop()||'bin').replace(/[^a-z0-9]/g,'').slice(0,12); return ext||'bin'; }

const serviceClient = createClient(supabaseUrl, serviceRoleKey, { auth:{persistSession:false,autoRefreshToken:false} });
const anonClient = createClient(supabaseUrl, anonKey, { auth:{persistSession:false,autoRefreshToken:false} });

async function ensureCiIdentity() {
  const password='Aghbari-CI-'+crypto.randomUUID()+'-Corpus-2026!';
  const users=await serviceClient.auth.admin.listUsers({page:1,perPage:1000});
  if (users.error) throw users.error;
  let user=users.data.users.find(u=>u.email?.toLowerCase()===ciEmail.toLowerCase());
  if (user) { const r=await serviceClient.auth.admin.updateUserById(user.id,{password,email_confirm:true}); if(r.error)throw r.error; user=r.data.user; }
  else { const r=await serviceClient.auth.admin.createUser({email:ciEmail,password,email_confirm:true,user_metadata:{role:'owner',source:'report-corpus-ci'}}); if(r.error||!r.data.user)throw r.error||new Error('CI_USER_CREATE_FAILED'); user=r.data.user; }
  let company=await serviceClient.from('companies').select('id').eq('name',ciCompanyName).maybeSingle();
  if(company.error)throw company.error;
  if(!company.data){ const r=await serviceClient.from('companies').insert({name:ciCompanyName,currency:'YER',timezone:'Asia/Aden',industry:'Testing'}).select('id').single(); if(r.error||!r.data)throw r.error||new Error('CI_COMPANY_CREATE_FAILED'); company={data:r.data,error:null}; }
  const m=await serviceClient.from('company_memberships').upsert({company_id:company.data.id,user_id:user.id,role:'owner',is_active:true,is_default:true},{onConflict:'company_id,user_id'});
  if(m.error)throw m.error;
  const signIn=await anonClient.auth.signInWithPassword({email:ciEmail,password});
  if(signIn.error||!signIn.data.session?.access_token)throw signIn.error||new Error('CI_USER_SIGNIN_FAILED');
  return {userId:user.id,companyId:company.data.id,password,refreshToken:signIn.data.session.refresh_token,accessToken:signIn.data.session.access_token};
}

async function executeOne(file,ordinal,total,identity){
  const rel=relativePath(file);
  const fileName=path.basename(file);
  const source=await fingerprint(file);

  const existing = await serviceClient
    .from('import_jobs')
    .select('id,status,file_record_id,result_summary')
    .eq('company_id', identity.companyId)
    .order('created_at', { ascending: false })
    .limit(1000);
  if (existing.error) throw existing.error;
  const priorRows = (existing.data ?? [])
    .filter(row => row.result_summary?.source_path === rel && row.result_summary?.report_corpus === true);
  const completedAttempt = priorRows.find(row => row.status === 'completed');
  if (completedAttempt) {
    return {
      ordinal, total, path: rel, filename: fileName, fingerprint: source.hash, bytes: source.bytes,
      exact_sha: exactHead, status: 'CLOSED', importId: completedAttempt.id, reusedCompletedAttempt: true,
      completed_at: new Date().toISOString(),
      proof: { existing_import_job_id: completedAttempt.id, source_file: rel },
    };
  }
  const prior = priorRows[0];

  let importId;
  if (prior?.status === 'failed' || (prior?.status === 'processing' && prior.result_summary?.source_commit !== exactHead)) {
    if (!prior.file_record_id) throw new Error('RESUME_FAILED_IMPORT_FILE_RECORD_MISSING');
    const retryJob = await serviceClient.from('import_jobs').insert({
      company_id: identity.companyId,
      file_record_id: prior.file_record_id,
      job_type: 'generic:source-data',
      processing_mode: 'import',
      status: 'processing',
      total_rows: 0,
      processed_rows: 0,
      valid_rows: 0,
      invalid_rows: 0,
      quarantined_rows: 0,
      duplicate_rows: 0,
      progress: 0,
      started_at: new Date().toISOString(),
      result_summary: {
        file_name: fileName,
        source_path: rel,
        source_commit: exactHead,
        report_corpus: true,
        retry_of_import_job_id: prior.id,
        retry_reason: 'terminal_failed_attempt_requires_new_canonical_attempt',
      },
    }).select('id').single();
    if (retryJob.error || !retryJob.data) throw new Error('RESUME_RETRY_JOB_CREATE_FAILED:' + JSON.stringify(retryJob.error ?? null));
    importId = retryJob.data.id;
  } else if (prior) {
    throw new Error('REPORT_ALREADY_OPEN:' + rel + ':' + prior.status);
  } else {
    const storagePath=identity.companyId+'/imports/'+crypto.randomUUID()+'.'+extFor(fileName);
    const upload=await serviceClient.storage.from('documents').upload(storagePath,source.buffer,{contentType:mimeFor(fileName),upsert:false});
    if(upload.error)throw upload.error;
    const fr=await serviceClient.from('file_records').insert({company_id:identity.companyId,file_name:fileName,file_extension:extFor(fileName),file_mime:mimeFor(fileName),file_size:source.bytes,file_hash:null,security_status:'pending',status:'uploaded',metadata:{storage_bucket:'documents',storage_path:storagePath,uploaded_by:identity.userId,report_corpus:true,repository:'Report-Engainall/Report-Advisor',source_commit:exactHead,source_path:rel}}).select('id').single();
    if(fr.error||!fr.data)throw fr.error||new Error('FILE_RECORD_CREATE_FAILED');
    const ij=await serviceClient.from('import_jobs').insert({company_id:identity.companyId,file_record_id:fr.data.id,job_type:'generic:source-data',processing_mode:'import',status:'processing',total_rows:0,processed_rows:0,valid_rows:0,invalid_rows:0,quarantined_rows:0,duplicate_rows:0,progress:0,started_at:new Date().toISOString(),result_summary:{file_name:fileName,source_path:rel,source_commit:exactHead,report_corpus:true}}).select('id').single();
    if(ij.error||!ij.data)throw ij.error||new Error('IMPORT_JOB_CREATE_FAILED');
    importId = ij.data.id;
  }
  let execution;
  try {
    execution = await executeCanonicalImport(
      { importId, fileName, sourceHash:source.hash, entityType:'generic:source-data', qualityApproved:false, mode:'execute' },
      identity.accessToken,
      { supabaseUrl, anonKey, serviceRoleKey },
    );
  } catch (cause) {
    const failureMessage = cause instanceof Error ? cause.message : String(cause);
    const finishFailure = await anonClient.rpc('import_finish_job', {
      p_job_id: importId,
      p_status: 'failed',
      p_result_summary: { file_name:fileName, source_path:rel, source_commit:exactHead, report_corpus:true, failure_stage:'canonical_execution' },
      p_error_message: failureMessage.slice(0, 1000),
    });
    if (finishFailure.error) throw new AggregateError([cause, finishFailure.error], 'REPORT_IMPORT_FAILURE_PERSISTENCE_FAILED');
    throw cause;
  }
  const evidenceStatus=execution.evidenceStatus==='VERIFIED'?'VERIFIED':'PARTIAL';
  const finish=await anonClient.rpc('import_finish_job',{p_job_id:importId,p_status:evidenceStatus==='VERIFIED'?'completed':'partial',p_result_summary:{...(execution||{}),file_name:fileName,source_path:rel,source_commit:exactHead,report_corpus:true,evidence_status:evidenceStatus},p_error_message:null});
  if(finish.error)throw finish.error;
  const durableJobId=typeof execution.executionJobId==='string'?execution.executionJobId:(typeof execution.jobId==='string'?execution.jobId:null);
  let durableJob=null; let tasks=[];
  if(durableJobId){ const j=await serviceClient.from('report_execution_jobs').select('id,company_id,status,checkpoint,evidence,completed_at,updated_at').eq('id',durableJobId).eq('company_id',identity.companyId).maybeSingle(); if(j.error)throw j.error; durableJob=j.data; const t=await serviceClient.from('report_execution_tasks').select('stage,ordinal,status,attempt,completed_at,evidence').eq('report_execution_job_id',durableJobId).eq('company_id',identity.companyId).order('ordinal',{ascending:true}); if(t.error)throw t.error; tasks=t.data||[]; }
  const record={ordinal,total,path:rel,filename:fileName,fingerprint:source.hash,bytes:source.bytes,exact_sha:exactHead,status:'CLOSED',importId,snapshotId:typeof execution.snapshotId==='string'?execution.snapshotId:null,executionJobId:durableJobId,authoritativeRowCount:Number(execution.authoritativeRowCount??0),authoritativeQualityScore:Number(execution.authoritativeQualityScore??0),sourceSpecialty:typeof execution.sourceSpecialty==='string'?execution.sourceSpecialty:null,authoritativeEntityType:typeof execution.authoritativeEntityType==='string'?execution.authoritativeEntityType:null,evidenceStatus,renderedOutput:execution.renderedOutput??durableJob?.evidence?.renderedOutput??null,durableJob,tasks,completed_at:new Date().toISOString()};
  if(evidenceStatus!=='VERIFIED') { record.status='REVIEW'; record.blocker='EVIDENCE_STATUS_'+evidenceStatus; }
  else if(!durableJob||durableJob.status!=='completed'){ record.status='BLOCKED'; record.blocker='DURABLE_EXECUTION_NOT_COMPLETED'; }
  else if(tasks.length!==9||tasks.some(t=>t.status!=='completed')){ record.status='BLOCKED'; record.blocker='EXECUTION_TASK_LEDGER_NOT_CLOSED'; }
  else if(!record.renderedOutput||record.renderedOutput.sourceBound!==true||record.renderedOutput.sourceHash!==source.hash||record.renderedOutput.importId!==importId){ record.status='BLOCKED'; record.blocker='RENDERED_MANIFEST_NOT_SOURCE_BOUND'; }
  else record.proof={exact_sha:exactHead,source_file:rel,source_fingerprint:source.hash,import_job_id:importId,snapshot_id:record.snapshotId,durable_job_id:durableJobId,durable_stage:durableJob?.checkpoint?.stage??null,authoritative_row_count:record.authoritativeRowCount,authoritative_quality_score:record.authoritativeQualityScore,specialty:record.sourceSpecialty,entity_type:record.authoritativeEntityType,rendered_output_keys:record.renderedOutput.outputs?.map(o=>o.key)??[],task_count:tasks.length};
  await fs.writeFile(path.join(reportDir,String(ordinal).padStart(3,'0')+'-checkpoint.json'),JSON.stringify(record,null,2)+'\n');
  return record;
}

const files=(await discoverFiles(corpusRoot)).sort((a,b)=>relativePath(a).localeCompare(relativePath(b),'en',{numeric:false,sensitivity:'base'}));
if(!files.length)throw new Error('REAL_REPORT_CORPUS_EMPTY');
const identity=await ensureCiIdentity();

async function refreshCiAccessToken() {
  const refreshed = await anonClient.auth.refreshSession({ refresh_token: identity.refreshToken });
  if (refreshed.error || !refreshed.data.session?.access_token) {
    throw refreshed.error ?? new Error('CI_SESSION_REFRESH_FAILED');
  }
  identity.accessToken = refreshed.data.session.access_token;
  identity.refreshToken = refreshed.data.session.refresh_token ?? identity.refreshToken;
}

let startIndex = 0;
let resumedClosed = 0;
if (resumeRunId || resumeFromPath) {
  if (!resumeRunId || !resumeFromPath) throw new Error('RESUME_CONFIGURATION_INCOMPLETE');
  const targetIndex = files.findIndex(file => relativePath(file) === resumeFromPath);
  if (targetIndex < 0) throw new Error('RESUME_FROM_PATH_NOT_IN_CORPUS:' + resumeFromPath);
  const existing = await serviceClient
    .from('import_jobs')
    .select('id,status,result_summary')
    .eq('company_id', identity.companyId)
    .limit(1000);
  if (existing.error) throw existing.error;
  for (let i = 0; i < targetIndex; i += 1) {
    const rel = relativePath(files[i]);
    const previous = (existing.data ?? []).find(row => row.result_summary?.source_path === rel && row.result_summary?.report_corpus === true);
    if (!previous || previous.status !== 'completed') {
      throw new Error('RESUME_PREVIOUS_REPORT_NOT_CLOSED:' + rel);
    }
  }
  const completedPaths = new Set(
    (existing.data ?? [])
      .filter(row => row.status === 'completed' && typeof row.result_summary?.source_path === 'string')
      .map(row => row.result_summary.source_path),
  );
  startIndex = targetIndex;
  while (startIndex < files.length && completedPaths.has(relativePath(files[startIndex]))) {
    startIndex += 1;
  }
  resumedClosed = startIndex;
}
const ledger={exact_sha:exactHead,corpus_root:relativePath(corpusRoot),corpus_count:files.length,discovered:files.length,registered:resumedClosed,processed:resumedClosed,closed:resumedClosed,review:0,blocked:0,remaining:files.length-resumedClosed,status:resumeRunId?'RESUMED':'RUNNING',started_at:new Date().toISOString(),resume_run_id:resumeRunId||null,resume_from_path:resumeFromPath||null,reports:[]};
const save=async()=>{ledger.remaining=files.length-ledger.closed-ledger.review-ledger.blocked;await fs.writeFile(path.join(reportDir,'ledger.json'),JSON.stringify(ledger,null,2)+'\n');};
console.log('REAL_REPORT_CORPUS_COUNT='+files.length);
console.log('REAL_REPORT_CORPUS_START_INDEX='+startIndex);
for(let i=startIndex;i<files.length;i+=1){ ledger.registered+=1; let record; try{await refreshCiAccessToken(); record=await executeOne(files[i],i+1,files.length,identity);}catch(error){record={ordinal:i+1,total:files.length,path:relativePath(files[i]),filename:path.basename(files[i]),exact_sha:exactHead,status:'BLOCKED',blocker:error instanceof Error?error.message:(typeof error==='string'?error:JSON.stringify(error)),completed_at:new Date().toISOString()}; await fs.writeFile(path.join(reportDir,String(i+1).padStart(3,'0')+'-checkpoint.json'),JSON.stringify(record,null,2)+'\n');} ledger.reports.push(record); if(record.status==='CLOSED'){ledger.closed+=1;ledger.processed+=1;}else if(record.status==='REVIEW')ledger.review+=1;else ledger.blocked+=1; await save(); console.log('REPORT_RESULT',JSON.stringify({ordinal:record.ordinal,total:files.length,path:record.path,status:record.status,importId:record.importId??null,executionJobId:record.executionJobId??null,blocker:record.blocker??null})); if(record.status!=='CLOSED'){ledger.status=record.status;ledger.finished_at=new Date().toISOString();await save();throw new Error('REPORT_STOPPED_AT_'+record.ordinal+':'+record.status+':'+(record.blocker||'unknown'));} }
ledger.status='PASS';ledger.finished_at=new Date().toISOString();await save();
console.log('REAL_REPORT_CORPUS_PASS',JSON.stringify({exact_sha:exactHead,count:files.length,discovered:ledger.discovered,registered:ledger.registered,processed:ledger.processed,closed:ledger.closed,review:ledger.review,blocked:ledger.blocked,remaining:ledger.remaining},null,2));