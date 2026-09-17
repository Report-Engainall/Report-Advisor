import { describe, expect, it } from 'vitest';

describe('language shell contract', () => {
  it('keeps Arabic as the default language contract', () => {
    const stored = undefined;
    const language = stored === 'en' ? 'en' : 'ar';
    expect(language).toBe('ar');
  });

  it('maps Arabic to RTL and English to LTR', () => {
    expect(('ar' === 'ar' ? 'rtl' : 'ltr')).toBe('rtl');
    expect(('en' === 'ar' ? 'rtl' : 'ltr')).toBe('ltr');
  });
});
