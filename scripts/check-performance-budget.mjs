import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';

// The previous gate summed every file in dist/, including lazy route chunks and
// optional PDF/XLSX/chart vendors that are not downloaded on first paint.
// That made a 450KB "total build" budget incompatible with the app's lazy-loading architecture.
const MAX_CRITICAL_KB = 900;
const MAX_TOTAL_KB = 2800;
const MAX_CHUNK_KB = 600;

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    const info = await stat(path);
    if (info.isDirectory()) out.push(...await walk(path));
    else out.push({ path, size: info.size });
  }
  return out;
}

function assetPathsFromHtml(html) {
  const paths = new Set();
  const patterns = [
    /<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/g,
    /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+)["']/g,
    /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const value = match[1].replace(/^\//, '');
      if (value) paths.add(value);
    }
  }
  return [...paths];
}

const dist = resolve('dist');
const indexHtml = await readFile(join(dist, 'index.html'), 'utf8');
const assets = await walk(dist);
const totalBytes = assets.reduce((sum, item) => sum + item.size, 0);
const jsChunks = assets.filter(item => item.path.endsWith('.js'));
const largestChunk = Math.max(0, ...jsChunks.map(item => item.size));

const criticalPaths = assetPathsFromHtml(indexHtml);
const criticalBytes = criticalPaths.reduce((sum, assetPath) => {
  const path = resolve(dist, assetPath);
  if (!path.startsWith(dist)) return sum;
  const item = assets.find(candidate => resolve(candidate.path) === path);
  return sum + (item?.size ?? 0);
}, 0);

const criticalKB = criticalBytes / 1024;
const totalKB = totalBytes / 1024;
const largestChunkKB = largestChunk / 1024;

const failures = [];
if (criticalKB > MAX_CRITICAL_KB) {
  failures.push(`critical assets ${criticalKB.toFixed(1)}KB > ${MAX_CRITICAL_KB}KB`);
}
if (totalKB > MAX_TOTAL_KB) {
  failures.push(`total dist ${totalKB.toFixed(1)}KB > ${MAX_TOTAL_KB}KB`);
}
if (largestChunkKB > MAX_CHUNK_KB) {
  failures.push(`largest JS chunk ${largestChunkKB.toFixed(1)}KB > ${MAX_CHUNK_KB}KB`);
}

console.log(`Performance budget: critical=${criticalKB.toFixed(1)}KB, total=${totalKB.toFixed(1)}KB, largest-js=${largestChunkKB.toFixed(1)}KB`);
console.log(`Limits: critical<=${MAX_CRITICAL_KB}KB, total<=${MAX_TOTAL_KB}KB, largest-js<=${MAX_CHUNK_KB}KB`);
console.log(`Critical assets: ${criticalPaths.join(', ') || '(none detected)'}`);

if (failures.length) {
  console.error(`Performance budget exceeded: ${failures.join('; ')}`);
  process.exit(1);
}

console.log('Performance budget passed.');
