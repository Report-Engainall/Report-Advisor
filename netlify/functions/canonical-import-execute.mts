import { executeCanonicalImportServer } from '../../src/server/canonical-import-execute.ts';

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function env(name: string): string {
  return Netlify.env.get(name) ?? '';
}

export default async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' });

  try {
    const result = await executeCanonicalImportServer(
      request.headers.get('authorization'),
      await request.json(),
      {
        supabaseUrl: env('VITE_SUPABASE_URL'),
        anonKey: env('VITE_SUPABASE_ANON_KEY'),
        serviceRoleKey: env('SUPABASE_SERVICE_ROLE_KEY'),
      },
    );
    return json(result.status, result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'request_body_required';
    return json(400, {
      status: 'failed',
      error: 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED',
      detail: message.slice(0, 512),
    });
  }
};

export const config = {
  path: '/api/canonical-import-execute',
};
