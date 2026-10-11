import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }

/**
 * side="center" → dialog (bottom sheet on phones); side="right" → slide-over drawer.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  footer,
  size = 'md',
  side = 'center',
  children,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const drawer = side === 'right'

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            'fixed inset-0 z-[100] flex print:hidden',
            drawer ? 'justify-end' : 'items-end justify-center sm:items-center sm:p-4',
          )}
        >
          <motion.div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            initial={drawer ? { x: '100%' } : { opacity: 0, y: 48, scale: 0.98 }}
            animate={drawer ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={drawer ? { x: '100%' } : { opacity: 0, y: 48, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className={cn(
              'relative flex w-full flex-col border-line bg-surface shadow-pop',
              drawer
                ? 'h-full max-w-xl border-l'
                : cn('max-h-[92dvh] rounded-t-3xl border sm:rounded-3xl', widths[size]),
            )}
          >
            {(title || Icon) && (
              <div className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
                {Icon && (
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <Icon size={20} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-ink">{title}</h2>
                  {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="-mr-1 rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
