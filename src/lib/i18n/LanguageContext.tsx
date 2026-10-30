'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import en from './en.json'
import bn from './bn.json'

export type Locale = 'en' | 'bn'

const dictionaries: Record<Locale, Record<string, string>> = { en, bn }

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
})

const STORAGE_KEY = 'vocale-locale'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored === 'en' || stored === 'bn') {
        setLocaleState(stored)
      } else if (stored === 'it') {
        // Migrate users who previously selected Italian to Bangla.
        setLocaleState('bn')
        localStorage.setItem(STORAGE_KEY, 'bn')
      }
    } catch {
      // SSR or storage unavailable — ignore
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {
      // storage unavailable — ignore
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'bn' ? 'bn' : 'en'
  }, [locale])

  const t = useCallback(
    (key: string): string => {
      return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key
    },
    [locale]
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
