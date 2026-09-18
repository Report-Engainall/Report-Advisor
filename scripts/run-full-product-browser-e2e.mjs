  const url = response.url();
  const relevant = !supabaseURL || url.startsWith(supabaseURL) || url.includes('/rest/v1/') || url.includes('/auth/v1/');
  if (!relevant) return;
  const body = await response.text().catch(() => '');
  failedResponses.push({ method: response.request().method(), status: response.status(), url, body: body.slice(0, 2000) });
});
page.on('request', request => requests.push({ method: request.method(), url: request.url() }));

async function probeAuthFromNode(email, password) {
  if (!supabaseURL || !supabaseAnonKey) return { status: 'BLOCKED', reason: 'SUPABASE_RUNTIME_ENV_MISSING' };
  const startedAt = Date.now();
  try {
    const response = await fetch(`${supabaseURL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(15000),
    });
    const bodyText = await response.text();
    let detail = '';
    if (!response.ok) {
      try {
        const body = JSON.parse(bodyText);
        detail = body?.error_code || body?.error || body?.msg || body?.message || '';
      } catch {}
    }
    return {
      status: response.ok ? 'PASS' : 'FAIL',
      httpStatus: response.status,
      durationMs: Date.now() - startedAt,
      detail: detail ? String(detail).slice(0, 180) : undefined,
    };