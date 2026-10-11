import { Fragment } from 'react'
import { Check, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-bold tracking-wider text-brand-600 uppercase dark:text-brand-300">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-2 sm:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 print:hidden">{actions}</div>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      {Icon && (
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-surface-2 text-muted">
          <Icon size={26} />
        </span>
      )}
      <p className="font-bold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <LoaderCircle className="animate-spin text-brand-500" size={28} />
    </div>
  )
}

/** Horizontal step indicator for multi-step forms. */
export function Stepper({ steps, current, className }) {
  return (
    <ol className={cn('flex items-center', className)}>
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <Fragment key={step}>
            <li className="flex items-center gap-2.5">
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors',
                  done && 'bg-brand-500 text-white',
                  active && 'bg-brand-50 text-brand-700 ring-2 ring-brand-500 dark:bg-brand-500/15 dark:text-brand-200',
                  !done && !active && 'bg-surface-2 text-muted',
                )}
              >
                {done ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('hidden text-sm font-semibold md:block', active ? 'text-ink' : 'text-muted')}>
                {step}
              </span>
            </li>
            {i < steps.length - 1 && (
              <li aria-hidden="true" className="mx-2 h-0.5 min-w-4 flex-1 rounded-full bg-surface-3 sm:mx-3">
                <span
                  className="block h-full rounded-full bg-brand-500 transition-all duration-500"
                  style={{ width: done ? '100%' : '0%' }}
                />
              </li>
            )}
          </Fragment>
        )
      })}
    </ol>
  )
}
