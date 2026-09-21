import { executeCanonicalImportServer } from '../src/server/canonical-import-execute';
import { json, requireConfig, requireMethod } from '../src/server/resilience-runtime.mjs';

function bearerToken(req: any): string | null {
  const value = req.headers?.authorization;
  return typeof value === 'string' ? value : null;
}

async function parseBody(req: any): Promise<unknown> {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  if (!chunks.length) throw new Error('request_body_required');
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req: any, res: any) {
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireConfig(res, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_ANON_KEY'])) return;

  try {
    const result = await executeCanonicalImportServer(
      bearerToken(req),
      await parseBody(req),
      {
        supabaseUrl: process.env.SUPABASE_URL ?? '',
        anonKey: process.env.VITE_SUPABASE_ANON_KEY ?? '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      },
    );
    json(res, result.status, result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'request_body_required';
    json(res, 400, { status: 'failed', error: message.slice(0, 512) });
  }
}
