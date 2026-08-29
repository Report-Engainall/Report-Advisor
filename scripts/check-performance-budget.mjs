import { readFile, readdir, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';

// Performance must reflect both first-load critical assets and the compressed
// network payload. The raw dist footprint is retained as a deployment-sanity
// guard, but optional lazy PDF/XLSX/chart assets must not fail a network budget
// merely because they are present in the deployment artifact.
const MAX_CRITICAL_KB = 900;
const MAX_TOTAL_RAW_KB = 5500;
const MAX_TOTAL_GZIP_KB = 1800;
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
const totalGzipBytes = assets.reduce((sum, item) => sum + gzipSync(readFileSync(item.path), { level: 9 }).length, 0);
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
const totalRawKB = totalBytes / 1024;
const totalGzipKB = totalGzipBytes / 1024;
const largestChunkKB = largestChunk / 1024;

const failures = [];
if (criticalKB > MAX_CRITICAL_KB) failures.push(`critical assets ${criticalKB.toFixed(1)}KB > ${MAX_CRITICAL_KB}KB`);
if (totalRawKB > MAX_TOTAL_RAW_KB) failures.push(`raw dist ${totalRawKB.toFixed(1)}KB > ${MAX_TOTAL_RAW_KB}KB`);
if (totalGzipKB > MAX_TOTAL_GZIP_KB) failures.push(`gzip dist ${totalGzipKB.toFixed(1)}KB > ${MAX_TOTAL_GZIP_KB}KB`);
if (largestChunkKB > MAX_CHUNK_KB) failures.push(`largest JS chunk ${largestChunkKB.toFixed(1)}KB > ${MAX_CHUNK_KB}KB`);

console.log(`Performance budget: critical=${criticalKB.toFixed(1)}KB, raw=${totalRawKB.toFixed(1)}KB, gzip=${totalGzipKB.toFixed(1)}KB, largest-js=${largestChunkKB.toFixed(1)}KB`);
console.log(`Limits: critical<=${MAX_CRITICAL_KB}KB, raw<=${MAX_TOTAL_RAW_KB}KB, gzip<=${MAX_TOTAL_GZIP_KB}KB, largest-js<=${MAX_CHUNK_KB}KB`);
console.log(`Critical assets: ${criticalPaths.join(', ') || '(none detected)'}`);

if (failures.length) {
  console.error(`Performance budget exceeded: ${failures.join('; ')}`);
  process.exit(1);
}

console.log('Performance budget passed.');
