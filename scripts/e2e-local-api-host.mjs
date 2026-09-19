#!/usr/bin/env node
import { spawn } from 'node:child_process';
import http from 'node:http';

const HOST = '127.0.0.1';
const APP_PORT = Number(process.env.E2E_APP_PORT || 4173);
const PREVIEW_PORT = Number(process.env.E2E_PREVIEW_PORT || 4174);
const API_PATH = '/api/canonical-import-execute';
const preview = spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'preview', '--', '--host', HOST, '--port', String(PREVIEW_PORT)],
  { stdio: 'inherit', env: process.env },
);

let closing = false;

function installResponseAdapter(res) {
  res.status = (code) => {
    res.statusCode = Number(code);
    return res;
  };
  res.json = (payload) => {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
    return res;
  };
  res.send = (payload) => {
    if (!res.headersSent && typeof payload === 'object') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(payload));
    } else {
      res.end(payload == null ? '' : String(payload));
    }
    return res;
  };
  return res;
}

async function waitForPreview() {
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    try {
      const response = await fetch(`http://${HOST}:${PREVIEW_PORT}/`, { redirect: 'manual' });
      if (response.status >= 200 && response.status < 500) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('E2E_PREVIEW_START_TIMEOUT');
}

function proxyRequest(req, res) {
  const proxy = http.request(
    {
      hostname: HOST,
      port: PREVIEW_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `${HOST}:${PREVIEW_PORT}` },
    },
    (upstream) => {
      res.statusCode = upstream.statusCode || 502;
      for (const [name, value] of Object.entries(upstream.headers)) {
        if (value !== undefined && !['connection', 'keep-alive', 'transfer-encoding'].includes(name.toLowerCase())) {
          res.setHeader(name, value);
        }
      }
      upstream.pipe(res);
    },
  );
  proxy.on('error', (error) => {
    if (!res.headersSent) res.statusCode = 502;
    res.end(`E2E_PREVIEW_PROXY_ERROR:${error.message}`);
  });
  req.pipe(proxy);
}

async function loadHandler() {
  const module = await import('../api/canonical-import-execute.ts');
  if (typeof module.default !== 'function') throw new Error('CANONICAL_IMPORT_API_HANDLER_MISSING');
  return module.default;
}

await waitForPreview();
const canonicalImportHandler = await loadHandler();

const server = http.createServer(async (req, res) => {
  if (req.url?.split('?')[0] !== API_PATH) {
    proxyRequest(req, res);
    return;
  }

  installResponseAdapter(res);
  try {
    await canonicalImportHandler(req, res);
  } catch (error) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      }));
    } else {
      res.end();
    }
  }
});

await new Promise((resolve, reject) => {
  server.listen(APP_PORT, HOST, resolve);
  server.once('error', reject);
});

console.log(`E2E_API_HOST_READY=http://${HOST}:${APP_PORT} preview=${PREVIEW_PORT} api=${API_PATH}`);

const shutdown = () => {
  if (closing) return;
  closing = true;
  server.close();
  preview.kill('SIGTERM');
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
preview.on('exit', (code, signal) => {
  if (!closing && code !== 0) {
    console.error(`E2E_PREVIEW_EXITED code=${code} signal=${signal}`);
    process.exitCode = 1;
  }
});
