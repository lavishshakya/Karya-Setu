import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CircleCheck,
  CircleDashed,
  CirclePlus,
  CircleX,
  Clock,
  FileUp,
  HardHat,
  MapPin,
  Send,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import ChartCard, { ChartLegend, ChartTooltip } from '@/components/charts/ChartCard'
import SegmentBar from '@/components/charts/SegmentBar'
import {
  SERIES,
  STATUS_COLORS,
  gridProps,
  lineCursor,
  lineProps,
  xAxisProps,
  yAxisProps,
} from '@/components/charts/chartTheme'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { PageHeader } from '@/components/ui/Misc'
import { Meter, ProgressRing } from '@/components/ui/Progress'
import StatTile from '@/components/ui/StatTile'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { candidateApplications, employerHiringTrend, employerJobs, team } from '@/data/jobs'
import { employerPayroll, payrollCycle } from '@/data/lifecycle'
import { workerById, workers } from '@/data/workers'
import { scoreCandidate } from '@/features/ai/engine/recommend'
import { formatINR, greetingKey } from '@/lib/utils'

export default function EmployerDashboard() {
  const { user } = useAuth()
  const { t } = useLang()
  const toast = useToast()
  const [invited, setInvited] = useState(() => new Set())

  const activeJobs = employerJobs.filter((j) => j.status === 'active')
  const newApplicants = candidateApplications.filter((c) => c.stage === 'new').length
  const onSite = team.filter((m) => m.today === 'present' || m.today === 'half').length
  const pending = employerPayroll.filter((p) => p.status === 'pending')
  const payrollDue = pending.reduce((sum, p) => sum + Math.round(p.days * p.rate) - p.advance, 0)
  const [prev, last] = employerHiringTrend.slice(-2)

  // AI: available workers with a matching skill for any open job they haven't applied to (best job per worker).
  const suggestions = useMemo(() => {
    const openJobs = employerJobs.filter((j) => j.status === 'active' && j.hired < j.workersNeeded)
    const applied = new Set(candidateApplications.map((c) => `${c.workerId}:${c.jobId}`))
    const seen = new Set()
    return workers
      .filter((w) => w.available)
      .flatMap((w) =>
        openJobs
          .filter((j) => !applied.has(`${w.id}:${j.id}`) && w.skills.some((s) => j.skills.includes(s.name)))
          .map((job) => ({ worker: w, job, ...scoreCandidate(job, w) })),
      )
      .sort((a, b) => b.score - a.score)
      .filter(({ worker }) => !seen.has(worker.id) && seen.add(worker.id))
      .slice(0, 3)
  }, [])

  const attendance = [
    {
      label: 'Present',
      value: team.filter((m) => m.today === 'present').length,
      color: STATUS_COLORS.good,
      icon: CircleCheck,
    },
    {
      label: 'Half day',
      value: team.filter((m) => m.today === 'half').length,
      color: STATUS_COLORS.warning,
      icon: Clock,
    },
    {
      label: 'Absent',
      value: team.filter((m) => m.today === 'absent').length,
      color: STATUS_COLORS.critical,
      icon: CircleX,
    },
    {
      label: 'On leave',
      value: team.filter((m) => m.today === 'leave').length,
      color: 'var(--chart-axis)',
      icon: CircleDashed,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={user.company}
        title={`${t(greetingKey())}, ${user.name.split(' ')[0]}`}
        description={t('dash.employerSub')}
        actions={
          <>
            <Button variant="outline" icon={MapPin} to="/employer/nearby">
              Find workers
            </Button>
            <Button icon={CirclePlus} to="/employer/post-job">
              Post a job
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-saffron-200 bg-saffron-50 p-4 sm:flex-row sm:items-center dark:border-saffron-500/25 dark:bg-saffron-500/10">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-saffron-500 text-white">
          <BadgeCheck size={20} />
        </span>
        <p className="flex-1 text-sm text-saffron-900 dark:text-saffron-100">
          <b>One step to Verified+.</b> Upload your contractor labour licence to rank higher in worker searches and
          unlock bulk hiring.
        </p>
        <Button size="sm" variant="accent" icon={FileUp} to="/employer/company">
          Upload licence
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Active jobs"
          value={activeJobs.length}
          footer={`${activeJobs.reduce((s, j) => s + j.workersNeeded - j.hired, 0)} openings to fill`}
          icon={Briefcase}
          tone="brand"
        />
        <StatTile
          label={`Applications · ${last.month}`}
          value={last.applications}
          delta={Math.round(((last.applications - prev.applications) / prev.applications) * 100)}
          deltaLabel={`vs ${prev.month}`}
          icon={Users}
          tone="sky"
          trend={employerHiringTrend.map((m) => m.applications)}
        />
        <StatTile
          label="On site today"
          value={`${onSite} / ${team.length}`}
          footer={`${newApplicants} new applicants to review`}
          icon={HardHat}
          tone="success"
        />
        <StatTile
          label="Payroll due"
          value={formatINR(payrollDue)}
          footer={`${pending.length} workers · ${payrollCycle.due.toLowerCase()}`}
          icon={Wallet}
          tone="saffron"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Applications & hires"
          subtitle="Last 6 months, all jobs"
          legend={
            <ChartLegend
              items={[
                { label: 'Applications', color: SERIES[0], type: 'line' },
                { label: 'Hires', color: SERIES[1], type: 'line' },
              ]}
            />
          }
          table={{
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'applications', label: 'Applications', align: 'right' },
              { key: 'hires', label: 'Hires', align: 'right' },
            ],
            rows: employerHiringTrend,
          }}
        >
          <ResponsiveContainer>
            <LineChart data={employerHiringTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis {...yAxisProps} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={lineCursor} />
              <Line dataKey="applications" name="Applications" stroke={SERIES[0]} {...lineProps} />
              <Line dataKey="hires" name="Hires" stroke={SERIES[1]} {...lineProps} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="flex flex-col p-5">
          <CardHeader
            title="On site today"
            subtitle={`${team.length} workers across 3 sites`}
            action={
              <Button variant="ghost" size="sm" iconRight={ArrowRight} to="/employer/attendance">
                Roster
              </Button>
            }
          />
          <SegmentBar className="mt-5" segments={attendance} />
          <div className="mt-5 space-y-2 border-t border-line pt-4">
            {team
              .filter((m) => m.today === 'absent' || m.today === 'leave')
              .map((m) => {
                const w = workerById[m.workerId]
                return (
                  <div key={m.workerId} className="flex items-center gap-3">
                    <Avatar name={w.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{w.name}</p>
                      <p className="text-xs text-muted">{m.role}</p>
                    </div>
                    <span className="text-xs font-semibold text-muted">
                      {m.today === 'absent' ? 'Not checked in' : 'On leave'}
                    </span>
                  </div>
                )
              })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader
            title="Your active jobs"
            subtitle="Fill rate and applicants"
            action={
              <Button variant="ghost" size="sm" iconRight={ArrowRight} to="/employer/jobs">
                All jobs
              </Button>
            }
          />
          <ul className="mt-3 divide-y divide-line">
            {activeJobs.map((job) => (
              <li key={job.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <CategoryIcon category={job.category} size={42} />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{job.title}</p>
                    <p className="text-sm text-muted">
                      {job.area} · {formatINR(job.wage)}/day · {job.applicants} applicants
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:w-64">
                  <Meter
                    value={job.hired}
                    max={job.workersNeeded}
                    tone={job.hired >= job.workersNeeded ? 'success' : 'brand'}
                    label={`${job.hired} of ${job.workersNeeded} hired`}
                  />
                  <span className="shrink-0 text-sm font-bold text-ink tabular">
                    {job.hired}/{job.workersNeeded}
                  </span>
                  <Link
                    to={`/employer/candidates?job=${job.id}`}
                    className="shrink-0 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
                  >
                    Review
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Sparkles size={17} className="text-violet-500" /> AI picks for you
              </span>
            }
            subtitle="Skilled workers nearby who haven't applied yet"
          />
          <ul className="mt-4 space-y-3">
            {suggestions.map(({ worker, job, score, distance }) => (
              <li key={worker.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                <Avatar name={worker.name} size={42} verified={worker.verified} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{worker.name}</p>
                  <p className="truncate text-xs text-muted">
                    {worker.primarySkill} · {distance.toFixed(1)} km · ★ {worker.rating}
                  </p>
                  <p className="truncate text-xs font-medium text-ink-2">for {job.title}</p>
                </div>
                <ProgressRing value={score} size={40} stroke={4} color="var(--color-violet-500)">
                  <span className="text-[10px] font-extrabold text-ink">{score}</span>
                </ProgressRing>
                <Button
                  size="icon-sm"
                  variant={invited.has(worker.id) ? 'secondary' : 'primary'}
                  disabled={invited.has(worker.id)}
                  aria-label={`Invite ${worker.name}`}
                  onClick={() => {
                    setInvited((s) => new Set(s).add(worker.id))
                    toast({ title: `Invite sent to ${worker.name}`, description: job.title })
                  }}
                >
                  {invited.has(worker.id) ? <CircleCheck size={16} /> : <Send size={15} />}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
