import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  BadgeCheck,
  CircleCheck,
  CircleDot,
  CircleX,
  Columns3,
  GripVertical,
  List,
  MapPin,
  MessageSquare,
  Search,
  Sparkles,
  Star,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge, { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/Misc'
import Modal from '@/components/ui/Modal'
import { Meter, ProgressRing } from '@/components/ui/Progress'
import Tabs from '@/components/ui/Tabs'
import { useToast } from '@/context/ToastContext'
import { candidateApplications, employerJobs, jobById } from '@/data/jobs'
import { workerById } from '@/data/workers'
import { scoreCandidate } from '@/features/ai/engine/recommend'
import { cn, formatINR, timeAgo } from '@/lib/utils'

const COLUMNS = [
  { id: 'new', label: 'New', icon: CircleDot, accent: 'bg-sky-500' },
  { id: 'shortlisted', label: 'Shortlisted', icon: Star, accent: 'bg-brand-500' },
  { id: 'hired', label: 'Hired', icon: CircleCheck, accent: 'bg-emerald-500' },
  { id: 'rejected', label: 'Not selected', icon: CircleX, accent: 'bg-rose-500' },
]
const ACTIONS = {
  shortlisted: { icon: Star, label: 'Shortlist' },
  hired: { icon: CircleCheck, label: 'Hire' },
  rejected: { icon: CircleX, label: 'Reject' },
}

function CandidateCard({ app, onMove, onOpen, onMessage, dragging, onDragStart, onDragEnd }) {
  const { worker, job, score, distance } = app
  return (
    // motion.div animates the card between columns; native HTML5 drag events live on the inner div
    // (motion reserves onDragStart/onDragEnd for its own gesture system).
    <motion.div layout layoutId={app.id}>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', app.id)
          onDragStart()
        }}
        onDragEnd={onDragEnd}
        className={cn(
          'group cursor-grab rounded-2xl border border-line bg-surface p-3.5 shadow-card transition active:cursor-grabbing',
          dragging && 'opacity-40',
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar name={worker.name} size={40} verified={worker.verified} />
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={onOpen}
              className="truncate text-left text-sm font-bold text-ink hover:text-brand-700 dark:hover:text-brand-300"
            >
              {worker.name}
            </button>
            <p className="truncate text-xs text-muted">
              {worker.primarySkill} · {worker.experience} yrs
            </p>
          </div>
          <ProgressRing value={score} size={38} stroke={4} color="var(--color-violet-500)">
            <span className="text-[10px] font-extrabold text-ink">{score}</span>
          </ProgressRing>
        </div>
        <p className="mt-2.5 truncate rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-semibold text-ink-2">
          {job.title}
        </p>
        <div className="mt-2.5 flex items-center gap-3 text-xs text-ink-2">
          <span className="flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" /> {worker.rating}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-muted" /> {distance.toFixed(1)} km
          </span>
          <span className="ml-auto text-muted">{timeAgo(app.appliedAt)}</span>
        </div>
        <div className="mt-3 flex items-center gap-1 border-t border-line pt-2.5">
          <GripVertical size={14} className="text-line-strong" aria-hidden="true" />
          <div className="ml-auto flex gap-1">
            {Object.entries(ACTIONS)
              .filter(([stage]) => stage !== app.stage)
              .map(([stage, a]) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => onMove(stage)}
                  title={a.label}
                  aria-label={`${a.label} ${worker.name}`}
                  className={cn(
                    'grid size-7 place-items-center rounded-lg text-muted transition',
                    stage === 'hired' && 'hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10',
                    stage === 'shortlisted' && 'hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10',
                    stage === 'rejected' && 'hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10',
                  )}
                >
                  <a.icon size={15} />
                </button>
              ))}
            <button
              type="button"
              onClick={onMessage}
              title="Message"
              aria-label={`Message ${worker.name}`}
              className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <MessageSquare size={15} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Candidates() {
  const toast = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const jobFilter = params.get('job') ?? 'all'
  const query = params.get('q') ?? ''
  const updateParam = (key, value) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        if (value && value !== 'all') next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )

  const [apps, setApps] = useState(candidateApplications)
  const [view, setView] = useState('board')
  const [dragId, setDragId] = useState(null)
  const [overColumn, setOverColumn] = useState(null)
  const [drawer, setDrawer] = useState({ open: false, id: null })

  const enriched = apps.map((a) => {
    const worker = workerById[a.workerId]
    const job = jobById[a.jobId]
    return { ...a, worker, job, ...scoreCandidate(job, worker) }
  })
  const filtered = enriched
    .filter((a) => jobFilter === 'all' || a.jobId === jobFilter)
    .filter((a) =>
      `${a.worker.name} ${a.worker.primarySkill} ${a.worker.area}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => b.score - a.score)
  const selected = enriched.find((a) => a.id === drawer.id)

  const move = (id, stage) => {
    const app = enriched.find((a) => a.id === id)
    if (!app || app.stage === stage) return
    setApps((list) => list.map((a) => (a.id === id ? { ...a, stage } : a)))
    const messages = {
      shortlisted: [`${app.worker.name} shortlisted`, 'They have been notified by SMS.'],
      hired: [`${app.worker.name} hired 🎉`, `Added to your team for “${app.job.title}”.`],
      rejected: [`${app.worker.name} not selected`, 'They will be told politely and shown other jobs.'],
      new: [`${app.worker.name} moved back to New`, ''],
    }
    const [title, description] = messages[stage]
    toast({ title, description, tone: stage === 'rejected' ? 'info' : 'success' })
  }

  return (
    <>
      <PageHeader
        title="Candidates"
        description="Applicants ranked by AI match. Drag cards between columns or use the quick actions."
        actions={
          <Tabs
            value={view}
            onChange={setView}
            tabs={[
              { value: 'board', label: 'Board', icon: Columns3 },
              { value: 'list', label: 'List', icon: List },
            ]}
          />
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-80">
          <Select value={jobFilter} onChange={(e) => updateParam('job', e.target.value)} aria-label="Filter by job">
            <option value="all">All jobs ({enriched.length} applicants)</option>
            {employerJobs
              .filter((j) => j.status !== 'draft')
              .map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
          </Select>
        </div>
        <div className="sm:w-72">
          <Input
            icon={Search}
            value={query}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder="Search by name, skill or area"
            aria-label="Search candidates"
          />
        </div>
        <Badge tone="ai" icon={Sparkles} size="md" className="self-start sm:ml-auto sm:self-center">
          Sorted by AI match
        </Badge>
      </div>

      {view === 'board' ? (
        <div className="-mx-4 no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 xl:grid xl:grid-cols-4 xl:overflow-visible">
          {COLUMNS.map((col) => {
            const cards = filtered.filter((a) => a.stage === col.id)
            return (
              <section
                key={col.id}
                aria-label={col.label}
                onDragOver={(e) => {
                  e.preventDefault()
                  setOverColumn(col.id)
                }}
                onDragLeave={() => setOverColumn((c) => (c === col.id ? null : c))}
                onDrop={() => {
                  if (dragId) move(dragId, col.id)
                  setDragId(null)
                  setOverColumn(null)
                }}
                className={cn(
                  'w-[290px] shrink-0 snap-start rounded-3xl border-2 border-transparent bg-surface-2/70 p-3 transition xl:w-auto',
                  overColumn === col.id && 'border-dashed border-brand-400 bg-brand-50/60 dark:bg-brand-500/10',
                )}
              >
                <header className="mb-3 flex items-center gap-2 px-1">
                  <span className={cn('size-2.5 rounded-full', col.accent)} />
                  <col.icon size={15} className="text-muted" />
                  <h2 className="text-sm font-bold text-ink">{col.label}</h2>
                  <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-xs font-bold text-ink-2">
                    {cards.length}
                  </span>
                </header>
                <div className="min-h-24 space-y-3">
                  <AnimatePresence>
                    {cards.map((app) => (
                      <CandidateCard
                        key={app.id}
                        app={app}
                        dragging={dragId === app.id}
                        onDragStart={() => setDragId(app.id)}
                        onDragEnd={() => {
                          setDragId(null)
                          setOverColumn(null)
                        }}
                        onMove={(stage) => move(app.id, stage)}
                        onOpen={() => setDrawer({ open: true, id: app.id })}
                        onMessage={() => navigate('/employer/messages')}
                      />
                    ))}
                  </AnimatePresence>
                  {cards.length === 0 && (
                    <p className="rounded-2xl border-2 border-dashed border-line px-3 py-6 text-center text-xs text-muted">
                      Drop candidates here
                    </p>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="table-base min-w-[760px]">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>AI match</th>
                <th>Distance</th>
                <th>Expects</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => setDrawer({ open: true, id: a.id })}
                      className="flex items-center gap-3 text-left"
                    >
                      <Avatar name={a.worker.name} size={34} verified={a.worker.verified} />
                      <span>
                        <span className="block font-semibold text-ink">{a.worker.name}</span>
                        <span className="block text-xs text-muted">
                          {a.worker.primarySkill} · ★ {a.worker.rating}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td className="max-w-56 truncate text-ink-2">{a.job.title}</td>
                  <td>
                    <div className="flex w-28 items-center gap-2">
                      <Meter value={a.score} tone="ai" height={6} label="AI match" />
                      <span className="text-xs font-bold text-ink tabular">{a.score}</span>
                    </div>
                  </td>
                  <td className="text-ink-2 tabular">{a.distance.toFixed(1)} km</td>
                  <td className="text-ink-2 tabular">{formatINR(a.worker.expectedWage)}</td>
                  <td>
                    <select
                      value={a.stage}
                      onChange={(e) => move(a.id, e.target.value)}
                      className="control h-9 w-36"
                      aria-label={`Stage for ${a.worker.name}`}
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={drawer.open && Boolean(selected)}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        side="right"
        title={selected?.worker.name}
        description={selected && `Applied for “${selected.job.title}” · ${timeAgo(selected.appliedAt)}`}
        footer={
          selected && (
            <>
              <Button variant="outline" icon={MessageSquare} onClick={() => navigate('/employer/messages')}>
                Message
              </Button>
              {selected.stage !== 'rejected' && (
                <Button variant="danger-soft" icon={CircleX} onClick={() => move(selected.id, 'rejected')}>
                  Reject
                </Button>
              )}
              {selected.stage === 'new' && (
                <Button variant="secondary" icon={Star} onClick={() => move(selected.id, 'shortlisted')}>
                  Shortlist
                </Button>
              )}
              {selected.stage !== 'hired' && (
                <Button icon={CircleCheck} onClick={() => move(selected.id, 'hired')}>
                  Hire
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={selected.worker.name} size={68} verified={selected.worker.verified} />
              <div className="min-w-0">
                <p className="text-lg font-bold text-ink">
                  {selected.worker.primarySkill} · {selected.worker.experience} years
                </p>
                <p className="text-sm text-ink-2">
                  {selected.worker.area}, {selected.worker.district} · {selected.worker.languages.join(', ')}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <StatusBadge status={selected.stage} />
                  {selected.worker.verified ? (
                    <Badge tone="success" icon={BadgeCheck}>
                      Aadhaar verified
                    </Badge>
                  ) : (
                    <Badge tone="warning">KYC pending</Badge>
                  )}
                  <Badge tone={selected.worker.available ? 'brand' : 'neutral'}>
                    {selected.worker.available ? 'Available now' : 'Busy'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-500/25 dark:bg-violet-500/10">
              <ProgressRing value={selected.score} size={64} stroke={6} color="var(--color-violet-500)">
                <span className="text-base font-extrabold text-ink">{selected.score}</span>
              </ProgressRing>
              <div className="text-sm">
                <p className="flex items-center gap-1.5 font-bold text-violet-800 dark:text-violet-200">
                  <Sparkles size={15} /> AI match for this job
                </p>
                <p className="mt-0.5 text-ink-2">
                  {selected.distance.toFixed(1)} km away · expects {formatINR(selected.worker.expectedWage)} vs your{' '}
                  {formatINR(selected.job.wage)} · rated {selected.worker.rating}★ by {selected.worker.reviews}{' '}
                  employers
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-bold text-ink">Skills</h3>
              <ul className="space-y-3">
                {selected.worker.skills.map((s) => (
                  <li key={s.name} className="grid grid-cols-[120px_1fr_32px] items-center gap-3 text-sm">
                    <span className="truncate font-semibold text-ink-2">{s.name}</span>
                    <Meter
                      value={s.level}
                      tone={selected.job.skills.includes(s.name) ? 'brand' : 'success'}
                      label={s.name}
                    />
                    <span className="text-right font-bold text-ink tabular">{s.level}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ['Jobs done', selected.worker.jobsDone],
                ['Rating', `${selected.worker.rating} ★`],
                ['Age', selected.worker.age],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-surface-2 p-3">
                  <p className="font-extrabold text-ink">{value}</p>
                  <p className="text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
