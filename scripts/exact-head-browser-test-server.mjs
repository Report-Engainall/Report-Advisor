import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import canonicalImportRun from '../api/canonical-import-run.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(root, 'dist');
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const positionalPort = process.argv.find((arg) => /^\d+$/.test(arg));
const port = Number(portArg?.slice('--port='.length) || positionalPort || 4173);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function vercelResponse(res) {
  const wrapper = {
    status(code) { res.statusCode = code; return wrapper; },
    setHeader(name, value) { res.setHeader(name, value); return wrapper; },
    end(body) { res.end(body); return wrapper; },
  };
  return wrapper;
}

function requestPath(req) {
  const raw = String(req.url || '/').split('?', 1)[0] || '/';
  return decodeURIComponent(raw);
}

async function serveStatic(req, res, urlPath) {
  if (!['GET', 'HEAD'].includes(req.method || '')) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return;
  }
  const normalized = path.posix.normalize(urlPath);
  const relative = normalized === '/' ? 'index.html' : normalized.replace(/^\/+/, '');
  const candidate = path.resolve(distRoot, relative);
  if (candidate !== distRoot && !candidate.startsWith(`${distRoot}${path.sep}`)) {
    res.statusCode = 400;
    res.end('Bad Request');
    return;
  }
  let filePath = candidate;
  try {
    const item = await stat(candidate);
    if (!item.isFile()) filePath = path.join(distRoot, 'index.html');
  } catch {
    filePath = path.join(distRoot, 'index.html');
  }
  try {
    const body = await readFile(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', mimeTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    res.statusCode = 500;
    res.end(error instanceof Error ? error.message : String(error));
  }
}

const server = createServer(async (req, res) => {
  const urlPath = requestPath(req);
  try {
    if (urlPath === '/api/canonical-import-run') {
      res.setHeader('Cache-Control', 'no-store');
      await canonicalImportRun(req, vercelResponse(res));
      if (!res.writableEnded) res.end();
      return;
    }
    await serveStatic(req, res, urlPath);
  } catch (error) {
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ status: 'failed', error: error instanceof Error ? error.message : String(error) }));
    }
  }
});

server.on('error', (error) => {
  console.error('EXACT_HEAD_BROWSER_TEST_SERVER_ERROR', error);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`EXACT_HEAD_BROWSER_TEST_SERVER_READY=http://127.0.0.1:${port}`);
  console.log('EXACT_HEAD_BROWSER_TEST_SERVER_API=/api/canonical-import-run');
});
