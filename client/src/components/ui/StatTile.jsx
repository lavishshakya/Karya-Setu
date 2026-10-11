import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from './Card'

const iconTones = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  saffron: 'bg-saffron-50 text-saffron-600 dark:bg-saffron-500/10 dark:text-saffron-300',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
}

/**
 * Stat tile contract: label · value · optional delta vs a named period · optional sparkline.
 * Delta colour = direction × whether "up" is good for this metric.
 */
export default function StatTile({
  label,
  value,
  delta,
  deltaLabel = 'vs last month',
  upIsGood = true,
  icon: Icon,
  tone = 'brand',
  trend,
  footer,
  className,
}) {
  const up = delta > 0
  const good = delta === 0 || up === upIsGood
  return (
    <Card className={cn('flex flex-col p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-2">{label}</p>
        {Icon && (
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', iconTones[tone])}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{value}</p>
      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        {delta != null ? (
          <p className="flex flex-wrap items-center gap-x-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                good ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {up ? '+' : ''}
              {delta}%
            </span>
            <span className="text-muted">{deltaLabel}</span>
          </p>
        ) : (
          footer && <p className="text-xs text-muted">{footer}</p>
        )}
        {trend && <Sparkline data={trend} />}
      </div>
    </Card>
  )
}

/** 12-point sparkline: history in the de-emphasis grey, the current period in the accent. */
export function Sparkline({ data, width = 88, height = 30, accent = 'var(--color-brand-500)' }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const points = data.map((v, i) => [
    (i / (data.length - 1)) * (width - 6) + 3,
    height - 4 - ((v - min) / (max - min || 1)) * (height - 8),
  ])
  const [lx, ly] = points[points.length - 1]
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0" aria-hidden="true">
      <polyline
        points={points.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke="var(--chart-axis)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lx} cy={ly} r="3.5" fill={accent} stroke="var(--surface)" strokeWidth="2" />
    </svg>
  )
}
