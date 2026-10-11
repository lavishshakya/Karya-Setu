import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  CircleX,
  Clock,
  Fingerprint,
  LoaderCircle,
  LogIn,
  LogOut,
  MapPin,
  Save,
  Star,
  Timer,
} from 'lucide-react'
import ChartCard, { ChartLegend, ChartTooltip } from '@/components/charts/ChartCard'
import { STATUS_COLORS, barCursor, gridProps, xAxisProps, yAxisProps } from '@/components/charts/chartTheme'
import Avatar from '@/components/ui/Avatar'
import Badge, { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/Misc'
import { ProgressRing } from '@/components/ui/Progress'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { sites, team } from '@/data/jobs'
import { buildMonthAttendance, workHistory } from '@/data/lifecycle'
import { workerById } from '@/data/workers'
import { cn, formatDate, formatTime, haversineKm } from '@/lib/utils'

const SITE = {
  name: 'Sanganer boundary wall',
  employer: 'Sharma Constructions',
  shift: '8:00 AM – 5:00 PM',
  location: { lat: 26.8206, lng: 75.7969 },
}

const DAY_STYLES = {
  present: ['bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200', CircleCheck, 'Present'],
  half: ['bg-amber-50 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200', Clock, 'Half day'],
  absent: ['bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200', CircleX, 'Absent'],
  off: ['bg-surface-2 text-muted', null, 'Weekly off'],
  today: ['bg-surface text-ink ring-2 ring-brand-500', null, 'Today'],
  upcoming: ['border border-dashed border-line text-muted/60', null, 'Upcoming'],
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function WorkerAttendance() {
  const toast = useToast()
  const now = useNow()
  const [shift, setShift] = useState({ state: 'out', inAt: null, outAt: null, distance: null })
  const [locating, setLocating] = useState(false)
  const [cursor, setCursor] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }))
  const days = useMemo(() => buildMonthAttendance(cursor.y, cursor.m), [cursor])

  const isCurrentMonth = cursor.y === now.getFullYear() && cursor.m === now.getMonth()
  const offset = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7
  const count = (s) => days.filter((d) => d.status === s).length
  const workdays = days.filter((d) => ['present', 'half', 'absent'].includes(d.status)).length
  const rate = workdays ? Math.round(((count('present') + count('half') * 0.5) / workdays) * 100) : 0
  const hours = days.reduce((sum, d) => sum + d.hours, 0)
  const overtime = days.reduce((sum, d) => sum + d.overtime, 0)
  const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(
    new Date(cursor.y, cursor.m, 1),
  )

  const shiftCursor = (delta) =>
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  const checkIn = () => {
    setLocating(true)
    const finish = (meters, simulated) => {
      setLocating(false)
      setShift({ state: 'in', inAt: new Date(), outAt: null, distance: meters })
      toast({
        title: 'Checked in',
        description: simulated
          ? `Demo: location simulated ${meters} m from site`
          : `GPS verified · ${meters} m from site`,
      })
    }
    if (!navigator.geolocation) return finish(120, true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const meters = Math.round(haversineKm({ lat: coords.latitude, lng: coords.longitude }, SITE.location) * 1000)
        // Far from the demo site (e.g. testing elsewhere): simulate an on-site reading.
        if (meters < 500) finish(meters, false)
        else finish(120, true)
      },
      () => finish(120, true),
      { enableHighAccuracy: true, timeout: 6000 },
    )
  }

  const checkOut = () => {
    setShift((s) => ({ ...s, state: 'done', outAt: new Date() }))
    toast({ title: 'Checked out', description: 'Your hours are saved to your work history.' })
  }

  const worked = shift.inAt ? Math.max(0, ((shift.outAt ?? now) - shift.inAt) / 3600000) : 0

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Check in with GPS at the site. Every day you work becomes part of your verified work history."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="relative overflow-hidden p-6 text-center lg:sticky lg:top-24 lg:self-start">
          <div className="pointer-events-none absolute -top-20 left-1/2 size-60 -translate-x-1/2 rounded-full bg-brand-300/25 blur-3xl" />
          <p className="relative text-sm font-semibold text-muted">
            {formatDate(now, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <p className="relative mt-1 text-5xl font-extrabold tracking-tight text-ink tabular">
            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <div className="relative mt-4 rounded-2xl bg-surface-2 p-3 text-left">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Building2 size={16} className="text-brand-600" /> {SITE.name}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {SITE.employer} · {SITE.shift}
            </p>
          </div>

          <div className="relative my-7 grid place-items-center">
            {shift.state === 'in' && (
              <span className="absolute size-40 animate-ping-slow rounded-full bg-emerald-400/30" />
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              disabled={locating || shift.state === 'done'}
              onClick={shift.state === 'out' ? checkIn : checkOut}
              className={cn(
                'relative grid size-40 place-items-center rounded-full text-white shadow-xl transition disabled:opacity-70',
                shift.state === 'out' && 'bg-linear-to-br from-brand-500 to-brand-700 shadow-brand-600/30',
                shift.state === 'in' && 'bg-linear-to-br from-emerald-500 to-emerald-700 shadow-emerald-600/30',
                shift.state === 'done' && 'bg-linear-to-br from-slate-400 to-slate-600',
              )}
            >
              <span className="flex flex-col items-center gap-1.5">
                {locating ? (
                  <LoaderCircle size={34} className="animate-spin" />
                ) : shift.state === 'out' ? (
                  <Fingerprint size={38} />
                ) : shift.state === 'in' ? (
                  <LogOut size={34} />
                ) : (
                  <CircleCheck size={36} />
                )}
                <span className="text-sm font-bold">
                  {locating
                    ? 'Locating…'
                    : shift.state === 'out'
                      ? 'Check in'
                      : shift.state === 'in'
                        ? 'Check out'
                        : 'Day complete'}
                </span>
              </span>
            </motion.button>
          </div>

          <div className="relative grid grid-cols-3 gap-2 text-center">
            {[
              [LogIn, 'In', shift.inAt ? formatTime(shift.inAt) : '—'],
              [LogOut, 'Out', shift.outAt ? formatTime(shift.outAt) : '—'],
              [Timer, 'Hours', worked ? `${worked.toFixed(1)} h` : '—'],
            ].map(([Icon, label, value]) => (
              <div key={label} className="rounded-xl bg-surface-2 p-2.5">
                <Icon size={15} className="mx-auto text-muted" />
                <p className="mt-1 text-sm font-bold text-ink">{value}</p>
                <p className="text-[11px] text-muted">{label}</p>
              </div>
            ))}
          </div>
          {shift.distance !== null && (
            <Badge tone="success" icon={MapPin} size="md" className="relative mt-4">
              Location verified · {shift.distance} m from site
            </Badge>
          )}
        </Card>

        <div className="min-w-0 space-y-6">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-ink">{monthLabel}</h2>
              <div className="flex gap-1">
                <Button variant="outline" size="icon-sm" aria-label="Previous month" onClick={() => shiftCursor(-1)}>
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next month"
                  disabled={isCurrentMonth}
                  onClick={() => shiftCursor(1)}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="pb-1 text-center text-[11px] font-semibold text-muted sm:text-xs">
                  {d}
                </div>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map((d) => {
                const [style, Icon, label] = DAY_STYLES[d.status]
                return (
                  <div
                    key={d.day}
                    title={`${formatDate(d.date, { day: 'numeric', month: 'short' })}: ${label}${d.hours ? ` · ${d.hours} h` : ''}`}
                    className={cn(
                      'flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-bold',
                      style,
                    )}
                  >
                    {d.day}
                    {Icon && <Icon size={12} className="hidden sm:block" aria-hidden="true" />}
                    {d.status === 'today' && (
                      <span className="text-[9px] font-bold text-brand-600 uppercase">Today</span>
                    )}
                  </div>
                )
              })}
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
              {['present', 'half', 'absent', 'off'].map((s) => {
                const [style, Icon, label] = DAY_STYLES[s]
                return (
                  <li key={s} className="flex items-center gap-1.5 text-ink-2">
                    <span className={cn('grid size-5 place-items-center rounded-md', style)}>
                      {Icon && <Icon size={11} />}
                    </span>
                    {label} <b className="text-ink">{count(s)}</b>
                  </li>
                )
              })}
            </ul>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-4 p-4">
              <ProgressRing value={rate} size={58} stroke={6} color="var(--color-emerald-500)">
                <span className="text-sm font-extrabold text-ink">{rate}%</span>
              </ProgressRing>
              <div>
                <p className="text-sm font-semibold text-ink-2">Attendance</p>
                <p className="text-xs text-muted">this month</p>
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-semibold text-ink-2">Hours worked</p>
              <p className="mt-1 text-2xl font-extrabold text-ink">{hours} h</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-semibold text-ink-2">Overtime</p>
              <p className="mt-1 text-2xl font-extrabold text-ink">{overtime} h</p>
            </Card>
          </div>

          <Card className="p-5">
            <CardHeader title="Work history" subtitle="Verified by attendance. Shown on your resume and Worker ID." />
            <ul className="mt-3 divide-y divide-line">
              {workHistory.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <CalendarCheck size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">
                      {h.role} · {h.site}
                    </p>
                    <p className="text-xs text-muted">
                      {h.employer} · {formatDate(h.from, { month: 'short', year: 'numeric' })} –{' '}
                      {h.to ? formatDate(h.to, { month: 'short', year: 'numeric' }) : 'now'}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-ink">{h.days} days</span>
                  {h.rating ? (
                    <Badge tone="saffron" icon={Star}>
                      {h.rating}
                    </Badge>
                  ) : (
                    <Badge tone="brand">Ongoing</Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}

const STATUS_OPTIONS = [
  ['present', 'P', 'Present'],
  ['half', 'H', 'Half day'],
  ['absent', 'A', 'Absent'],
  ['leave', 'L', 'Leave'],
]

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => ({
  day,
  Present: [7, 6, 7, 6, 5, 5][i],
  'Half day': [0, 1, 0, 1, 2, 1][i],
  Absent: [1, 1, 1, 1, 1, 2][i],
}))

function EmployerAttendance() {
  const toast = useToast()
  const [siteId, setSiteId] = useState('all')
  const [roster, setRoster] = useState(team)
  const [today] = useState(() => new Date())
  const rows = roster.filter((m) => siteId === 'all' || m.siteId === siteId)
  const nowHHMM = () => new Date().toTimeString().slice(0, 5)

  const setStatus = (workerId, status) =>
    setRoster((list) =>
      list.map((m) =>
        m.workerId === workerId
          ? {
              ...m,
              today: status,
              checkIn: status === 'present' || status === 'half' ? (m.checkIn ?? nowHHMM()) : null,
            }
          : m,
      ),
    )

  const summary = [
    ['Present', 'present', CircleCheck, 'text-emerald-600'],
    ['Half day', 'half', Clock, 'text-amber-600'],
    ['Absent', 'absent', CircleX, 'text-rose-600'],
    ['On leave', 'leave', CircleDashed, 'text-muted'],
  ]

  return (
    <>
      <PageHeader
        title="Attendance"
        description={`Today's roster · ${formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}`}
        actions={
          <>
            <Button
              variant="outline"
              icon={CircleCheck}
              onClick={() => {
                rows.forEach((m) => setStatus(m.workerId, 'present'))
                toast({ tone: 'info', title: `${rows.length} marked present` })
              }}
            >
              Mark all present
            </Button>
            <Button
              icon={Save}
              onClick={() =>
                toast({ title: 'Attendance saved', description: 'Workers can see today’s record in their app.' })
              }
            >
              Save
            </Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map(([label, status, Icon, color]) => (
          <Card key={status} className="flex items-center gap-3 p-4">
            <Icon size={22} className={color} />
            <div>
              <p className="text-2xl font-extrabold text-ink">{rows.filter((m) => m.today === status).length}</p>
              <p className="text-xs font-semibold text-muted">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
            <CardHeader title="Roster" subtitle="Tap P / H / A / L to correct any entry" />
            <div className="w-56">
              <Select value={siteId} onChange={(e) => setSiteId(e.target.value)} aria-label="Filter by site">
                <option value="all">All sites</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[640px]">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Site</th>
                  <th>Check-in</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const w = workerById[m.workerId]
                  return (
                    <tr key={m.workerId}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={w.name} size={34} />
                          <div>
                            <p className="font-semibold text-ink">{w.name}</p>
                            <p className="text-xs text-muted">{m.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-ink-2">{sites.find((s) => s.id === m.siteId).name}</td>
                      <td className="text-ink-2 tabular">{m.checkIn ?? '—'}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="inline-flex rounded-lg bg-surface-2 p-0.5"
                            role="group"
                            aria-label={`Status for ${w.name}`}
                          >
                            {STATUS_OPTIONS.map(([value, short, label]) => (
                              <button
                                key={value}
                                type="button"
                                title={label}
                                aria-label={label}
                                aria-pressed={m.today === value}
                                onClick={() => setStatus(m.workerId, value)}
                                className={cn(
                                  'grid h-7 w-8 place-items-center rounded-md text-xs font-bold transition',
                                  m.today === value
                                    ? {
                                        present: 'bg-emerald-600 text-white',
                                        half: 'bg-amber-500 text-white',
                                        absent: 'bg-rose-600 text-white',
                                        leave: 'bg-slate-500 text-white',
                                      }[value]
                                    : 'text-muted hover:text-ink',
                                )}
                              >
                                {short}
                              </button>
                            ))}
                          </div>
                          <StatusBadge status={m.today} className="hidden 2xl:inline-flex" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <ChartCard
          title="This week"
          subtitle="Workers per day by status"
          legend={
            <ChartLegend
              items={[
                { label: 'Present', color: STATUS_COLORS.good },
                { label: 'Half day', color: STATUS_COLORS.warning },
                { label: 'Absent', color: STATUS_COLORS.critical },
              ]}
            />
          }
          table={{
            columns: [
              { key: 'day', label: 'Day' },
              { key: 'Present', label: 'Present', align: 'right' },
              { key: 'Half day', label: 'Half day', align: 'right' },
              { key: 'Absent', label: 'Absent', align: 'right' },
            ],
            rows: WEEK,
          }}
        >
          <ResponsiveContainer>
            <BarChart data={WEEK} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="day" {...xAxisProps} />
              <YAxis {...yAxisProps} width={28} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={barCursor} />
              <Bar
                dataKey="Present"
                stackId="a"
                fill={STATUS_COLORS.good}
                maxBarSize={24}
                stroke="var(--surface)"
                strokeWidth={2}
              />
              <Bar
                dataKey="Half day"
                stackId="a"
                fill={STATUS_COLORS.warning}
                maxBarSize={24}
                stroke="var(--surface)"
                strokeWidth={2}
              />
              <Bar
                dataKey="Absent"
                stackId="a"
                fill={STATUS_COLORS.critical}
                maxBarSize={24}
                radius={[4, 4, 0, 0]}
                stroke="var(--surface)"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  )
}

export default function Attendance() {
  const { user } = useAuth()
  return user.role === 'employer' ? <EmployerAttendance /> : <WorkerAttendance />
}
