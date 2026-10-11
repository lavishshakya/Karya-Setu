import { cloneElement, isValidElement, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Label + control + hint/error. The label is linked to the child control via a generated id. */
export function Field({ label, hint, error, required, className, children }) {
  const generatedId = useId()
  const id = (isValidElement(children) && children.props.id) || generatedId
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-ink">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {isValidElement(children) ? cloneElement(children, { id }) : children}
      {error ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  )
}

/** `suffix` is static text (e.g. "/day"); `trailing` is an interactive element (e.g. show-password). */
export function Input({ icon: Icon, suffix, trailing, className, ...props }) {
  if (!Icon && !suffix && !trailing) return <input className={cn('control h-11', className)} {...props} />
  return (
    <div className="relative">
      {Icon && <Icon size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />}
      <input className={cn('control h-11', Icon && 'pl-10', (suffix || trailing) && 'pr-12', className)} {...props} />
      {suffix && (
        <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm font-medium text-muted">
          {suffix}
        </span>
      )}
      {trailing && <span className="absolute top-1/2 right-2 -translate-y-1/2">{trailing}</span>}
    </div>
  )
}

export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select className={cn('control h-11 appearance-none pr-10', className)} {...props}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted" />
    </div>
  )
}

export function Textarea({ className, rows = 4, ...props }) {
  return <textarea rows={rows} className={cn('control resize-y py-2.5 leading-relaxed', className)} {...props} />
}

export function Switch({ checked, onChange, label, description, className, size = 'md' }) {
  return (
    <label className={cn('flex cursor-pointer items-center justify-between gap-4', className)}>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-semibold text-ink">{label}</span>}
          {description && <span className="block text-xs text-muted">{description}</span>}
        </span>
      )}
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={cn(
            'rounded-full bg-surface-3 transition-colors peer-checked:bg-brand-500 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/25',
            size === 'sm' ? 'h-5 w-9' : 'h-6 w-11',
          )}
        />
        <span
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform',
            size === 'sm' ? 'size-4 peer-checked:translate-x-4' : 'size-5 peer-checked:translate-x-5',
          )}
        />
      </span>
    </label>
  )
}

/** Toggleable pill used for filters and multi-select options. */
export function Chip({ active, onClick, icon: Icon, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap transition',
        active
          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
          : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink',
        className,
      )}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  )
}
