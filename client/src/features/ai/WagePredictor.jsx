import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Info, Sparkles, TrendingUp } from 'lucide-react'
import ChartCard, { ChartTooltip } from '@/components/charts/ChartCard'
import {
  SERIES,
  barCursor,
  gridProps,
  hBarProps,
  lineCursor,
  lineProps,
  xAxisProps,
  yAxisProps,
} from '@/components/charts/chartTheme'
import Badge from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Field, Select, Switch } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/Misc'
import Tabs from '@/components/ui/Tabs'
import { useAuth } from '@/context/AuthContext'
import { workerProfile } from '@/data/workers'
import { cn, formatINR, formatINRCompact } from '@/lib/utils'
import { DISTRICT_FACTOR, SKILL_BASE_WAGE, predictWage, wageByDistrict, wageCurve } from './engine/wage'

// Pad the wage curve and snap to clean ₹100 ticks.
const ROUNDED_DOMAIN = [(min) => Math.floor((min - 40) / 100) * 100, (max) => Math.ceil((max + 40) / 100) * 100]

const WORK_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'contract', label: 'Contract' },
]

/** AI wage prediction (Member 4) — shared by the worker and employer portals. */
export default function WagePredictor() {
  const { user } = useAuth()
  const isWorker = user.role === 'worker'
  const [form, setForm] = useState({
    skill: isWorker ? workerProfile.primarySkill : 'Mason',
    district: 'Jaipur',
    experience: isWorker ? workerProfile.experience : 5,
    certified: true,
    workType: 'daily',
  })
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const result = useMemo(() => predictWage(form), [form])
  const curve = useMemo(() => wageCurve(form), [form])
  const regions = useMemo(() => wageByDistrict(form), [form])
  const position = ((result.daily - result.min) / (result.max - result.min)) * 100

  return (
    <>
      <PageHeader
        eyebrow="AI tools"
        title="Wage predictor"
        description={
          isWorker
            ? 'Know your worth before you accept a job. Estimates update as you change your skill, district and experience.'
            : 'Price your job fairly so good workers apply fast. Estimates update as you change the role and location.'
        }
        actions={
          <Badge tone="ai" icon={Sparkles} size="md">
            Rule-based model v1
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="h-fit p-5 lg:sticky lg:top-24">
          <h2 className="font-bold text-ink">{isWorker ? 'Your profile' : 'Job details'}</h2>
          <div className="mt-4 space-y-4">
            <Field label="Skill">
              <Select value={form.skill} onChange={(e) => set('skill')(e.target.value)}>
                {Object.keys(SKILL_BASE_WAGE).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="District">
              <Select value={form.district} onChange={(e) => set('district')(e.target.value)}>
                {Object.keys(DISTRICT_FACTOR).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </Field>
            <Field label={`Experience: ${form.experience} ${form.experience === 1 ? 'year' : 'years'}`}>
              <input
                type="range"
                min={0}
                max={20}
                value={form.experience}
                onChange={(e) => set('experience')(Number(e.target.value))}
                className="w-full"
              />
            </Field>
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink">Engagement</p>
              <Tabs fullWidth tabs={WORK_TYPES} value={form.workType} onChange={set('workType')} />
            </div>
            <Switch
              checked={form.certified}
              onChange={set('certified')}
              label="Skill certificate"
              description="PMKVY, ITI or RPL certified"
            />
          </div>
        </Card>

        <div className="min-w-0 space-y-6">
          <Card className="relative overflow-hidden p-5 sm:p-6">
            <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-brand-400/15 blur-3xl" />
            <p className="relative text-sm font-semibold text-ink-2">
              Predicted fair wage · {form.skill} in {form.district}
            </p>
            <div className="relative mt-1 flex items-end gap-2">
              <motion.span
                key={result.daily}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-extrabold tracking-tight text-ink sm:text-6xl"
              >
                {formatINR(result.daily)}
              </motion.span>
              <span className="mb-1.5 text-lg font-semibold text-muted">/day</span>
            </div>
            <p className="relative mt-1 text-sm text-ink-2">
              About {formatINR(result.monthly)} a month (26 working days) · {Math.round(result.confidence)}% confidence
            </p>

            <div className="relative mt-6 max-w-xl">
              <div className="flex justify-between text-xs font-semibold text-muted">
                <span>Low {formatINR(result.min)}</span>
                <span>High {formatINR(result.max)}</span>
              </div>
              <div className="relative mt-2 h-3 rounded-full bg-linear-to-r from-brand-100 via-brand-300 to-brand-100 dark:from-brand-900 dark:via-brand-700 dark:to-brand-900">
                <motion.span
                  className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 ring-4 ring-surface"
                  animate={{ left: `${position}%` }}
                  transition={{ type: 'spring', damping: 20 }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                Most {form.skill.toLowerCase()} jobs in {form.district} pay within this band.
              </p>
            </div>

            <ul className="relative mt-6 grid gap-2 sm:grid-cols-2">
              <li className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5">
                <span className="text-sm text-ink-2">Base rate for {form.skill.toLowerCase()}</span>
                <span className="text-sm font-bold text-ink">{formatINR(result.base)}</span>
              </li>
              {result.factors.map((f) => (
                <li key={f.label} className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5">
                  <span className="text-sm text-ink-2">{f.label}</span>
                  <span
                    className={cn(
                      'text-sm font-bold',
                      f.pct > 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : f.pct < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-muted',
                    )}
                  >
                    {f.pct > 0 ? '+' : ''}
                    {f.pct}%
                  </span>
                </li>
              ))}
            </ul>

            {!isWorker && (
              <div className="relative mt-5 flex gap-3 rounded-xl border border-saffron-200 bg-saffron-50 p-3.5 text-sm text-saffron-900 dark:border-saffron-500/25 dark:bg-saffron-500/10 dark:text-saffron-100">
                <TrendingUp size={18} className="mt-0.5 shrink-0" />
                Offering at least {formatINR(result.min)}/day keeps your job competitive. Jobs priced below the band get
                far fewer applicants on Karya Setu.
              </div>
            )}
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard
              title="Wage grows with experience"
              subtitle={`${form.skill}, ${form.district} · ₹ per day`}
              table={{
                columns: [
                  { key: 'years', label: 'Experience (years)' },
                  { key: 'wage', label: 'Daily wage', align: 'right', format: formatINR },
                ],
                rows: curve,
              }}
            >
              <ResponsiveContainer>
                <LineChart data={curve} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="years" {...xAxisProps} tickFormatter={(v) => `${v}y`} interval={3} />
                  <YAxis {...yAxisProps} tickFormatter={(v) => `₹${v}`} domain={ROUNDED_DOMAIN} />
                  <Tooltip
                    content={
                      <ChartTooltip valueFormatter={formatINR} labelFormatter={(l) => `${l} years of experience`} />
                    }
                    cursor={lineCursor}
                  />
                  <Line dataKey="wage" name="Daily wage" stroke={SERIES[0]} {...lineProps} />
                  <ReferenceDot
                    x={form.experience}
                    y={result.daily}
                    r={6}
                    fill={SERIES[0]}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Same profile across districts"
              subtitle={`${form.district} highlighted · ₹ per day`}
              table={{
                columns: [
                  { key: 'district', label: 'District' },
                  { key: 'wage', label: 'Daily wage', align: 'right', format: formatINR },
                ],
                rows: regions,
              }}
            >
              <ResponsiveContainer>
                <BarChart
                  data={regions}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap={5}
                >
                  <CartesianGrid {...gridProps} horizontal={false} vertical />
                  <XAxis type="number" {...xAxisProps} tickFormatter={formatINRCompact} />
                  <YAxis type="category" dataKey="district" {...yAxisProps} width={64} />
                  <Tooltip content={<ChartTooltip valueFormatter={formatINR} />} cursor={barCursor} />
                  <Bar dataKey="wage" name="Daily wage" {...hBarProps}>
                    {regions.map((r) => (
                      <Cell key={r.district} fill={r.district === form.district ? SERIES[0] : 'var(--chart-axis)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <p className="flex gap-2 text-xs text-muted">
            <Info size={14} className="mt-px shrink-0" />
            Estimates use a transparent rule-based model on regional wage data and will be replaced by a trained model
            as platform data grows. Always check your state’s notified minimum wage.
          </p>
        </div>
      </div>
    </>
  )
}
