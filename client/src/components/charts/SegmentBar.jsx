import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Part-to-whole bar (stacked, 2px surface gaps) with a legend that carries icon + label + count,
 * so status is never shown by colour alone. segments: [{ label, value, color, icon? }]
 */
export default function SegmentBar({ segments, height = 12, className, columns = 2 }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  return (
    <div className={className}>
      <div
        className="flex w-full gap-[2px] overflow-hidden rounded-full"
        style={{ height }}
        role="img"
        aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(', ')}
      >
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <motion.div
              key={s.label}
              title={`${s.label}: ${s.value}`}
              initial={{ width: 0 }}
              animate={{ width: `${(s.value / total) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
              style={{ background: s.color }}
            />
          ))}
      </div>
      <ul className={cn('mt-4 grid gap-x-4 gap-y-2', columns === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
            {s.icon && <s.icon size={14} className="shrink-0 text-muted" />}
            <span className="truncate text-ink-2">{s.label}</span>
            <span className="ml-auto font-bold text-ink tabular">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
