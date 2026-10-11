import { useState } from 'react'
import {
  ArrowRight,
  Building2,
  CircleCheck,
  Clock,
  Flag,
  Gavel,
  HardHat,
  MessageSquare,
  Scale,
  TriangleAlert,
} from 'lucide-react'
import Badge, { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Select, Textarea } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/Misc'
import Modal from '@/components/ui/Modal'
import StatTile from '@/components/ui/StatTile'
import Tabs from '@/components/ui/Tabs'
import { useToast } from '@/context/ToastContext'
import { disputes as initialDisputes } from '@/data/admin'
import { cn, formatINR, timeAgo } from '@/lib/utils'

const PRIORITY = { critical: 'danger', high: 'danger', medium: 'warning', low: 'neutral' }
const OUTCOMES = [
  'Paid in full',
  'Partial settlement agreed',
  'Complaint not upheld',
  'Referred to labour department',
  'Account suspended',
]

function SlaChip({ sla }) {
  const breached = sla.includes('breached')
  const closed = sla === 'Closed'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap',
        breached
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
          : closed
            ? 'bg-surface-2 text-muted'
            : 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
      )}
    >
      {breached ? <TriangleAlert size={11} /> : <Clock size={11} />}
      {sla}
    </span>
  )
}

export default function Disputes() {
  const toast = useToast()
  const [items, setItems] = useState(initialDisputes)
  const [tab, setTab] = useState('active')
  const [panel, setPanel] = useState({ open: false, id: null })
  const [outcome, setOutcome] = useState(OUTCOMES[0])
  const [note, setNote] = useState('')

  const groups = {
    active: items.filter((d) => d.status !== 'resolved'),
    open: items.filter((d) => d.status === 'open'),
    'in-review': items.filter((d) => d.status === 'in-review'),
    escalated: items.filter((d) => d.status === 'escalated'),
    resolved: items.filter((d) => d.status === 'resolved'),
  }
  const current = items.find((d) => d.id === panel.id)

  const update = (status, title) => {
    setItems((list) =>
      list.map((d) =>
        d.id === current.id
          ? {
              ...d,
              status,
              sla: status === 'resolved' ? 'Closed' : d.sla,
              notes: note ? `${d.notes} · ${note}` : d.notes,
            }
          : d,
      ),
    )
    setPanel((p) => ({ ...p, open: false }))
    setNote('')
    toast({ title, description: `${current.id} · both parties notified` })
  }

  return (
    <>
      <PageHeader
        eyebrow="Trust & safety"
        title="Disputes & complaints"
        description="Mediate between workers and employers. Each case has a 72-hour response SLA."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Active cases"
          value={groups.active.length}
          footer="open, in review or escalated"
          icon={Gavel}
          tone="saffron"
        />
        <StatTile
          label="SLA breached"
          value={items.filter((d) => d.sla.includes('breached')).length}
          footer="needs attention today"
          icon={TriangleAlert}
          tone="rose"
        />
        <StatTile
          label="Escalated"
          value={groups.escalated.length}
          footer="with labour dept. / ICC"
          icon={Flag}
          tone="violet"
        />
        <StatTile
          label="Wages recovered"
          value={formatINR(184600)}
          delta={22}
          deltaLabel="vs last quarter"
          icon={Scale}
          tone="success"
        />
      </div>

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'active', label: 'Active', count: groups.active.length },
          { value: 'open', label: 'Open', count: groups.open.length },
          { value: 'in-review', label: 'In review', count: groups['in-review'].length },
          { value: 'escalated', label: 'Escalated', count: groups.escalated.length },
          { value: 'resolved', label: 'Resolved', count: groups.resolved.length },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {groups[tab].map((d) => (
          <Card key={d.id} interactive className="flex flex-col p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-muted">{d.id}</span>
              <StatusBadge status={d.status} />
              <Badge tone={PRIORITY[d.priority]}>{d.priority}</Badge>
              <span className="ml-auto">
                <SlaChip sla={d.sla} />
              </span>
            </div>
            <p className="mt-3 font-bold text-ink">{d.title}</p>
            <p className="text-sm text-muted">{d.category}</p>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-2 p-3 text-sm">
              <span className="flex min-w-0 items-center gap-1.5 font-semibold text-ink">
                {d.complainantRole === 'worker' ? (
                  <HardHat size={15} className="shrink-0 text-brand-600" />
                ) : (
                  <Building2 size={15} className="shrink-0 text-saffron-600" />
                )}
                <span className="truncate">{d.complainant}</span>
              </span>
              <ArrowRight size={14} className="shrink-0 text-muted" />
              <span className="truncate text-ink-2">{d.against}</span>
              {d.amount && <span className="ml-auto shrink-0 font-bold text-ink">{formatINR(d.amount)}</span>}
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-ink-2">{d.notes}</p>
            <div className="mt-auto flex items-center justify-between gap-2 pt-4">
              <span className="text-xs text-muted">Opened {timeAgo(d.openedAt)}</span>
              <Button
                size="sm"
                variant={d.status === 'resolved' ? 'outline' : 'primary'}
                onClick={() => setPanel({ open: true, id: d.id })}
              >
                {d.status === 'resolved' ? 'View' : 'Resolve'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={panel.open && Boolean(current)}
        onClose={() => setPanel((p) => ({ ...p, open: false }))}
        side="right"
        title={current?.title}
        description={current && `${current.id} · ${current.category}`}
        icon={Gavel}
        footer={
          current &&
          current.status !== 'resolved' && (
            <>
              <Button
                variant="outline"
                icon={MessageSquare}
                onClick={() => update(current.status, 'Information requested')}
              >
                Ask for info
              </Button>
              {current.status !== 'escalated' && (
                <Button variant="danger-soft" icon={Flag} onClick={() => update('escalated', 'Case escalated')}>
                  Escalate
                </Button>
              )}
              <Button variant="success" icon={CircleCheck} onClick={() => update('resolved', `Resolved: ${outcome}`)}>
                Resolve
              </Button>
            </>
          )
        }
      >
        {current && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Complainant', current.complainant],
                ['Against', current.against],
                ['Amount', current.amount ? formatINR(current.amount) : '—'],
                ['Opened', timeAgo(current.openedAt)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-surface-2 p-3">
                  <p className="text-xs font-semibold text-muted">{label}</p>
                  <p className="mt-0.5 text-sm font-bold text-ink">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={current.status} size="md" />
              <Badge tone={PRIORITY[current.priority]} size="md">
                {current.priority} priority
              </Badge>
              <SlaChip sla={current.sla} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-bold text-ink">Case notes</p>
              <p className="rounded-xl border border-line p-3 text-sm leading-relaxed text-ink-2">{current.notes}</p>
            </div>
            {current.status !== 'resolved' && (
              <>
                <Field label="Outcome">
                  <Select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                    {OUTCOMES.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Resolution note" hint="Shared with both parties.">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="e.g. Employer paid ₹4,920 via UPI on 12 Oct; worker confirmed."
                  />
                </Field>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
