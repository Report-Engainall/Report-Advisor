#!/usr/bin/env node
/**
 * Exact-head CI runtime harness.
 *
 * Serves the already-built Vite dist/ and dispatches /api/* requests to the
 * repository's real api/*.ts handlers. Test infrastructure only:
 * production routing, auth, tenant checks and service-role isolation remain
 * in the existing handlers. The service-role secret is read only by this
 * Node process and never exposed to the browser.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(root, 'dist');
const apiRoot = path.join(root, 'api');
const port = Number(process.env.PORT || 4173);

const requiredEnv = [
  'SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missing = requiredEnv.filter((name) => !String(process.env[name] || '').trim());
if (missing.length) {
  console.error(`LOCAL_EXACT_HEAD_SERVER_ENV_MISSING:${missing.join(',')}`);
  process.exit(2);
}
if (!fs.existsSync(path.join(distRoot, 'index.html'))) {
  console.error('LOCAL_EXACT_HEAD_SERVER_DIST_MISSING');
  process.exit(2);
}
if (!fs.existsSync(apiRoot)) {
  console.error('LOCAL_EXACT_HEAD_SERVER_API_ROOT_MISSING');
  process.exit(2);
}

const moduleCache = new Map();

function json(res, status, payload) {
  if (res.writableEnded) return;
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

function adaptVercelResponse(res) {
  if (typeof res.status !== 'function') {
    res.status = (status) => {
      res.statusCode = status;
      return res;
    };
  }
  return res;
}

function safeApiSlug(pathname) {
  const slug = decodeURIComponent(pathname.slice('/api/'.length)).replace(/^\/+|\/+$/g, '');
  if (!slug || slug.includes('..') || slug.includes('\\')) return null;
  return slug;
}

function resolveApiModule(slug) {
  for (const ext of ['.mjs', '.js', '.ts', '.tsx']) {
    const candidate = path.join(apiRoot, `${slug}${ext}`);
    if (candidate.startsWith(apiRoot + path.sep) && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

async function loadApiHandler(slug) {
  const file = resolveApiModule(slug);
  if (!file) return null;
  if (!moduleCache.has(file)) {
    moduleCache.set(file, import(pathToFileURL(file).href));
  }
  const mod = await moduleCache.get(file);
  const handler = typeof mod.default === 'function'
    ? mod.default
    : typeof mod.handler === 'function'
      ? mod.handler
      : null;
  if (!handler) throw new Error(`API_HANDLER_EXPORT_INVALID:${path.relative(root, file)}`);
  return handler;
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
  })[ext] || 'application/octet-stream';
}

async function serveStatic(req, res, pathname) {
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  if (relative.includes('..')) return json(res, 400, { error: 'invalid_path' });

  const direct = path.resolve(distRoot, relative);
  if (direct.startsWith(distRoot + path.sep) && fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType(direct));
    fs.createReadStream(direct).pipe(res);
    return;
  }

  const indexPath = path.join(distRoot, 'index.html');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  fs.createReadStream(indexPath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', `http://127.0.0.1:${port}`);
    if (requestUrl.pathname.startsWith('/api/')) {
      const slug = safeApiSlug(requestUrl.pathname);
      if (!slug) return json(res, 400, { error: 'invalid_api_path' });
      const handler = await loadApiHandler(slug);
      if (!handler) return json(res, 404, { error: 'api_handler_not_found' });
      await handler(req, adaptVercelResponse(res));
      if (!res.writableEnded) res.end();
      return;
    }
    if (req.method === 'HEAD') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end();
      return;
    }
    await serveStatic(req, res, requestUrl.pathname);
  } catch (error) {
    console.error(error);
    if (!res.writableEnded) json(res, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`LOCAL_EXACT_HEAD_SERVER_READY http://127.0.0.1:${port}`);
  console.log('LOCAL_EXACT_HEAD_SERVER_API=/api/*');
});

function shutdown(signal) {
  console.log(`LOCAL_EXACT_HEAD_SERVER_SHUTDOWN ${signal}`);
  server.close(() => process.exit(0));
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
