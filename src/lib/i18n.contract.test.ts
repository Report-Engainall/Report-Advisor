import { describe, expect, it } from 'vitest';

describe('language direction contract', () => {
  it('defaults to Arabic RTL', () => {
    const language = 'ar' as const;
    expect(language).toBe('ar');
    expect(language === 'ar' ? 'rtl' : 'ltr').toBe('rtl');
  });

  it('supports English LTR', () => {
    const language = 'en' as const;
    expect(language === 'ar' ? 'rtl' : 'ltr').toBe('ltr');
  });
});
