import fs from 'node:fs';
import path from 'node:path';

function loadProvenance() {
  try {
    const file = path.join(process.cwd(), 'netlify', 'functions', 'runtime-provenance.json');
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string | null>;
  } catch {
    return {};
  }
}

function firstNonBlank(...values: Array<string | undefined | null>) {
  return values.map((value) => value?.trim() || '').find(Boolean) || null;
}

export default async function handler() {
  const provenance = loadProvenance();
  const sourceSha = firstNonBlank(provenance.source_sha, process.env.COMMIT_REF, process.env.GITHUB_SHA);
  const deploymentSha = firstNonBlank(provenance.deployment_sha, process.env.COMMIT_REF, process.env.GITHUB_SHA);
  const buildSha = firstNonBlank(provenance.build_sha, process.env.COMMIT_REF, process.env.GITHUB_SHA);
  const deploymentId = firstNonBlank(provenance.deployment_id, process.env.NETLIFY_DEPLOY_ID, process.env.DEPLOY_ID);
  const targetEnv = firstNonBlank(provenance.target_env, process.env.RESILIENCE_TARGET_ENV, process.env.CONTEXT);

  const completeIdentity = Boolean(sourceSha && deploymentSha && deploymentId);
  const body = {
    status: completeIdentity ? 'healthy' : 'degraded',
    component: 'runtime',
    source_sha: sourceSha,
    build_sha: buildSha,
    deployment_sha: deploymentSha,
    deployment_id: deploymentId,
    target_env: targetEnv,
    runtime_environment: 'netlify-function',
    context: provenance.context ?? process.env.CONTEXT ?? null,
    branch: provenance.branch ?? process.env.BRANCH ?? null,
    review_id: provenance.review_id ?? process.env.REVIEW_ID ?? null,
    deploy_url: provenance.deploy_url ?? process.env.DEPLOY_URL ?? null,
    deploy_prime_url: provenance.deploy_prime_url ?? process.env.DEPLOY_PRIME_URL ?? null,
    checked_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body), {
    status: completeIdentity ? 200 : 503,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
    },
  });
}
