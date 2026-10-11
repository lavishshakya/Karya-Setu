import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { dictionaries } from '@/lib/i18n'

const LanguageContext = createContext(null)

function readLang() {
  try {
    return localStorage.getItem('ks_lang') === 'hi' ? 'hi' : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const toggleLang = useCallback(() => {
    const next = lang === 'en' ? 'hi' : 'en'
    setLang(next)
    try {
      localStorage.setItem('ks_lang', next)
    } catch {
      // ignore
    }
  }, [lang])

  const t = useCallback(
    (key, vars) => {
      const text = dictionaries[lang][key] ?? dictionaries.en[key] ?? key
      return vars ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '') : text
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, toggleLang, t }), [lang, toggleLang, t])
  return <LanguageContext value={value}>{children}</LanguageContext>
}

export function useLang() {
  return useContext(LanguageContext)
}
