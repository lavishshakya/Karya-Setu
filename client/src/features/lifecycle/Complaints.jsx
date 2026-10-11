import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, Circle, FileWarning, Paperclip, Phone, Send, ShieldCheck, X } from 'lucide-react'
import Badge, { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Field'
import { EmptyState, PageHeader } from '@/components/ui/Misc'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { COMPLAINT_CATEGORIES, complaintsFor } from '@/data/lifecycle'
import { cn, formatDate, formatINR, timeAgo } from '@/lib/utils'

const PRIORITY_TONES = { critical: 'danger', high: 'danger', medium: 'warning', low: 'neutral' }

function Timeline({ steps }) {
  return (
    <ol className="mt-4 space-y-0">
      {steps.map((step, i) => (
        <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
          {i < steps.length - 1 && (
            <span
              className={cn(
                'absolute top-6 left-[11px] h-[calc(100%-16px)] w-0.5',
                step.done ? 'bg-brand-500' : 'bg-surface-3',
              )}
            />
          )}
          <span
            className={cn(
              'relative grid size-6 shrink-0 place-items-center rounded-full',
              step.done ? 'bg-brand-500 text-white' : 'border-2 border-line-strong bg-surface text-transparent',
            )}
          >
            {step.done ? <Check size={13} strokeWidth={3} /> : <Circle size={6} />}
          </span>
          <div className="-mt-0.5">
            <p className={cn('text-sm font-semibold', step.done ? 'text-ink' : 'text-muted')}>{step.label}</p>
            {step.at && (
              <p className="text-xs text-muted">
                {formatDate(step.at, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function Complaints() {
  const { user } = useAuth()
  const toast = useToast()
  const [params] = useSearchParams()
  const fileRef = useRef(null)
  const [items, setItems] = useState(() => complaintsFor(user.role))
  const [expanded, setExpanded] = useState(items[0]?.id)
  const [files, setFiles] = useState([])
  const [form, setForm] = useState({
    category: params.get('category') ?? COMPLAINT_CATEGORIES[0],
    against: params.get('against') ?? '',
    amount: params.get('amount') ?? '',
    description: '',
    anonymous: false,
  })
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.against.trim() || form.description.trim().length < 15) {
      toast({
        tone: 'error',
        title: 'Add a few more details',
        description: 'Tell us who it is against and what happened (15+ characters).',
      })
      return
    }
    const id = `KS-C-${1060 + items.length}`
    const now = new Date().toISOString()
    const complaint = {
      id,
      title: form.description.trim().split(/[.!?]/)[0].slice(0, 70),
      category: form.category,
      against: form.against.trim(),
      amount: form.amount ? Number(form.amount) : null,
      status: 'open',
      priority: ['Harassment or abuse', 'Unsafe working conditions'].includes(form.category) ? 'high' : 'medium',
      createdAt: now,
      timeline: [
        { label: 'Complaint submitted', at: now, done: true },
        { label: 'Assigned to labour facilitator', at: null, done: false },
        { label: 'Resolved', at: null, done: false },
      ],
    }
    setItems((list) => [complaint, ...list])
    setExpanded(id)
    setForm((f) => ({ ...f, against: '', amount: '', description: '' }))
    setFiles([])
    toast({ title: `Complaint ${id} filed`, description: 'A facilitator will contact you within 72 hours.' })
  }

  return (
    <>
      <PageHeader
        title="Complaints"
        description="Report unpaid wages, unsafe sites, harassment or fake jobs. Every complaint is tracked until it's resolved."
        actions={
          <Badge tone="info" icon={Phone} size="md">
            Helpline 1800-XXX-XXXX (demo)
          </Badge>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Card className="h-fit p-5 sm:p-6 xl:sticky xl:top-24">
          <CardHeader
            icon={FileWarning}
            title="File a complaint"
            subtitle="Takes about a minute. You can add photos as evidence."
          />
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="What happened?">
              <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
                {COMPLAINT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <Field label="Against" required>
                <Input
                  value={form.against}
                  onChange={(e) => set('against', e.target.value)}
                  placeholder={user.role === 'worker' ? 'Employer or contractor' : 'Worker name or ID'}
                />
              </Field>
              <Field label="Amount (if any)">
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => set('amount', e.target.value)}
                  placeholder="0"
                  suffix="₹"
                />
              </Field>
            </div>
            <Field label="Details" required hint="Dates, site name and what was promised help us resolve it faster.">
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                placeholder="Describe what happened…"
              />
            </Field>
            <div>
              <Button variant="outline" size="sm" icon={Paperclip} onClick={() => fileRef.current?.click()}>
                Add photos or documents
              </Button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  setFiles((list) => [...list, ...Array.from(e.target.files).map((f) => f.name)])
                  e.target.value = ''
                }}
              />
              {files.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {files.map((name) => (
                    <li
                      key={name}
                      className="flex items-center gap-1 rounded-full bg-surface-2 py-1 pr-1 pl-2.5 text-xs font-semibold text-ink-2"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => setFiles((list) => list.filter((n) => n !== name))}
                        className="rounded-full p-0.5 hover:bg-surface-3"
                        aria-label={`Remove ${name}`}
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Switch
              checked={form.anonymous}
              onChange={(v) => set('anonymous', v)}
              label="Hide my name from the other party"
              description="Facilitators still see it, so they can contact you."
              size="sm"
            />
            <Button type="submit" icon={Send} className="w-full" size="lg">
              Submit complaint
            </Button>
            <p className="flex items-start gap-2 text-xs text-muted">
              <ShieldCheck size={14} className="mt-px shrink-0 text-brand-500" />
              Retaliation against anyone who files a complaint leads to suspension from Karya Setu.
            </p>
          </form>
        </Card>

        <div className="space-y-3">
          <h2 className="font-bold text-ink">Your complaints ({items.length})</h2>
          {items.length === 0 ? (
            <Card>
              <EmptyState icon={ShieldCheck} title="No complaints" description="We hope it stays that way." />
            </Card>
          ) : (
            items.map((c) => {
              const isOpen = expanded === c.id
              return (
                <Card key={c.id} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                    className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
                    aria-expanded={isOpen}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted">{c.id}</span>
                        <StatusBadge status={c.status} />
                        <Badge tone={PRIORITY_TONES[c.priority]}>{c.priority} priority</Badge>
                      </div>
                      <p className="mt-1.5 font-bold text-ink">{c.title}</p>
                      <p className="text-sm text-ink-2">
                        {c.category} · against {c.against}
                        {c.amount ? ` · ${formatINR(c.amount)}` : ''}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">Filed {timeAgo(c.createdAt)}</p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={cn('mt-1 shrink-0 text-muted transition', isOpen && 'rotate-180')}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-line px-4 pt-1 pb-5 sm:px-5">
                          <Timeline steps={c.timeline} />
                          {c.resolution && (
                            <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
                              <b>Resolution:</b> {c.resolution}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
