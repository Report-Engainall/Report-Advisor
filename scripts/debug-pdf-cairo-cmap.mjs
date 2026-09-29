import fs from 'node:fs/promises';
import zlib from 'node:zlib';

const file = 'tests/fixtures/realistic-reports/الصراف العامري.pdf';
const pdf = await fs.readFile(file);
const raw = pdf.toString('latin1');

function u16(buf, o) { return buf.readUInt16BE(o); }
function u32(buf, o) { return buf.readUInt32BE(o); }

function objectStream(objectNumber) {
  const marker = `\\n${objectNumber} 0 obj`;
  let pos = raw.indexOf(marker);
  if (pos < 0) pos = raw.indexOf(`${objectNumber} 0 obj`);
  if (pos < 0) return null;
  const stream = raw.indexOf('stream', pos);
  const end = raw.indexOf('endstream', stream);
  if (stream < 0 || end < 0) return null;
  let start = stream + 6;
  if (raw[start] === '\\r' && raw[start + 1] === '\\n') start += 2;
  else if (raw[start] === '\\n') start += 1;
  const dict = raw.slice(pos, stream);
  return { dict, bytes: Buffer.from(raw.slice(start, end), 'latin1') };
}

function buildReverseCmap(fontBytes) {
  const numTables = u16(fontBytes, 4);
  let cmapOffset = -1;
  for (let i = 0; i < numTables; i += 1) {
    const o = 12 + i * 16;
    const tag = fontBytes.toString('ascii', o, o + 4);
    if (tag === 'cmap') cmapOffset = u32(fontBytes, o + 8);
  }
  if (cmapOffset < 0) throw new Error('TTF_CMAP_NOT_FOUND');
  const cmap = fontBytes.subarray(cmapOffset);
  const numSubtables = u16(cmap, 2);
  const reverse = new Map();
  const add = (glyph, cp) => {
    if (!glyph) return;
    const list = reverse.get(glyph) ?? [];
    if (!list.includes(cp)) list.push(cp);
    reverse.set(glyph, list);
  };

  for (let i = 0; i < numSubtables; i += 1) {
    const rec = 4 + i * 8;
    const subOffset = u32(cmap, rec + 4);
    const sub = cmap.subarray(subOffset);
    const format = u16(sub, 0);

    if (format === 4) {
      const segCount = u16(sub, 6) / 2;
      const endBase = 14;
      const startBase = endBase + segCount * 2 + 2;
      const deltaBase = startBase + segCount * 2;
      const rangeBase = deltaBase + segCount * 2;
      for (let s = 0; s < segCount; s += 1) {
        const end = u16(sub, endBase + s * 2);
        const start = u16(sub, startBase + s * 2);
        const delta = u16(sub, deltaBase + s * 2);
        const range = u16(sub, rangeBase + s * 2);
        for (let cp = start; cp <= end && cp !== 0xffff; cp += 1) {
          let glyph = 0;
          if (range === 0) glyph = (cp + delta) & 0xffff;
          else {
            const roWord = rangeBase + s * 2;
            const glyphPos = roWord + range + 2 * (cp - start);
            if (glyphPos + 2 <= sub.length) {
              glyph = u16(sub, glyphPos);
              if (glyph) glyph = (glyph + delta) & 0xffff;
            }
          }
          if (glyph) add(glyph, cp);
        }
      }
    } else if (format === 12) {
      const groups = u32(sub, 12);
      let p = 16;
      for (let g = 0; g < groups; g += 1) {
        const start = u32(sub, p), end = u32(sub, p + 4), startGlyph = u32(sub, p + 8);
        for (let cp = start; cp <= end; cp += 1) add(startGlyph + (cp - start), cp);
        p += 12;
      }
    }
  }
  return reverse;
}

const fontObj = objectStream(8);
if (!fontObj) throw new Error('FONT_OBJECT_8_NOT_FOUND');
const fontBytes = fontObj.dict.includes('/FlateDecode') ? zlib.inflateSync(fontObj.bytes) : fontObj.bytes;
const reverse = buildReverseCmap(fontBytes);

function decodeHex(hex) {
  const out = [];
  for (let i = 0; i + 3 < hex.length; i += 4) {
    const glyph = Number.parseInt(hex.slice(i, i + 4), 16);
    const cps = reverse.get(glyph);
    if (cps?.length) out.push(String.fromCodePoint(cps[0]));
    else out.push('�');
  }
  return out.join('');
}

const decoded = [];
for (let objectNumber = 1; objectNumber <= 20; objectNumber += 1) {
  const obj = objectStream(objectNumber);
  if (!obj || !obj.dict.includes('/FlateDecode')) continue;
  let inflated;
  try { inflated = zlib.inflateSync(obj.bytes).toString('latin1'); } catch { continue; }
  if (!inflated.includes('BT')) continue;
  for (const line of inflated.split(/\r?\n/)) {
    if (!line.includes('/F3') || !line.includes('Td')) continue;
    const pos = /([0-9.]+)\s+([0-9.]+)\s+Td/.exec(line);
    if (!pos) continue;
    for (const m of line.matchAll(/<([0-9A-Fa-f]+)>/g)) {
      const text = decodeHex(m[1]);
      const arabicCount = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
      if (arabicCount) decoded.push({ objectNumber, x: Number(pos[1]), y: Number(pos[2]), hex: m[1], text });
    }
  }
}

console.log(JSON.stringify({
  file,
  pdfBytes: pdf.length,
  ttfBytes: fontBytes.length,
  reverseGlyphCount: reverse.size,
  headerBand: decoded.filter((x) => x.y >= 625 && x.y <= 640).sort((a,b) => a.x - b.x),
  firstArabic: decoded.slice(0, 80),
}, null, 2));
