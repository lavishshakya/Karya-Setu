import { Link } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-brand-600 text-white shadow-sm shadow-brand-700/20 hover:bg-brand-700 dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400',
  accent: 'bg-saffron-500 text-white shadow-sm shadow-saffron-600/25 hover:bg-saffron-600',
  secondary: 'bg-surface-2 text-ink hover:bg-surface-3',
  outline: 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  'danger-soft':
    'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  ai: 'bg-linear-to-r from-violet-600 to-fuchsia-500 text-white shadow-sm shadow-violet-600/25 hover:brightness-110',
  white: 'bg-white text-brand-800 shadow-sm hover:bg-brand-50',
  glass: 'border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20',
}

const sizes = {
  xs: 'h-7 gap-1 rounded-lg px-2.5 text-xs',
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-[15px]',
  icon: 'size-10 rounded-xl',
  'icon-sm': 'size-8 rounded-lg',
}

const iconSizes = { xs: 14, sm: 15, md: 16, lg: 18, icon: 18, 'icon-sm': 16 }

/**
 * <Button to="/path"> renders a router Link, <Button href> an anchor, otherwise a button.
 * `icon` / `iconRight` take a lucide component.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className,
  children,
  disabled,
  ...props
}) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )
  const iconSize = iconSizes[size]
  const content = (
    <>
      {loading ? <LoaderCircle size={iconSize} className="animate-spin" /> : Icon && <Icon size={iconSize} />}
      {children}
      {IconRight && <IconRight size={iconSize} />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  )
}
