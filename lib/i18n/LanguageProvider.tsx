// lib/i18n/LanguageProvider.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  translations,
  LOCALES,
  translate,
  type Locale,
  type TranslationKey,
} from './translations';

type Ctx = {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<Ctx | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>('en');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gh_lang') as Locale | null;
      if (saved && LOCALES.some(l => l.code === saved)) {
        setLangState(saved);
      } else {
        const nav = navigator.language.slice(0, 2) as Locale;
        if (LOCALES.some(l => l.code === nav)) setLangState(nav);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    try { localStorage.setItem('gh_lang', l); } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translate(lang, key),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}