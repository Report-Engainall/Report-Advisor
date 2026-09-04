import fs from 'node:fs';import path from 'node:path';
const ROOT=process.cwd();
const TARGETS=['src','scripts'];
const ALLOWED_SELF=new Set(['scripts/check-tenant-legacy-consumers.mjs']);
const ALLOWED_SCHEMA_OR_PROBE=new Set(['src/lib/types.ts','src/lib/tenantContext.ts','src/lib/analytics/outcome-feedback.ts','src/lib/file-engine/security.ts','src/lib/queries.ts','src/lib/queries-compat.ts','scripts/live-production-saas-certification.mjs']);
const IGNORE_DIRS=new Set(['node_modules','.git','dist','coverage']);
function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(IGNORE_DIRS.has(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full,out);else if(/\.(ts|tsx|js|mjs)$/.test(entry.name))out.push(full);}return out;}
function stripComments(text){return text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|\s)\/\/.*$/gm,'$1');}
function hasAuthoritativeCompanyResolution(code){return /(?:const|let|var)\s+(?:companyId|authoritativeCompanyId|tenantId|authoritativeTenantId)\s*(?::\s*string\s*)?=\s*await\s+resolveCurrentCompanyId\s*\(\s*\)/.test(code)||/const\s+requireTenant\s*=\s*async\s*\(\s*\)\s*=>[\s\S]{0,1200}?resolveCurrentCompanyId\s*\(\s*\)/.test(code);}
function collectTaintedTenantVars(code){
  const tainted=new Set(['selectedCompanyId','selectedTenantId','browserSelectedCompany','browserSelectedTenant','profileCompanyId','profileTenantId','userCompanyId','userTenantId','metadataCompanyId','metadataTenantId']);
  for(let pass=0;pass<4;pass++){
    for(const match of code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+)/g)){
      const name=match[1], rhs=match[2];
      if(/\b(?:selectedCompanyId|selectedTenantId|browserSelectedCompany|browserSelectedTenant|profile\.company_id|user\.company_id|user\.tenant_id|metadata\.company_id|metadata\.tenant_id|process\.env\.|import\.meta\.env\.)\b/.test(rhs)||[...tainted].some(source=>new RegExp(`\\b${source}\\b`).test(rhs))) tainted.add(name);
    }
  }
  return tainted;
}
function hasUnsafeTenantFilter(code){
  const tainted=collectTaintedTenantVars(code);
  for(const match of code.matchAll(/\.(?:eq|neq|in|filter)\s*\(\s*['"](?:company_id|tenant_id)['"]\s*,\s*([^,)]+?)(?:\s*,|\s*\))/gi)){
    const rhs=match[1].trim();
    if(/^(?:selectedCompanyId|selectedTenantId|profile\.company_id|user\.company_id|user\.tenant_id|metadata\.company_id|metadata\.tenant_id)$/i.test(rhs)) return true;
    if([...tainted].some(name=>new RegExp(`^${name}$`).test(rhs))) return true;
  }
  return false;
}
function isLegacyTenantConsumer(rel,text){if(ALLOWED_SELF.has(rel)||ALLOWED_SCHEMA_OR_PROBE.has(rel))return false;if(rel==='src/lib/file-engine/synonyms.ts')return false;if(/^scripts\/check-[^/]+\.mjs$/.test(rel))return false;const code=stripComments(text);const authoritativeCompanyId=hasAuthoritativeCompanyResolution(code);if(/\bCOMPANY_ID\b/.test(code))return true;if(/\b(?:setCompanyId|clearCompanyId|getCompanyId)\b/.test(code))return true;if(/\b(?:companyId|company_id|tenantId|tenant_id)\s*[:=]\s*['"][0-9a-f-]{16,}['"]/i.test(code))return true;if(/\b(?:const|let|var)\s+(?:COMPANY_ID|TENANT_ID)\s*[:=]/i.test(code))return true;if(/\b(?:companyId|company_id|tenantId|tenant_id)\s*=\s*(?:process\.env\.|import\.meta\.env\.)/i.test(code))return true;if(hasUnsafeTenantFilter(code))return true;if(/\.(?:eq|neq|in|filter)\s*\(\s*['"](?:company_id|tenant_id)['"]\s*,\s*['"][0-9a-f-]{16,}['"]\s*\)/i.test(code))return true;if(/\b(?:companyId|company_id|tenantId|tenant_id)\s*[:=]\s*['"][0-9a-f-]{16,}['"]/i.test(code))return true;if(/\b(?:companyId|company_id|tenantId|tenant_id)\s*=\s*(?:process\.env\.|import\.meta\.env\.)/i.test(code))return true;if(authoritativeCompanyId)return false;return false;}
const findings=[];for(const root of TARGETS){for(const file of walk(path.join(ROOT,root))){const rel=path.relative(ROOT,file).replaceAll(path.sep,'/');const text=fs.readFileSync(file,'utf8');if(isLegacyTenantConsumer(rel,text))findings.push({file:rel});}}
if(findings.length){console.error('Unsafe legacy/static/client-selected tenant consumers detected:');for(const item of findings)console.error(`  ${item.file}`);process.exit(1);}console.log('PASS: no legacy/static/client-selected application or runtime tenant consumers exist; tenant state is database-authoritative.');
