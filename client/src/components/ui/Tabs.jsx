import { useId } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/** Segmented control with a sliding indicator. tabs: [{ value, label, count?, icon? }] */
export default function Tabs({ tabs, value, onChange, className, fullWidth = false }) {
  const layoutId = useId()
  return (
    <div
      role="tablist"
      className={cn(
        'no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors',
              fullWidth && 'flex-1',
              active ? 'text-ink' : 'text-muted hover:text-ink-2',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-surface shadow-sm ring-1 ring-line"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-1.5">
              {tab.icon && <tab.icon size={15} />}
              {tab.label}
              {tab.count != null && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[11px] leading-[18px]',
                    active
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200'
                      : 'bg-surface-3 text-muted',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
