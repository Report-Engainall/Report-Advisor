import fs from 'node:fs';
import path from 'node:path';

function firstNonBlank(...values) {
  return values.map((value) => typeof value === 'string' ? value.trim() : '')
    .find(Boolean) ?? null;
}

const sourceSha = firstNonBlank(
  process.env.COMMIT_REF,
  process.env.HEAD,
  process.env.GITHUB_SHA,
);
const context = firstNonBlank(process.env.CONTEXT);
const values = {
  source_sha: sourceSha,
  build_sha: sourceSha,
  deployment_sha: sourceSha,
  deployment_id: firstNonBlank(process.env.DEPLOY_ID, process.env.NETLIFY_DEPLOY_ID),
  target_env: context === 'production'
    ? 'production'
    : context === 'deploy-preview'
      ? 'preview'
      : context === 'branch-deploy'
        ? 'branch'
        : context === 'dev'
          ? 'development'
          : context,
  runtime_environment: 'netlify-function',
  context,
  branch: firstNonBlank(process.env.BRANCH),
  review_id: firstNonBlank(process.env.REVIEW_ID),
  deploy_url: firstNonBlank(process.env.DEPLOY_URL),
  deploy_prime_url: firstNonBlank(process.env.DEPLOY_PRIME_URL),
};

if (!values.source_sha || !/^[0-9a-f]{40}$/i.test(values.source_sha)) {
  throw new Error('NETLIFY_RUNTIME_SOURCE_SHA_MISSING_OR_INVALID');
}

const output = path.resolve('netlify/functions/runtime-provenance.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(values, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ output, ...values }));
