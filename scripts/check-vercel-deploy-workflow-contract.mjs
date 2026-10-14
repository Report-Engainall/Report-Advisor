import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/vercel-production-deploy.yml', 'utf8');
const required = [
  // These identifiers are public project metadata, not credentials. Prefer owner-configured vars or secrets.
  "VERCEL_ORG_ID: ${{ vars.VERCEL_ORG_ID || secrets.VERCEL_ORG_ID || 'team_7BSJnGvDzIC6bXMakIOeAYle' }}",
  "VERCEL_PROJECT_ID: ${{ vars.VERCEL_PROJECT_ID || secrets.VERCEL_PROJECT_ID || 'prj_jcqgz6UKGd6tPgHZlttgFXaXvyvo' }}",
  'VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}',
  'RESILIENCE_OPERATIONAL_TOKEN: ${{ secrets.RESILIENCE_OPERATIONAL_TOKEN }}',
  'Require deploy credentials',
  'Synchronize operational token into Vercel production environment',
  "body.deployment_sha === expected && body.deployment_id",
  'cancel-in-progress: false',
];
const missing = required.filter((value) => !workflow.includes(value));
if (missing.length) {
  throw new Error(`Vercel production deploy workflow contract failed; missing: ${missing.join(', ')}`);
}
for (const secret of ['VERCEL_TOKEN', 'RESILIENCE_OPERATIONAL_TOKEN']) {
  if (!workflow.includes(`test -n "${${secret}:-}"`) && !workflow.includes(`if [ -z "${${secret}:-}" ]`)) {
    throw new Error(`Vercel production workflow must fail closed when ${secret} is absent.`);
  }
}
console.log('Vercel production deploy workflow contract: PASS (public IDs have safe defaults; tokens remain mandatory; exact-SHA health proof preserved).');
