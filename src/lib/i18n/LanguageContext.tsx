'use client'

import { createContext, useContext, useState, useEffect, useCallback, useSyncExternalStore, type ReactNode } from 'react'
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

const STORAGE_KEY = 'freightiq-locale'

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener('freightiq-locale-change', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('freightiq-locale-change', callback)
  }
}

function getSnapshot(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'bn') return stored
    if (stored === 'it') {
      localStorage.setItem(STORAGE_KEY, 'bn')
      return 'bn'
    }
  } catch {
    // ignore
  }
  return 'en'
}

function getServerSnapshot(): Locale {
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [fallbackLocale, setFallbackLocale] = useState<Locale | null>(null)
  const storeLocale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const locale = fallbackLocale ?? storeLocale

  const setLocale = useCallback((newLocale: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
      window.dispatchEvent(new Event('freightiq-locale-change'))
    } catch {
      setFallbackLocale(newLocale)
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
