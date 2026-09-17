import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type SupportedLanguage = 'ar' | 'en';

type LanguageContextValue = {
  language: SupportedLanguage;
  direction: 'rtl' | 'ltr';
  setLanguage: (language: SupportedLanguage) => void;
  toggleLanguage: () => void;
};

const STORAGE_KEY = 'report-advisor-language';
const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'ar';
  return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(readInitialLanguage);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const setLanguage = (next: SupportedLanguage) => setLanguageState(next);
  const toggleLanguage = () => setLanguageState(current => current === 'ar' ? 'en' : 'ar');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.documentElement.dataset.language = language;
    document.documentElement.dataset.direction = direction;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language, direction]);

  const value = useMemo(() => ({ language, direction, setLanguage, toggleLanguage }), [language, direction]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}
