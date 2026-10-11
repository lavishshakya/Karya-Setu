import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ArrowRight,
  CalendarCheck,
  Circle,
  CircleCheck,
  ClipboardList,
  GraduationCap,
  IndianRupee,
  MapPin,
  QrCode,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react'
import ChartCard, { ChartTooltip } from '@/components/charts/ChartCard'
import { SERIES, barCursor, barProps, gridProps, xAxisProps, yAxisProps } from '@/components/charts/chartTheme'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/Progress'
import StatTile from '@/components/ui/StatTile'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { jobById, jobs, workerApplications } from '@/data/jobs'
import { workerMonthlyEarnings, workerPayments } from '@/data/lifecycle'
import { workerProfile } from '@/data/workers'
import { recommendJobs } from '@/features/ai/engine/recommend'
import { cn, formatINR, formatINRCompact, greetingKey } from '@/lib/utils'
import JobCard from './JobCard'
import JobDetail from './JobDetail'

const VERIFICATION_LABELS = {
  phone: 'Phone number verified',
  aadhaar: 'Aadhaar e-KYC done',
  skills: 'Skills certified',
  bank: 'Bank account linked',
  police: 'Police verification',
}

export default function WorkerDashboard() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const toast = useToast()
  const navigate = useNavigate()
  const [available, setAvailable] = useState(true)
  const [applied, setApplied] = useState(() => new Set(workerApplications.map((a) => a.jobId)))
  const [detail, setDetail] = useState({ open: false, match: null })

  // Recommendations the worker hasn't applied to yet, computed once per visit.
  const recommendations = useMemo(
    () =>
      recommendJobs(workerProfile, jobs)
        .filter((r) => !workerApplications.some((a) => a.jobId === r.job.id))
        .slice(0, 3),
    [],
  )

  const [prevMonth, lastMonth] = workerMonthlyEarnings.slice(-2)
  const earningsDelta = Math.round(((lastMonth.earned - prevMonth.earned) / prevMonth.earned) * 100)
  const activeApps = workerApplications.filter((a) => ['applied', 'viewed', 'shortlisted'].includes(a.stage))
  const verification = Object.entries(workerProfile.verification)
  const strength = Math.round((verification.filter(([, ok]) => ok).length / verification.length) * 100)
  const hiredJob = jobById[workerApplications.find((a) => a.stage === 'hired').jobId]

  const apply = (job) => {
    setApplied((s) => new Set(s).add(job.id))
    toast({ title: `Applied to ${job.employer.name}`, description: "We'll notify you as soon as they respond." })
  }

  const [now] = useState(() => new Date())
  const today = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 p-6 text-white sm:p-8">
        <div className="absolute inset-0 [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:36px_36px] opacity-[0.08]" />
        <div className="absolute -top-24 -right-16 size-72 rounded-full bg-saffron-400/30 blur-3xl" />
        <svg
          viewBox="0 0 400 160"
          className="pointer-events-none absolute right-0 bottom-0 hidden w-[420px] opacity-20 lg:block"
          aria-hidden="true"
        >
          <path d="M10 150 Q200 -10 390 150" fill="none" stroke="white" strokeWidth="3" />
          <path d="M0 152 H400" stroke="white" strokeWidth="3" />
        </svg>

        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-white/70">{today}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t(greetingKey())}, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="mt-1 text-white/80">{t('dash.workerSub')}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setAvailable((a) => !a)
                  toast({
                    tone: 'info',
                    title: available ? 'Marked as not taking work' : 'You are visible to employers again',
                  })
                }}
                aria-pressed={available}
                className="flex h-10 items-center gap-2.5 rounded-full bg-white/10 pr-4 pl-1.5 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white/15"
              >
                <span
                  className={cn(
                    'relative h-7 w-12 rounded-full transition',
                    available ? 'bg-emerald-400' : 'bg-white/25',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 left-1 size-5 rounded-full bg-white shadow transition',
                      available && 'translate-x-5',
                    )}
                  />
                </span>
                {available ? t('dash.available') : t('dash.unavailable')}
              </button>
              <Link
                to="/worker/id"
                className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white/15"
              >
                <QrCode size={16} /> {workerProfile.workerId}
              </Link>
            </div>
          </div>

          <div className="w-full rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur lg:w-72">
            <p className="text-xs font-bold tracking-wider text-white/70 uppercase">{t('dash.today')}</p>
            <p className="mt-1 font-bold">{hiredJob.title}</p>
            <p className="flex items-center gap-1 text-sm text-white/75">
              <MapPin size={14} /> {hiredJob.area} · {hiredJob.shift}
            </p>
            <Button variant="white" size="sm" icon={CalendarCheck} to="/worker/attendance" className="mt-3 w-full">
              Check in at site
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={`Earnings · ${lastMonth.month}`}
          value={formatINR(lastMonth.earned)}
          delta={earningsDelta}
          deltaLabel={`vs ${prevMonth.month}`}
          icon={IndianRupee}
          tone="success"
          trend={workerMonthlyEarnings.map((m) => m.earned)}
        />
        <StatTile
          label={`Days worked · ${lastMonth.month}`}
          value={`${lastMonth.days} days`}
          footer="of 26 working days"
          icon={CalendarCheck}
          tone="brand"
        />
        <StatTile
          label="Active applications"
          value={activeApps.length}
          footer={`${activeApps.filter((a) => a.stage === 'shortlisted').length} shortlisted`}
          icon={ClipboardList}
          tone="sky"
        />
        <StatTile
          label="Your rating"
          value={`${workerProfile.rating} ★`}
          footer={`from ${workerProfile.reviews} employer reviews`}
          icon={Star}
          tone="saffron"
        />
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <Sparkles size={19} className="text-violet-500" /> {t('dash.recommended')}
            </h2>
            <p className="text-sm text-muted">{t('dash.recommendedSub')}</p>
          </div>
          <Button variant="ghost" size="sm" iconRight={ArrowRight} to="/worker/jobs">
            {t('common.viewAll')}
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((r) => (
            <JobCard
              key={r.job.id}
              job={r.job}
              match={r}
              applied={applied.has(r.job.id)}
              onApply={() => apply(r.job)}
              onOpen={() => setDetail({ open: true, match: r })}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title={t('dash.earnings')}
          subtitle="Last 6 months · ₹ earned"
          table={{
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'days', label: 'Days worked', align: 'right' },
              { key: 'earned', label: 'Earned', align: 'right', format: formatINR },
            ],
            rows: workerMonthlyEarnings,
          }}
        >
          <ResponsiveContainer>
            <BarChart data={workerMonthlyEarnings} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis {...yAxisProps} tickFormatter={formatINRCompact} />
              <Tooltip content={<ChartTooltip valueFormatter={formatINR} />} cursor={barCursor} />
              <Bar dataKey="earned" name="Earned" fill={SERIES[0]} {...barProps} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="p-5">
          <CardHeader title="Profile strength" subtitle="Complete profiles get up to 3× more offers" />
          <div className="mt-5 flex items-center gap-5">
            <ProgressRing value={strength} size={88} stroke={9}>
              <span className="text-xl font-extrabold text-ink">{strength}%</span>
            </ProgressRing>
            <ul className="min-w-0 space-y-1.5 text-sm">
              {verification.map(([key, ok]) => (
                <li key={key} className={cn('flex items-center gap-2', ok ? 'text-ink-2' : 'font-semibold text-ink')}>
                  {ok ? (
                    <CircleCheck size={16} className="shrink-0 text-emerald-600" />
                  ) : (
                    <Circle size={16} className="shrink-0 text-muted" />
                  )}
                  <span className="truncate">{VERIFICATION_LABELS[key]}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button variant="outline" className="mt-5 w-full" to="/worker/profile" iconRight={ArrowRight}>
            Complete your profile
          </Button>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden p-5">
          <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-saffron-300/30 blur-2xl dark:bg-saffron-500/10" />
          <span className="relative grid size-11 place-items-center rounded-xl bg-saffron-100 text-saffron-700 dark:bg-saffron-500/15 dark:text-saffron-300">
            <TrendingUp size={21} />
          </span>
          <h3 className="relative mt-4 text-lg font-bold text-ink">Tile fitters near you earn 12% more</h3>
          <p className="relative mt-1 text-sm text-ink-2">
            You already have 65/100 in tiling. A free 3-week PMKVY course can close the gap.
          </p>
          <Button variant="accent" icon={GraduationCap} className="relative mt-4" to="/worker/training">
            See training
          </Button>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <CardHeader
            title="Recent payments"
            subtitle="Every rupee, tracked"
            action={
              <Button variant="ghost" size="sm" iconRight={ArrowRight} onClick={() => navigate('/worker/payments')}>
                {t('common.viewAll')}
              </Button>
            }
          />
          <ul className="mt-3 divide-y divide-line">
            {workerPayments.slice(0, 4).map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <IndianRupee size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{p.employer}</p>
                  <p className="text-xs text-muted">
                    {p.period} · {p.days} days × {formatINR(p.rate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">{formatINR(p.net)}</p>
                  <StatusBadge status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <JobDetail
        open={detail.open}
        job={detail.match?.job}
        match={detail.match}
        applied={detail.match && applied.has(detail.match.job.id)}
        onApply={() => apply(detail.match.job)}
        onMessage={() => navigate('/worker/messages')}
        onClose={() => setDetail((d) => ({ ...d, open: false }))}
      />
    </div>
  )
}
