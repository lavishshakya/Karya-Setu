import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CircleCheck,
  CircleDashed,
  CircleX,
  Clock,
  Download,
  Flag,
  Gavel,
  Handshake,
  HardHat,
  ShieldAlert,
  UserCheck,
  UsersRound,
} from 'lucide-react'
import ChartCard, { ChartTooltip } from '@/components/charts/ChartCard'
import SegmentBar from '@/components/charts/SegmentBar'
import {
  SERIES,
  STATUS_COLORS,
  barCursor,
  barProps,
  gridProps,
  hBarProps,
  lineCursor,
  xAxisProps,
  yAxisProps,
} from '@/components/charts/chartTheme'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/Misc'
import StatTile from '@/components/ui/StatTile'
import { useLang } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import {
  activityFeed,
  adminUsers,
  disputeSummary,
  districts,
  fraudAlerts,
  jobsByCategory,
  platformStats,
  registrationTrend,
} from '@/data/admin'
import { cn, formatCompact, formatINR, formatNumber, timeAgo } from '@/lib/utils'

const ACTIVITY_ICONS = {
  fraud: [ShieldAlert, 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'],
  verify: [BadgeCheck, 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'],
  hire: [Handshake, 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'],
  dispute: [Gavel, 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'],
  user: [UsersRound, 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300'],
}
const DISPUTE_ICONS = { good: CircleCheck, warning: Clock, serious: CircleDashed, critical: Flag }

export default function AdminDashboard() {
  const { t } = useLang()
  const toast = useToast()
  const [queue, setQueue] = useState(() => adminUsers.filter((u) => u.status === 'pending'))
  const last = registrationTrend.at(-1)
  const openAlerts = fraudAlerts.filter((a) => a.status === 'open')

  const decide = (user, approve) => {
    setQueue((list) => list.filter((u) => u.id !== user.id))
    toast({
      tone: approve ? 'success' : 'info',
      title: approve ? `${user.name} verified` : `${user.name} sent back for documents`,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin console"
        title="Platform overview"
        description={t('dash.adminSub')}
        actions={
          <Button
            variant="outline"
            icon={Download}
            onClick={() => toast({ title: 'Report queued', description: 'You will get the monthly PDF by email.' })}
          >
            Export report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Registered workers"
          value={formatNumber(platformStats.workers)}
          delta={Math.round((last.workers / (platformStats.workers - last.workers)) * 100)}
          icon={HardHat}
          tone="brand"
          trend={registrationTrend.map((m) => m.workers)}
        />
        <StatTile
          label="Employers"
          value={formatNumber(platformStats.employers)}
          delta={Math.round((last.employers / (platformStats.employers - last.employers)) * 100)}
          icon={Building2}
          tone="saffron"
          trend={registrationTrend.map((m) => m.employers)}
        />
        <StatTile
          label="Active jobs"
          value={formatNumber(platformStats.activeJobs)}
          delta={8}
          icon={Briefcase}
          tone="sky"
        />
        <StatTile
          label="Placements this month"
          value={formatNumber(platformStats.placementsMonth)}
          delta={13}
          icon={Handshake}
          tone="success"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: ShieldAlert,
            tone: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-300',
            label: 'Open fraud alerts',
            value: openAlerts.length,
            note: `${openAlerts.filter((a) => a.risk >= 80).length} high risk`,
            to: '/admin/fraud',
          },
          {
            icon: Gavel,
            tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300',
            label: 'Open disputes',
            value: platformStats.openDisputes,
            note: '1 past its SLA',
            to: '/admin/disputes',
          },
          {
            icon: UserCheck,
            tone: 'text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-300',
            label: 'Verification queue',
            value: platformStats.verificationQueue,
            note: 'avg wait 9 hours',
            to: '/admin/users',
          },
        ].map((item) => (
          <Card key={item.label} className="flex items-center gap-4 p-4">
            <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl', item.tone)}>
              <item.icon size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-2">{item.label}</p>
              <p className="text-2xl font-extrabold text-ink">
                {item.value} <span className="text-xs font-semibold text-muted">· {item.note}</span>
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" to={item.to} aria-label={`Open ${item.label}`}>
              <ArrowRight size={16} />
            </Button>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="New worker registrations"
          subtitle="Per month, last 12 months"
          table={{
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'workers', label: 'Workers', align: 'right', format: formatNumber },
              { key: 'employers', label: 'Employers', align: 'right', format: formatNumber },
            ],
            rows: registrationTrend,
          }}
        >
          <ResponsiveContainer>
            <AreaChart data={registrationTrend} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis {...yAxisProps} tickFormatter={formatCompact} />
              <Tooltip content={<ChartTooltip />} cursor={lineCursor} />
              <Area
                type="monotone"
                dataKey="workers"
                name="New workers"
                stroke={SERIES[0]}
                strokeWidth={2}
                fill={SERIES[0]}
                fillOpacity={0.1}
                activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--surface)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="flex flex-col p-5">
          <CardHeader
            title="Dispute pipeline"
            subtitle={`${disputeSummary.reduce((s, d) => s + d.count, 0)} complaints this quarter`}
          />
          <SegmentBar
            className="mt-5"
            columns={1}
            segments={disputeSummary.map((d) => ({
              label: d.status,
              value: d.count,
              color: STATUS_COLORS[d.tone],
              icon: DISPUTE_ICONS[d.tone],
            }))}
          />
          <dl className="mt-5 mb-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
            {[
              ['Avg. resolution', '2.4 days'],
              ['Wages recovered', formatINR(184600)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs font-semibold text-muted">{label}</dt>
                <dd className="mt-0.5 text-lg font-extrabold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <Button variant="outline" className="mt-auto w-full" iconRight={ArrowRight} to="/admin/disputes">
            Review disputes
          </Button>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Open jobs by category"
          subtitle="Across all districts"
          height={290}
          table={{
            columns: [
              { key: 'category', label: 'Category' },
              { key: 'jobs', label: 'Open jobs', align: 'right' },
            ],
            rows: jobsByCategory,
          }}
        >
          <ResponsiveContainer>
            <BarChart
              data={jobsByCategory}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              barCategoryGap={6}
            >
              <CartesianGrid {...gridProps} horizontal={false} vertical />
              <XAxis type="number" {...xAxisProps} />
              <YAxis type="category" dataKey="category" {...yAxisProps} width={96} />
              <Tooltip content={<ChartTooltip />} cursor={barCursor} />
              <Bar dataKey="jobs" name="Open jobs" fill={SERIES[0]} {...hBarProps} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Placements by district"
          subtitle="This month"
          height={290}
          table={{
            columns: [
              { key: 'district', label: 'District' },
              { key: 'placements', label: 'Placements', align: 'right' },
              { key: 'placementRate', label: 'Placement rate', align: 'right', format: (v) => `${v}%` },
            ],
            rows: districts,
          }}
        >
          <ResponsiveContainer>
            <BarChart data={districts} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="district" {...xAxisProps} interval={0} tick={{ ...xAxisProps.tick, fontSize: 11 }} />
              <YAxis {...yAxisProps} />
              <Tooltip content={<ChartTooltip />} cursor={barCursor} />
              <Bar dataKey="placements" name="Placements" fill={SERIES[0]} {...barProps} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader title="Recent activity" />
          <ul className="mt-4 space-y-4">
            {activityFeed.map((a) => {
              const [Icon, tone] = ACTIVITY_ICONS[a.type]
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', tone)}>
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">{a.text}</p>
                    <p className="text-xs text-muted">{timeAgo(a.at)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="p-5">
          <CardHeader
            title="Pending verifications"
            subtitle="Documents auto-checked by AI · approve or send back"
            action={
              <Button variant="ghost" size="sm" iconRight={ArrowRight} to="/admin/users">
                All users
              </Button>
            }
          />
          {queue.length === 0 ? (
            <p className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CircleCheck size={18} /> Queue cleared. Nice work!
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {queue.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 py-3">
                  <Avatar name={u.name} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{u.name}</p>
                    <p className="truncate text-xs text-muted">
                      {u.role} · {u.district} · {u.detail}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="danger-soft" icon={CircleX} onClick={() => decide(u, false)}>
                      Reject
                    </Button>
                    <Button size="sm" variant="success" icon={CircleCheck} onClick={() => decide(u, true)}>
                      Approve
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
