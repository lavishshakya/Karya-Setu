import { useId } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

export function LanguageToggle({ className }) {
  const { lang, toggleLang, t } = useLang()
  const pillId = useId()
  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t('top.language')}
      title={t('top.language')}
      className={cn(
        'inline-flex h-9 items-center rounded-full border border-line bg-surface-2 p-0.5 text-xs font-bold',
        className,
      )}
    >
      {['en', 'hi'].map((code) => (
        <span
          key={code}
          className={cn(
            'relative grid h-full min-w-9 place-items-center rounded-full px-2 transition-colors',
            lang === code ? 'text-ink' : 'text-muted',
          )}
        >
          {lang === code && (
            <motion.span
              layoutId={pillId}
              className="absolute inset-0 rounded-full bg-surface shadow-sm ring-1 ring-line"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative">{code === 'en' ? 'EN' : 'हिं'}</span>
        </span>
      ))}
    </button>
  )
}

export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLang()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t('top.theme')}
      title={t('top.theme')}
      className={cn(
        'grid size-9 place-items-center overflow-hidden rounded-full border border-line bg-surface-2 text-ink-2 transition hover:text-ink',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.18 }}
        >
          {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
