const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const ARABIC_INDIC_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function normalizeArabicDigits(text: string): string {
  let result = text;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(ARABIC_DIGITS[i], 'g'), String(i));
    result = result.replace(new RegExp(ARABIC_INDIC_DIGITS[i], 'g'), String(i));
  }
  return result;
}

export function normalizeArabicText(text: string): string {
  if (typeof text !== 'string') return text;
  return text
    .replace(/[\u0640]/g, '')
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\u0622/g, '\u0627')
    .replace(/\u0623/g, '\u0627')
    .replace(/\u0625/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeWhitespace(text: string): string {
  if (typeof text !== 'string') return text;
  return text.replace(/\s+/g, ' ').trim();
}

/** Canonical header normalization used by schema discovery and column mapping. */
export function normalizeHeader(name: string): string {
  return normalizeArabicText(normalizeWhitespace(normalizeArabicDigits(name))).toLowerCase();
}

export function normalizeValue(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    let v = normalizeArabicDigits(value);
    v = normalizeWhitespace(v);
    return v;
  }
  return value;
}

export function normalizeRow(row: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeWhitespace(key);
    result[normalizedKey] = normalizeValue(value);
  }
  return result;
}

export function normalizeRows(rows: Record<string, any>[]): Record<string, any>[] {
  return rows.map(normalizeRow);
}

export function normalizeColumnName(name: string): string {
  return normalizeHeader(name);
}

export function isSKU(value: any): boolean {
  if (typeof value !== 'string') return false;
  const v = String(value).trim();
  if (v.length === 0 || v.length > 50) return false;
  if (/^0\d+/.test(v)) return true;
  if (/^[A-Z]{2,5}[-]?\d{2,8}$/i.test(v)) return true;
  if (/^[A-Z0-9]{3,15}$/i.test(v) && /\d/.test(v) && /[A-Z]/i.test(v)) return true;
  return false;
}

export function isPhone(value: any): boolean {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const v = normalizeArabicDigits(String(value)).replace(/[\s\-+()]/g, '');
  return /^0?\d{9,15}$/.test(v);
}

export function isEmail(value: any): boolean {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Parse integers/decimals from Arabic or Western input without losing locale decimals. */
export function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  let v = normalizeArabicDigits(String(value))
    .replace(/[٬]/g, ',')
    .replace(/[٫]/g, '.')
    .replace(/[\u00A0\u202F\s]/g, '')
    .replace(/[−–—]/g, '-');

  v = v.replace(/[^\d,.-]/g, '');
  if (v === '' || v === '-') return null;

  const comma = v.lastIndexOf(',');
  const dot = v.lastIndexOf('.');
  if (comma >= 0 && dot >= 0) {
    if (comma > dot) v = v.replace(/\./g, '').replace(',', '.');
    else v = v.replace(/,/g, '');
  } else if (comma >= 0) {
    const fractionalDigits = v.length - comma - 1;
    if (fractionalDigits > 0 && fractionalDigits <= 2) v = v.replace(',', '.');
    else v = v.replace(/,/g, '');
  } else if ((v.match(/\./g) || []).length > 1) {
    v = v.replace(/\./g, '');
  }

  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function parseCurrency(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  return parseNumber(value);
}

export function parseDate(value: any): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  const v = normalizeArabicDigits(String(value)).trim();

  const isoMatch = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;

  const slashMatch = v.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})$/);
  if (slashMatch) {
    let [_, d, m, y] = slashMatch;
    if (y.length === 2) y = '20' + y;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return null;
}
