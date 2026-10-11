// Shared Recharts settings so every chart follows the same mark specs:
// solid hairline grid, recessive axes, ≤24px bars with 4px rounded data-ends,
// 2px lines, ≥8px active dots ringed in the surface colour, 10% area wash.

/** Categorical slots in fixed order — colour follows the entity, never its rank. */
export const SERIES = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
  'var(--series-7)',
  'var(--series-8)',
]

/** Reserved status palette — only for series that *mean* good / bad, always with icon + label. */
export const STATUS_COLORS = {
  good: 'var(--status-good)',
  warning: 'var(--status-warning)',
  serious: 'var(--status-serious)',
  critical: 'var(--status-critical)',
}

const tick = { fill: 'var(--chart-text)', fontSize: 12 }

export const xAxisProps = { tick, tickLine: false, axisLine: { stroke: 'var(--chart-axis)' }, tickMargin: 8 }
export const yAxisProps = { tick, tickLine: false, axisLine: false, width: 48, tickMargin: 4 }
export const gridProps = { stroke: 'var(--chart-grid)', vertical: false }
export const barProps = { radius: [4, 4, 0, 0], maxBarSize: 24 }
export const hBarProps = { radius: [0, 4, 4, 0], maxBarSize: 20 }
export const lineProps = {
  type: 'monotone',
  strokeWidth: 2,
  dot: false,
  activeDot: { r: 5, strokeWidth: 2, stroke: 'var(--surface)' },
}
export const lineCursor = { stroke: 'var(--chart-axis)', strokeWidth: 1 }
export const barCursor = { fill: 'var(--surface-2)', opacity: 0.7 }
