import fs from 'node:fs';
import path from 'node:path';

const migrationsDir=path.join(process.cwd(),'supabase','migrations');
const files=fs.readdirSync(migrationsDir).filter(name=>name.endsWith('.sql')&&name.includes('watched_report_relative_path'));
if(files.length!==1)throw new Error(`Expected exactly one watched-report relative-path hardening migration, found ${files.length}`);
const sql=fs.readFileSync(path.join(migrationsDir,files[0]),'utf8');
for(const token of ["WATCHED_FILE_PATH_INVALID","p_relative_path ~ '(^|[\\\\/])\\.\\.([\\\\/]|$)'","p_relative_path ~ '^[A-Za-z]:[\\\\/]'","left(p_relative_path, 1) IN ('/', E'\\\\')"]){
  if(!sql.includes(token))throw new Error(`Missing watched-report path traversal guard: ${token}`);
}
if(!sql.includes('current_company_id()')||!sql.includes('auth.uid()'))throw new Error('Missing tenant/auth boundary in watched-report RPC');
console.log('Watched report relative-path contract: PASS');
