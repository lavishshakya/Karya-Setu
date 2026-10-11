import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Briefcase, Download, Handshake, IndianRupee, Percent, Star } from 'lucide-react'
import ChartCard, { ChartLegend, ChartTooltip } from '@/components/charts/ChartCard'
import {
  SERIES,
  barCursor,
  barProps,
  gridProps,
  hBarProps,
  lineCursor,
  lineProps,
  xAxisProps,
  yAxisProps,
} from '@/components/charts/chartTheme'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/Misc'
import { Meter } from '@/components/ui/Progress'
import StatTile from '@/components/ui/StatTile'
import Tabs from '@/components/ui/Tabs'
import { districts, hiringTrend, supplyDemand, topEmployers, wageTrends } from '@/data/admin'
import { formatCompact, formatINR, formatNumber } from '@/lib/utils'

const RANGES = [
  { value: '3', label: '3M' },
  { value: '6', label: '6M' },
  { value: '12', label: '12M' },
]
const SKILLS = ['Electrician', 'Plumber', 'Mason', 'Helper']
const sum = (rows, key) => rows.reduce((s, r) => s + r[key], 0)

/**
 * Direct label at the last point of a line (text in ink, never the series colour).
 * When two lines end close together, the upper label sits above its line end and the
 * lower one below, so labels never stack on top of each other or detach from their line.
 */
const endLabel = (name, lastIndex, placement) =>
  function EndLabel({ index, x, y }) {
    if (index !== lastIndex) return null
    const dy = placement === 'above' ? -7 : placement === 'below' ? 15 : 4
    return (
      <text x={x + 8} y={y} dy={dy} fontSize={11} fontWeight={600} fill="var(--ink-2)">
        {name}
      </text>
    )
  }

/** above | below | middle for each series, from how close the line ends are (in % of the value range). */
function labelPlacements(lastRow, keys, minGapPct = 7) {
  const values = keys.map((k) => lastRow[k])
  const range = Math.max(...values) - Math.min(...values) || 1
  const sorted = [...keys].sort((a, b) => lastRow[b] - lastRow[a])
  const placement = Object.fromEntries(keys.map((k) => [k, 'middle']))
  sorted.forEach((key, i) => {
    const next = sorted[i + 1]
    if (next && ((lastRow[key] - lastRow[next]) / range) * 100 < minGapPct) {
      placement[key] = 'above'
      placement[next] = 'below'
    }
  })
  return placement
}

