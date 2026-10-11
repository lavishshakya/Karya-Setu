import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CircleCheck, Info, Sparkles, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(() => {})

const TONES = {
  success: {
    icon: CircleCheck,
    className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  error: { icon: TriangleAlert, className: 'text-rose-600 bg-rose-50 dark:bg-rose-500/15 dark:text-rose-400' },
  info: { icon: Info, className: 'text-sky-600 bg-sky-50 dark:bg-sky-500/15 dark:text-sky-400' },
  ai: { icon: Sparkles, className: 'text-violet-600 bg-violet-50 dark:bg-violet-500/15 dark:text-violet-400' },
}

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  /** toast('Saved') or toast({ title, description, tone: 'success' | 'error' | 'info' | 'ai' }) */
  const toast = useCallback(
    (input) => {
      const item = { id: nextId++, tone: 'success', ...(typeof input === 'string' ? { title: input } : input) }
      setToasts((list) => [...list.slice(-3), item])
      setTimeout(() => dismiss(item.id), item.duration ?? 3800)
    },
    [dismiss],
  )

  return (
    <ToastContext value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-[200] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end print:hidden"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const tone = TONES[t.tone] ?? TONES.success
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 pr-2.5 shadow-pop"
              >
                <span className={cn('grid size-8 shrink-0 place-items-center rounded-xl', tone.className)}>
                  <tone.icon size={17} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-semibold text-ink">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-xs text-ink-2">{t.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink"
                  aria-label="Dismiss"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
