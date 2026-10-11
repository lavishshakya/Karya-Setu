import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Award,
  CircleCheck,
  Clock,
  GraduationCap,
  Laptop,
  MapPin,
  Play,
  Star,
  Target,
  TrendingUp,
  TriangleAlert,
  Users,
} from 'lucide-react'
import ChartCard, { ChartTooltip } from '@/components/charts/ChartCard'
import { SERIES, barCursor, gridProps, hBarProps, xAxisProps, yAxisProps } from '@/components/charts/chartTheme'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/Misc'
import { Meter } from '@/components/ui/Progress'
import StatTile from '@/components/ui/StatTile'
import { useToast } from '@/context/ToastContext'
import { courses, skillDemand, skillGap } from '@/data/training'
import { cn } from '@/lib/utils'

const MODE_ICONS = { Online: Laptop, Classroom: MapPin, Hybrid: Users, Assessment: Target }

export default function Training() {
  const toast = useToast()
  const [enrolled, setEnrolled] = useState(() => new Set(courses.filter((c) => c.progress !== null).map((c) => c.id)))
  const gaps = skillGap.filter((s) => s.you < s.market)
  const skillScore = Math.round(
    (skillGap.reduce((sum, s) => sum + Math.min(s.you / s.market, 1), 0) / skillGap.length) * 100,
  )
  const biggest = [...gaps].sort((a, b) => b.market - b.you - (a.market - a.you))[0]

  return (
    <>
      <PageHeader
        title="Training & skill gap"
        description="See where you stand against what employers near you ask for, then close the gap with free government courses."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Skill readiness"
          value={`${skillScore}/100`}
          footer="vs. employer requirements in Jaipur"
          icon={Target}
          tone="brand"
        />
        <StatTile
          label="Gaps to close"
          value={gaps.length}
          footer={`Biggest: ${biggest.skill} (−${biggest.market - biggest.you})`}
          icon={TriangleAlert}
          tone="saffron"
        />
        <StatTile
          label="Potential wage gain"
          value="+12%"
          footer="after Advanced tiling course"
          icon={TrendingUp}
          tone="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="p-5">
          <CardHeader title="Your skill gap" subtitle="Bar = your level · tick = what employers ask for" />
          <ul className="mt-6 space-y-5">
            {skillGap.map((s) => {
              const gap = s.market - s.you
              const ok = gap <= 0
              return (
                <li key={s.skill} className="grid grid-cols-[110px_1fr_auto] items-center gap-4">
                  <span className="truncate text-sm font-bold text-ink">{s.skill}</span>
                  <Meter
                    value={s.you}
                    target={s.market}
                    tone={ok ? 'success' : gap > 25 ? 'danger' : 'warning'}
                    height={10}
                    label={`${s.skill}: ${s.you} of ${s.market}`}
                  />
                  <span
                    className={cn(
                      'flex w-24 items-center justify-end gap-1 text-xs font-bold',
                      ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-ink-2',
                    )}
                  >
                    {ok ? (
                      <>
                        <CircleCheck size={14} /> On track
                      </>
                    ) : (
                      <>
                        <TriangleAlert size={14} className={gap > 25 ? 'text-rose-600' : 'text-amber-600'} /> {gap} to
                        go
                      </>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>

        <ChartCard
          title="Most in-demand skills near you"
          subtitle="Open jobs in Jaipur district, last 30 days"
          height={280}
          table={{
            columns: [
              { key: 'skill', label: 'Skill' },
              { key: 'jobs', label: 'Open jobs', align: 'right' },
            ],
            rows: skillDemand,
          }}
        >
          <ResponsiveContainer>
            <BarChart
              data={skillDemand}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              barCategoryGap={8}
            >
              <CartesianGrid {...gridProps} horizontal={false} vertical />
              <XAxis type="number" {...xAxisProps} />
              <YAxis type="category" dataKey="skill" {...yAxisProps} width={96} />
              <Tooltip content={<ChartTooltip />} cursor={barCursor} />
              <Bar dataKey="jobs" name="Open jobs" fill={SERIES[0]} {...hBarProps} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h2 className="mt-8 mb-4 flex items-center gap-2 text-lg font-bold text-ink">
        <GraduationCap size={20} className="text-brand-600" /> Recommended courses
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((c) => {
          const ModeIcon = MODE_ICONS[c.mode] ?? MapPin
          const isEnrolled = enrolled.has(c.id)
          const done = c.progress === 100
          return (
            <Card key={c.id} interactive className="flex flex-col p-5">
              <div className="flex flex-wrap gap-1.5">
                {c.recommended && (
                  <Badge tone="ai" icon={TrendingUp}>
                    Closes your gap
                  </Badge>
                )}
                <Badge tone="brand">{c.scheme}</Badge>
                <Badge tone="success">Free</Badge>
              </div>
              <h3 className="mt-3 text-lg leading-snug font-bold text-ink">{c.title}</h3>
              <p className="mt-0.5 text-sm text-ink-2">{c.provider}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-ink-2">
                <span className="flex items-center gap-1.5">
                  <ModeIcon size={15} className="text-muted" /> {c.mode}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-muted" /> {c.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={15} className="fill-amber-400 text-amber-400" /> {c.rating}
                </span>
              </div>
              {c.wageUplift > 0 && (
                <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Workers who finish earn ~{c.wageUplift}% more
                </p>
              )}
              {c.progress !== null && !done && (
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs font-semibold text-muted">
                    <span>Progress</span>
                    <span>{c.progress}%</span>
                  </div>
                  <Meter value={c.progress} label={`${c.title} progress`} />
                </div>
              )}
              <div className="mt-auto flex items-center justify-between gap-2 pt-5">
                <span className="text-xs font-semibold text-muted">{c.starts}</span>
                {done ? (
                  <Badge tone="success" icon={Award} size="md">
                    Certified
                  </Badge>
                ) : isEnrolled ? (
                  <Button
                    size="sm"
                    icon={Play}
                    onClick={() => toast({ tone: 'info', title: 'Opening course…', description: c.provider })}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEnrolled((s) => new Set(s).add(c.id))
                      toast({ title: 'Seat reserved', description: `${c.title} · ${c.starts}` })
                    }}
                  >
                    Enrol free
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
