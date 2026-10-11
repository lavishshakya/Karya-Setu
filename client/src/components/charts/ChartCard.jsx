import { useState } from 'react'
import { ChartColumn, Table } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn, formatNumber } from '@/lib/utils'

/**
 * Chart container: title, optional legend/action, and a chart ⇄ table toggle.
 * The table view is the accessible twin of every chart (and the relief channel for
 * the light-mode palette slots that sit under 3:1 contrast).
 *
 * table: { columns: [{ key, label, align?, format? }], rows: [...] }
 */
export default function ChartCard({ title, subtitle, action, legend, table, height = 260, className, children }) {
  const [view, setView] = useState('chart')
  return (
    <Card className={cn('flex flex-col p-4 sm:p-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="font-bold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {table && (
            <div className="inline-flex rounded-lg bg-surface-2 p-0.5" role="group" aria-label="Show as">
              {[
                ['chart', ChartColumn, 'Chart view'],
                ['table', Table, 'Table view'],
              ].map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  aria-label={label}
                  title={label}
                  className={cn(
                    'grid size-7 place-items-center rounded-md transition',
                    view === key ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
                  )}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {legend && view === 'chart' && <div className="mt-3">{legend}</div>}
      <div className="mt-4 flex-1">
        {view === 'chart' || !table ? (
          <div style={{ height }}>{children}</div>
        ) : (
          <div className="scrollbar-thin overflow-auto rounded-xl border border-line" style={{ height }}>
            <table className="table-base">
              <thead className="sticky top-0 z-10 bg-surface-2">
                <tr>
                  {table.columns.map((c) => (
                    <th key={c.key} className={cn(c.align === 'right' && 'text-right')}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i}>
                    {table.columns.map((c) => (
                      <td key={c.key} className={cn('text-ink tabular', c.align === 'right' && 'text-right')}>
                        {c.format ? c.format(row[c.key], row) : row[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  )
}

/** Legend keys mirror the mark: a short line for lines, a rounded square for bars/areas. */
export function ChartLegend({ items, className }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs font-medium text-ink-2">
          {item.type === 'line' ? (
            <span className="h-0.5 w-3.5 rounded-full" style={{ background: item.color }} />
          ) : (
            <span className="size-2.5 rounded-[3px]" style={{ background: item.color }} />
          )}
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/** Tooltip: the value leads (strong), the series name follows; rows keyed by a short line. */
export function ChartTooltip({ active, payload, label, valueFormatter = formatNumber, labelFormatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-36 rounded-xl border border-line bg-surface px-3 py-2.5 shadow-pop">
      <p className="mb-1.5 text-xs font-medium text-muted">{labelFormatter ? labelFormatter(label, payload) : label}</p>
      <ul className="space-y-1">
        {payload.map((item) => (
          <li key={item.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="h-0.5 w-3 shrink-0 rounded-full"
              style={{ background: item.color ?? item.stroke ?? item.fill }}
            />
            <span className="text-sm font-bold text-ink tabular">{valueFormatter(item.value, item)}</span>
            <span className="text-ink-2">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
