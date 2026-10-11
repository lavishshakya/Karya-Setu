import { cn } from '@/lib/utils'

export function Card({ as: Component = 'div', className, interactive = false, children, ...props }) {
  return (
    <Component
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-card',
        interactive && 'transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ title, subtitle, icon: Icon, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Icon size={18} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-bold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
