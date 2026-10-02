export default async function handler() {
  const commitRef = process.env.COMMIT_REF ?? null;
  const context = process.env.CONTEXT ?? null;
  const deploymentId = process.env.DEPLOY_ID ?? null;
  const deployUrl = process.env.DEPLOY_URL ?? null;
  const deployPrimeUrl = process.env.DEPLOY_PRIME_URL ?? null;
  const reviewId = process.env.REVIEW_ID ?? null;
  const branch = process.env.BRANCH ?? null;

  const targetEnv =
    context === 'production' ? 'production'
      : context === 'deploy-preview' ? 'preview'
        : context === 'branch-deploy' ? 'branch'
          : context === 'dev' ? 'development'
            : context;

  const body = {
    status: 'healthy',
    component: 'runtime',
    source_sha: commitRef,
    build_sha: commitRef,
    deployment_sha: commitRef,
    deployment_id: deploymentId,
    target_env: targetEnv,
    runtime_environment: 'netlify-function',
    context,
    branch,
    review_id: reviewId,
    deploy_url: deployUrl,
    deploy_prime_url: deployPrimeUrl,
    checked_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body), {
    status: commitRef && deploymentId ? 200 : 503,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
    },
  });
}
