import { executeCanonicalImport, type CanonicalImportServerEnv } from '../../src/server/canonical-import-executor';

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function env(name: string): string {
  const value = Netlify.env.get(name);
  if (!value) throw new Error(`NETLIFY_ENV_MISSING:${name}`);
  return value;
}

function bearer(request: Request): string {
  const value = request.headers.get('authorization') ?? '';
  if (!/^Bearer\s+\S+$/i.test(value)) throw new Error('AUTHENTICATED_USER_REQUIRED');
  return value.slice(7).trim();
}

export default async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' });

  try {
    const authorization = bearer(request);
    const serverEnv: CanonicalImportServerEnv = {
      supabaseUrl: env('VITE_SUPABASE_URL'),
      anonKey: env('VITE_SUPABASE_ANON_KEY'),
      serviceRoleKey: env('SUPABASE_SERVICE_ROLE_KEY'),
    };
    const payload = await request.json();
    const result = await executeCanonicalImport(payload, authorization, serverEnv);
    return json(200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED';
    const status = message.startsWith('NETLIFY_ENV_MISSING') ? 503 : 400;
    return json(status, { error: 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED', detail: message.slice(0, 512) });
  }
};

export const config = {
  path: '/api/canonical-import-execute',
};
