import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/** Circular progress (match %, profile strength). The track is a lighter step of the same hue. */
export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  color = 'var(--color-brand-500)',
  track = 'var(--surface-3)',
  className,
  children,
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  return (
    <div
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - Math.min(value, 100) / 100) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {children ?? <span className="text-sm font-bold text-ink">{value}%</span>}
      </div>
    </div>
  )
}

const meterTones = {
  brand: ['bg-brand-500', 'bg-brand-100 dark:bg-brand-500/15'],
  success: ['bg-emerald-500', 'bg-emerald-100 dark:bg-emerald-500/15'],
  warning: ['bg-amber-400', 'bg-amber-100 dark:bg-amber-500/15'],
  danger: ['bg-rose-500', 'bg-rose-100 dark:bg-rose-500/15'],
  ai: ['bg-violet-500', 'bg-violet-100 dark:bg-violet-500/15'],
  saffron: ['bg-saffron-500', 'bg-saffron-100 dark:bg-saffron-500/15'],
}

/** Linear meter with an optional target tick (used for skill-gap "bullet" bars). */
export function Meter({ value, max = 100, target, tone = 'brand', height = 8, className, label }) {
  const [fill, trackClass] = meterTones[tone]
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className={cn('relative w-full rounded-full', trackClass, className)}
      style={{ height }}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <motion.div
        className={cn('h-full rounded-full', fill)}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      {target != null && (
        <span
          className="absolute -top-1 -bottom-1 w-[3px] -translate-x-1/2 rounded-full bg-ink ring-2 ring-surface"
          style={{ left: `${(target / max) * 100}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
