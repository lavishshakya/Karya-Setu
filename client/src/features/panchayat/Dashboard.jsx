import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  CalendarPlus,
  Download,
  GraduationCap,
  HardHat,
  Landmark,
  MapPin,
  Search,
  Tent,
  Users,
} from 'lucide-react'
import ChartCard, { ChartLegend, ChartTooltip } from '@/components/charts/ChartCard'
import {
  SERIES,
  barCursor,
  barProps,
  gridProps,
  hBarProps,
  xAxisProps,
  yAxisProps,
} from '@/components/charts/chartTheme'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import StatTile from '@/components/ui/StatTile'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import {
  events,
  localSkills,
  panchayatInfo,
  panchayatStats,
  personDays,
  villageWorkers,
  wardEmployment,
} from '@/data/panchayat'
import { formatCompact, formatNumber, greetingKey } from '@/lib/utils'

const EVENT_ICONS = { Camp: Tent, 'Job fair': Briefcase, Training: GraduationCap }

export default function PanchayatDashboard() {
  const { user } = useAuth()
  const { t } = useLang()
  const toast = useToast()
  const idle = villageWorkers.filter((w) => w.daysIdle >= 30).sort((a, b) => b.daysIdle - a.daysIdle)
  const employedPct = Math.round((panchayatStats.employed / panchayatStats.registered) * 100)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-teal-700 to-brand-900 p-6 text-white sm:p-8">
        <div className="absolute inset-0 [background-image:radial-gradient(white_1.5px,transparent_1.5px)] [background-size:22px_22px] opacity-10" />
        <div className="absolute -right-10 -bottom-16 size-72 rounded-full bg-saffron-400/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-white/75">
              <MapPin size={15} /> {panchayatInfo.block} block · {panchayatInfo.district}, {panchayatInfo.state}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{panchayatInfo.name}</h1>
            <p className="mt-1 text-white/80">
              {t(greetingKey())}, {user.title} {user.name.split(' ')[0]} ji · {t('dash.panchayatSub')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">
                Population {formatNumber(panchayatInfo.population)}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">
                {formatNumber(panchayatInfo.households)} households
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">8 wards</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="glass"
              icon={Download}
              onClick={() =>
                toast({ title: 'Monthly report ready', description: 'Shared with the Block Development Officer.' })
              }
            >
              Monthly report
            </Button>
            <Button
              variant="white"
              icon={CalendarPlus}
              onClick={() =>
                toast({ title: 'Camp request sent', description: 'The district skill office will confirm a date.' })
              }
            >
              Schedule a camp
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Registered workers"
          value={formatNumber(panchayatStats.registered)}
          delta={6}
          deltaLabel="this quarter"
          icon={Users}
          tone="brand"
        />
        <StatTile
          label="Employed this month"
          value={formatNumber(panchayatStats.employed)}
          footer={`${employedPct}% of registered workers`}
          icon={HardHat}
          tone="success"
        />
        <StatTile
          label="Seeking work"
          value={formatNumber(panchayatStats.seeking)}
          delta={-9}
          upIsGood={false}
          deltaLabel="vs last month"
          icon={Search}
          tone="saffron"
        />
        <StatTile
          label="Scheme enrolments"
          value={formatNumber(panchayatStats.enrollments)}
          delta={14}
          deltaLabel="this quarter"
          icon={Landmark}
          tone="violet"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Employment by ward"
          subtitle="Registered workers, this month"
          legend={
            <ChartLegend
              items={[
                { label: 'Employed', color: SERIES[0] },
                { label: 'Seeking work', color: SERIES[1] },
              ]}
            />
          }
          table={{
            columns: [
              { key: 'ward', label: 'Ward' },
              { key: 'employed', label: 'Employed', align: 'right' },
              { key: 'seeking', label: 'Seeking work', align: 'right' },
            ],
            rows: wardEmployment,
          }}
        >
          <ResponsiveContainer>
            <BarChart data={wardEmployment} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="ward" {...xAxisProps} tickFormatter={(v) => v.replace('Ward ', 'W')} />
              <YAxis {...yAxisProps} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={barCursor} />
              <Bar
                dataKey="employed"
                name="Employed"
                stackId="w"
                fill={SERIES[0]}
                maxBarSize={28}
                stroke="var(--surface)"
                strokeWidth={2}
              />
              <Bar
                dataKey="seeking"
                name="Seeking work"
                stackId="w"
                fill={SERIES[1]}
                maxBarSize={28}
                radius={[4, 4, 0, 0]}
                stroke="var(--surface)"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Person-days of work"
          subtitle="Generated each month"
          table={{
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'days', label: 'Person-days', align: 'right', format: formatNumber },
            ],
            rows: personDays,
          }}
        >
          <ResponsiveContainer>
            <BarChart data={personDays} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis {...yAxisProps} width={36} tickFormatter={formatCompact} />
              <Tooltip content={<ChartTooltip />} cursor={barCursor} />
              <Bar dataKey="days" name="Person-days" fill={SERIES[0]} {...barProps} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader
            title="Needs attention"
            subtitle="No work for 30+ days. Match them with jobs or schemes."
            action={
              <Button variant="ghost" size="sm" iconRight={ArrowRight} to="/panchayat/workers">
                All workers
              </Button>
            }
          />
          <ul className="mt-3 divide-y divide-line">
            {idle.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center gap-3 py-3">
                <Avatar name={w.name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">{w.name}</p>
                  <p className="text-xs text-muted">
                    Ward {w.ward} · {w.skill} · {w.age} yrs
                  </p>
                </div>
                <Badge tone="danger">{w.daysIdle} days idle</Badge>
                {!w.eShram && <Badge tone="warning">No e-Shram</Badge>}
                <Button size="sm" variant="outline" to="/panchayat/schemes">
                  Schemes
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <ChartCard
            title="Local skills"
            subtitle="Registered workers by primary skill"
            height={230}
            table={{
              columns: [
                { key: 'skill', label: 'Skill' },
                { key: 'workers', label: 'Workers', align: 'right' },
              ],
              rows: localSkills,
            }}
          >
            <ResponsiveContainer>
              <BarChart
                data={localSkills}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                barCategoryGap={4}
              >
                <CartesianGrid {...gridProps} horizontal={false} vertical />
                <XAxis type="number" {...xAxisProps} />
                <YAxis type="category" dataKey="skill" {...yAxisProps} width={96} />
                <Tooltip content={<ChartTooltip />} cursor={barCursor} />
                <Bar dataKey="workers" name="Workers" fill={SERIES[0]} {...hBarProps} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card className="p-5">
            <CardHeader title="Upcoming" icon={CalendarDays} />
            <ul className="mt-4 space-y-3">
              {events.map((e) => {
                const Icon = EVENT_ICONS[e.kind]
                return (
                  <li key={e.id} className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">{e.title}</p>
                      <p className="text-xs text-muted">
                        {e.date} · {e.place}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