export default function Analytics() {
  const [range, setRange] = useState('12')
  const [district, setDistrict] = useState('all')
  const months = Number(range)
  const share = district === 'all' ? 1 : districts.find((d) => d.district === district).share

  const hiring = useMemo(
    () =>
      hiringTrend
        .slice(-months)
        .map((m) => ({ ...m, posted: Math.round(m.posted * share), hired: Math.round(m.hired * share) })),
    [months, share],
  )
  const previous = hiringTrend
    .slice(-months * 2, -months)
    .map((m) => ({ posted: Math.round(m.posted * share), hired: Math.round(m.hired * share) }))
  const wages = wageTrends.slice(-months)
  const placements = labelPlacements(wages.at(-1), SKILLS)
  const wageTop = Math.ceil((Math.max(...wages.flatMap((w) => SKILLS.map((k) => w[k]))) + 20) / 100) * 100
  const wageTicks = Array.from({ length: (wageTop - 400) / 100 + 1 }, (_, i) => 400 + i * 100)
  const posted = sum(hiring, 'posted')
  const hired = sum(hiring, 'hired')
  const fillRate = Math.round((hired / posted) * 100)
  const pct = (now, before) => (before ? Math.round(((now - before) / before) * 100) : null)
  const masonNow = wages.at(-1).Mason
  const supply = supplyDemand.map((s) => ({
    ...s,
    workers: Math.round(s.workers * share),
    jobs: Math.round(s.jobs * share),
  }))

  const exportCsv = () => {
    const rows = ['month,jobs_posted,workers_hired', ...hiring.map((m) => `${m.month},${m.posted},${m.hired}`)]
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `hiring-${district}-${range}m.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Employment analytics"
        description="Hiring trends, wages and the skills gap across Rajasthan."
      />

      {/* One filter row scopes every number and chart below it. */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs value={range} onChange={setRange} tabs={RANGES} />
        <div className="w-48">
          <Select value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="District">
            <option value="all">All districts</option>
            {districts.map((d) => (
              <option key={d.district}>{d.district}</option>
            ))}
          </Select>
        </div>
        <Button variant="outline" icon={Download} className="ml-auto" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Jobs posted"
          value={formatNumber(posted)}
          delta={pct(posted, previous.length ? sum(previous, 'posted') : 0)}
          deltaLabel="vs previous period"
          footer="no earlier data"
          icon={Briefcase}
          tone="brand"
        />
        <StatTile
          label="Workers hired"
          value={formatNumber(hired)}
          delta={pct(hired, previous.length ? sum(previous, 'hired') : 0)}
          deltaLabel="vs previous period"
          footer="no earlier data"
          icon={Handshake}
          tone="success"
        />
        <StatTile label="Fill rate" value={`${fillRate}%`} footer="hires per job posted" icon={Percent} tone="sky" />
        <StatTile
          label="Mason daily wage"
          value={formatINR(masonNow)}
          delta={pct(masonNow, wages[0].Mason)}
          deltaLabel={`since ${wages[0].month}`}
          icon={IndianRupee}
          tone="saffron"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Jobs posted vs workers hired"
          subtitle={district === 'all' ? 'All districts' : district}
          legend={
            <ChartLegend
              items={[
                { label: 'Jobs posted', color: SERIES[0], type: 'line' },
                { label: 'Workers hired', color: SERIES[1], type: 'line' },
              ]}
            />
          }
          table={{
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'posted', label: 'Jobs posted', align: 'right', format: formatNumber },
              { key: 'hired', label: 'Hired', align: 'right', format: formatNumber },
            ],
            rows: hiring,
          }}
        >
          <ResponsiveContainer>
            <LineChart data={hiring} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis {...yAxisProps} tickFormatter={formatCompact} />
              <Tooltip content={<ChartTooltip />} cursor={lineCursor} />
              <Line dataKey="posted" name="Jobs posted" stroke={SERIES[0]} {...lineProps} />
              <Line dataKey="hired" name="Workers hired" stroke={SERIES[1]} {...lineProps} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Average daily wage by skill"
          subtitle="State-wide · ₹ per day"
          legend={<ChartLegend items={SKILLS.map((s, i) => ({ label: s, color: SERIES[i], type: 'line' }))} />}
          table={{
            columns: [
              { key: 'month', label: 'Month' },
              ...SKILLS.map((s) => ({ key: s, label: s, align: 'right', format: formatINR })),
            ],
            rows: wages,
          }}
        >
          <ResponsiveContainer>
            <LineChart data={wages} margin={{ top: 8, right: 76, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis {...yAxisProps} tickFormatter={(v) => `₹${v}`} domain={[400, wageTop]} ticks={wageTicks} />
              <Tooltip content={<ChartTooltip valueFormatter={formatINR} />} cursor={lineCursor} />
              {SKILLS.map((skill, i) => (
                <Line
                  key={skill}
                  dataKey={skill}
                  name={skill}
                  stroke={SERIES[i]}
                  {...lineProps}
                  label={endLabel(skill, wages.length - 1, placements[skill])}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Placement rate by district"
          subtitle={district === 'all' ? 'Hires as % of active job seekers' : `${district} highlighted`}
          table={{
            columns: [
              { key: 'district', label: 'District' },
              { key: 'workers', label: 'Workers', align: 'right', format: formatNumber },
              { key: 'placementRate', label: 'Placement rate', align: 'right', format: (v) => `${v}%` },
            ],
            rows: districts,
          }}
        >
          <ResponsiveContainer>
            <BarChart
              data={districts}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              barCategoryGap={6}
            >
              <CartesianGrid {...gridProps} horizontal={false} vertical />
              <XAxis type="number" {...xAxisProps} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="district" {...yAxisProps} width={64} />
              <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v}%`} />} cursor={barCursor} />
              <Bar dataKey="placementRate" name="Placement rate" {...hBarProps}>
                {districts.map((d) => (
                  <Cell
                    key={d.district}
                    fill={district === 'all' || d.district === district ? SERIES[0] : 'var(--chart-axis)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Skill supply vs demand"
          subtitle="Registered workers vs open jobs"
          legend={
            <ChartLegend
              items={[
                { label: 'Workers available', color: SERIES[0] },
                { label: 'Open jobs', color: SERIES[1] },
              ]}
            />
          }
          table={{
            columns: [
              { key: 'skill', label: 'Skill' },
              { key: 'workers', label: 'Workers', align: 'right', format: formatNumber },
              { key: 'jobs', label: 'Open jobs', align: 'right', format: formatNumber },
            ],
            rows: supply,
          }}
        >
          <ResponsiveContainer>
            <BarChart data={supply} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="skill" {...xAxisProps} interval={0} tick={{ ...xAxisProps.tick, fontSize: 11 }} />
              <YAxis {...yAxisProps} tickFormatter={formatCompact} />
              <Tooltip content={<ChartTooltip />} cursor={barCursor} />
              <Bar dataKey="workers" name="Workers available" fill={SERIES[0]} {...barProps} maxBarSize={18} />
              <Bar dataKey="jobs" name="Open jobs" fill={SERIES[1]} {...barProps} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="p-5 pb-3">
          <CardHeader
            title="Top employers"
            subtitle="By workers hired · on-time payment is a trust signal for workers"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="table-base min-w-[680px]">
            <thead>
              <tr>
                <th>Employer</th>
                <th className="text-right">Jobs</th>
                <th className="text-right">Hires</th>
                <th className="text-right">Rating</th>
                <th>Paid on time</th>
              </tr>
            </thead>
            <tbody>
              {topEmployers.map((e) => (
                <tr key={e.name}>
                  <td className="font-semibold text-ink">{e.name}</td>
                  <td className="text-right text-ink-2 tabular">{e.jobs}</td>
                  <td className="text-right font-bold text-ink tabular">{e.hires}</td>
                  <td className="text-right text-ink-2 tabular">
                    <span className="inline-flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" /> {e.rating}
                    </span>
                  </td>
                  <td>
                    <div className="flex w-40 items-center gap-2">
                      <Meter
                        value={e.onTime}
                        tone={e.onTime >= 90 ? 'success' : 'warning'}
                        height={6}
                        label={`${e.onTime}% on time`}
                      />
                      <span className="text-xs font-bold text-ink tabular">{e.onTime}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
