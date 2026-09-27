import { requireMethod, json } from '../src/server/resilience-runtime.mjs';
import { executeCanonicalImport, type CanonicalImportServerEnv } from '../src/server/canonical-import-executor';

function bearerToken(req: any): string | null {
  const value = req.headers?.authorization;
  if (typeof value !== 'string' || !value.startsWith('Bearer ')) return null;
  const token = value.slice(7).trim();
  return token || null;
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
  const supabaseUrl = String(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').trim();
  const anonKey = String(process.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    json(res, 503, { status: 'failed', error: 'canonical_import_server_configuration_missing' });
    return;
  }

  const token = bearerToken(req);
  if (!token) {
    json(res, 401, { status: 'failed', error: 'authenticated_user_token_required' });
    return;
  }

  try {
    const env: CanonicalImportServerEnv = { supabaseUrl, anonKey, serviceRoleKey };
    const result = await executeCanonicalImport(await parseBody(req), token, env);
    json(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /required|invalid|tenant|hash|quality|business|duplicate|already_|not_retryable|forbidden|mismatch|rejected/i.test(message) ? 400 : 502;
    json(res, status, { status: 'failed', error: message.slice(0, 512) });
  }
}
