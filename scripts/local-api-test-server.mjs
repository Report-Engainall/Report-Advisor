import http from 'node:http';
import handler from '../api/canonical-import-execute.ts';

const port = Number(process.env.CANONICAL_API_PORT || 4174);

function vercelResponse(raw) {
  return {
    status(code) {
      raw.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      raw.setHeader(name, value);
      return this;
    },
    end(body) {
      raw.end(body);
    },
  };
}

const server = http.createServer(async (req, rawRes) => {
  if (req.method === 'GET' && req.url === '/__health') {
    rawRes.statusCode = 200;
    rawRes.setHeader('Content-Type', 'text/plain; charset=utf-8');
    rawRes.end('ok');
    return;
  }
  if (!req.url?.startsWith('/api/')) {
    rawRes.statusCode = 404;
    rawRes.end('not_found');
    return;
  }
  try {
    await handler(req, vercelResponse(rawRes));
  } catch (error) {
    rawRes.statusCode = 500;
    rawRes.setHeader('Content-Type', 'application/json; charset=utf-8');
    rawRes.end(JSON.stringify({ status: 'failed', error: error instanceof Error ? error.message : String(error) }));
  }
});

server.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`canonical-api-test-server:listening:${port}`);
});
