import { useState } from 'react'
import {
  Ban,
  Briefcase,
  CircleCheck,
  Copy,
  Eye,
  FileWarning,
  IndianRupee,
  Merge,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react'
import Badge, { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/Misc'
import Modal from '@/components/ui/Modal'
import { ProgressRing } from '@/components/ui/Progress'
import StatTile from '@/components/ui/StatTile'
import Tabs from '@/components/ui/Tabs'
import { useToast } from '@/context/ToastContext'
import { fraudAlerts } from '@/data/admin'
import { cn, timeAgo } from '@/lib/utils'

const TYPES = {
  job: { icon: Briefcase, label: 'Fraudulent job' },
  duplicate: { icon: Copy, label: 'Duplicate profile' },
  certificate: { icon: FileWarning, label: 'Fake certificate' },
  payment: { icon: IndianRupee, label: 'Payment scam' },
}

function riskLevel(risk) {
  if (risk >= 80) return { label: 'High risk', color: 'var(--status-critical)', tone: 'danger' }
  if (risk >= 50) return { label: 'Elevated', color: 'var(--status-serious)', tone: 'warning' }
  return { label: 'Low risk', color: 'var(--status-good)', tone: 'success' }
}

const FIELD_LABELS = {
  name: 'Name',
  id: 'Worker ID',
  phone: 'Phone',
  bank: 'Bank account',
  dob: 'Date of birth',
  village: 'Village',
  joined: 'Joined',
}

const SIGNALS = [
  ['Fee or deposit requests in job text', 'Keyword + intent rules'],
  ['Wage far above the regional median', 'Wage model residuals'],
  ['Same phone, bank or face across profiles', 'Duplicate matcher'],
  ['Mismatched fonts or numbers on certificates', 'OCR + registry lookup'],
  ['Complaint velocity against one account', 'Rolling 7-day count'],
]

export default function Fraud() {
  const toast = useToast()
  const [alerts, setAlerts] = useState(fraudAlerts)
  const [type, setType] = useState('all')
  const [inspect, setInspect] = useState({ open: false, alert: null })

  const visible = alerts.filter((a) => type === 'all' || a.type === type)
  const open = alerts.filter((a) => a.status === 'open')

  const act = (alert, status, title) => {
    setAlerts((list) => list.map((a) => (a.id === alert.id ? { ...a, status } : a)))
    setInspect((s) => ({ ...s, open: false }))
    toast({ tone: status === 'dismissed' ? 'info' : 'success', title, description: `${alert.id} · ${alert.entity}` })
  }

  const current = inspect.alert

  return (
    <>
      <PageHeader
        eyebrow="Trust & safety"
        title="Fraud detection"
        description="AI flags suspicious jobs, duplicate profiles, fake certificates and payment scams. Humans make the final call."
        actions={
          <Badge tone="ai" icon={Sparkles} size="md">
            Model v1 · rules + similarity
          </Badge>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Open alerts" value={open.length} footer="awaiting review" icon={ShieldAlert} tone="rose" />
        <StatTile
          label="High risk"
          value={open.filter((a) => a.risk >= 80).length}
          footer="risk score 80+"
          icon={TriangleAlert}
          tone="saffron"
        />
        <StatTile
          label="Duplicates caught"
          value={alerts.filter((a) => a.type === 'duplicate').length}
          footer="this week"
          icon={Copy}
          tone="violet"
        />
        <StatTile
          label="Actioned"
          value={alerts.filter((a) => a.status === 'actioned').length}
          footer="accounts suspended or jobs removed"
          icon={ShieldCheck}
          tone="success"
        />
      </div>

      <Tabs
        className="mb-5"
        value={type}
        onChange={setType}
        tabs={[
          { value: 'all', label: 'All', count: alerts.length },
          ...Object.entries(TYPES).map(([value, t]) => ({
            value,
            label: `${t.label}s`,
            count: alerts.filter((a) => a.type === value).length,
          })),
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {visible.map((alert) => {
            const meta = TYPES[alert.type]
            const level = riskLevel(alert.risk)
            const closed = alert.status !== 'open' && alert.status !== 'investigating'
            return (
              <Card key={alert.id} className={cn('p-4 sm:p-5', closed && 'opacity-70')}>
                <div className="flex gap-4">
                  <ProgressRing value={alert.risk} size={64} stroke={6} color={level.color}>
                    <span className="text-center leading-none">
                      <span className="block text-base font-extrabold text-ink">{alert.risk}</span>
                      <span className="text-[9px] font-semibold text-muted">risk</span>
                    </span>
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral" icon={meta.icon}>
                        {meta.label}
                      </Badge>
                      <Badge tone={level.tone}>{level.label}</Badge>
                      <StatusBadge status={alert.status} />
                      <span className="ml-auto text-xs text-muted">
                        {alert.id} · {timeAgo(alert.detectedAt)}
                      </span>
                    </div>
                    <p className="mt-2 font-bold text-ink">{alert.title}</p>
                    <p className="text-sm text-ink-2">{alert.entity}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {alert.reasons.map((r) => (
                        <span key={r} className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-medium text-ink-2">
                          {r}
                        </span>
                      ))}
                    </div>
                    {!closed && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" icon={Eye} onClick={() => setInspect({ open: true, alert })}>
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          variant="danger-soft"
                          icon={Ban}
                          onClick={() =>
                            act(alert, 'actioned', alert.type === 'job' ? 'Job taken down' : 'Account suspended')
                          }
                        >
                          {alert.type === 'job' ? 'Take down' : 'Suspend'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={X}
                          onClick={() => act(alert, 'dismissed', 'Alert dismissed')}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <Card className="p-5">
            <CardHeader title="What the model looks for" subtitle="Every alert lists the signals that fired" />
            <ul className="mt-4 space-y-3">
              {SIGNALS.map(([signal, method]) => (
                <li key={signal} className="flex gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                    <ScanFace size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{signal}</p>
                    <p className="text-xs text-muted">{method}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-bold text-ink">Precision last 30 days</p>
            <p className="mt-1 text-3xl font-extrabold text-ink">91%</p>
            <p className="mt-1 text-sm text-ink-2">
              of AI alerts were confirmed by reviewers. Dismissals feed back into the next model version.
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={inspect.open && Boolean(current)}
        onClose={() => setInspect((s) => ({ ...s, open: false }))}
        side="right"
        title={current?.title}
        description={current && `${current.id} · ${TYPES[current.type].label} · risk ${current.risk}/100`}
        footer={
          current && (
            <>
              <Button variant="ghost" onClick={() => act(current, 'dismissed', 'Alert dismissed')}>
                Not fraud
              </Button>
              {current.type === 'duplicate' && (
                <Button variant="outline" icon={Merge} onClick={() => act(current, 'actioned', 'Profiles merged')}>
                  Merge profiles
                </Button>
              )}
              <Button
                variant="danger"
                icon={Ban}
                onClick={() =>
                  act(current, 'actioned', current.type === 'job' ? 'Job taken down' : 'Account suspended')
                }
              >
                {current.type === 'job' ? 'Take down job' : 'Suspend'}
              </Button>
            </>
          )
        }
      >
        {current && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-500/25 dark:bg-rose-500/10">
              <p className="flex items-center gap-2 font-bold text-ink">
                <ShieldAlert size={17} className="text-rose-600" /> Signals that fired
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-2">
                {current.reasons.map((r) => (
                  <li key={r} className="flex items-center gap-2">
                    <TriangleAlert size={14} className="shrink-0 text-rose-500" /> {r}
                  </li>
                ))}
              </ul>
            </div>

            {current.compare ? (
              <div>
                <p className="mb-2 font-bold text-ink">Side-by-side comparison</p>
                <div className="overflow-hidden rounded-2xl border border-line">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
                      <tr>
                        <th className="px-3 py-2.5">Field</th>
                        <th className="px-3 py-2.5">Existing</th>
                        <th className="px-3 py-2.5">New</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(current.compare.left).map((field) => {
                        const same = current.compare.left[field] === current.compare.right[field]
                        return (
                          <tr
                            key={field}
                            className={cn(
                              'border-t border-line',
                              same && field !== 'id' && 'bg-rose-50/70 dark:bg-rose-500/10',
                            )}
                          >
                            <td className="px-3 py-2.5 font-semibold text-muted">{FIELD_LABELS[field] ?? field}</td>
                            <td className="px-3 py-2.5 text-ink">{current.compare.left[field]}</td>
                            <td className="px-3 py-2.5 text-ink">
                              <span className="flex items-center gap-1.5">
                                {current.compare.right[field]}
                                {same && field !== 'id' && (
                                  <span className="rounded bg-rose-100 px-1.5 text-[10px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                    MATCH
                                  </span>
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-2 p-4 text-sm text-ink-2">
                <p className="font-semibold text-ink">{current.entity}</p>
                <p className="mt-1">
                  {current.type === 'job' &&
                    'The posting is hidden from worker search while under review. Applicants have been warned not to pay any fee.'}
                  {current.type === 'certificate' &&
                    'The certificate is marked “unverified” on the worker’s profile until the issuer confirms it.'}
                  {current.type === 'payment' &&
                    'Workers who reported this employer have been offered help from a labour facilitator.'}
                </p>
              </div>
            )}

            <p className="flex items-start gap-2 text-xs text-muted">
              <CircleCheck size={14} className="mt-px shrink-0 text-emerald-600" />
              Every decision is logged with your name for audit. The affected user is notified and can appeal.
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}
