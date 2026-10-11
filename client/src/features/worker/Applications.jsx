import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CalendarCheck, Check, ClipboardList, Eye, MessageSquare, Search, Undo2 } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { EmptyState, PageHeader } from '@/components/ui/Misc'
import Modal from '@/components/ui/Modal'
import Tabs from '@/components/ui/Tabs'
import { useToast } from '@/context/ToastContext'
import { jobById, workerApplications } from '@/data/jobs'
import { workerProfile } from '@/data/workers'
import { assessJob } from '@/features/ai/engine/fraud'
import { scoreJob } from '@/features/ai/engine/recommend'
import { cn, formatINR, timeAgo } from '@/lib/utils'
import JobDetail from './JobDetail'

const STAGES = ['applied', 'viewed', 'shortlisted', 'hired']
const STAGE_LABELS = { applied: 'Applied', viewed: 'Viewed', shortlisted: 'Shortlisted', hired: 'Hired' }

function StageTracker({ stage }) {
  const current = STAGES.indexOf(stage)
  return (
    <ol className="mt-5 grid grid-cols-4" aria-label="Application progress">
      {STAGES.map((s, i) => {
        const done = i < current || (i === current && s === 'hired')
        const active = i === current
        return (
          <li key={s} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span
                className={cn(
                  'absolute top-3.5 right-1/2 h-0.5 w-full',
                  i <= current ? 'bg-brand-500' : 'bg-surface-3',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 grid size-7 place-items-center rounded-full text-xs font-bold',
                done || active ? 'bg-brand-500 text-white' : 'bg-surface-3 text-muted',
                active && s !== 'hired' && 'ring-4 ring-brand-500/20',
              )}
            >
              {done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn('mt-1.5 text-[11px] font-semibold sm:text-xs', i <= current ? 'text-ink' : 'text-muted')}
            >
              {STAGE_LABELS[s]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function Applications() {
  const toast = useToast()
  const navigate = useNavigate()
  const [items, setItems] = useState(workerApplications)
  const [tab, setTab] = useState('all')
  const [withdrawing, setWithdrawing] = useState(null)
  const [detail, setDetail] = useState({ open: false, match: null })

  const groups = {
    all: items,
    active: items.filter((a) => ['applied', 'viewed', 'shortlisted'].includes(a.stage)),
    hired: items.filter((a) => a.stage === 'hired'),
    closed: items.filter((a) => a.stage === 'rejected'),
  }
  const visible = groups[tab]

  const openJob = (job) =>
    setDetail({ open: true, match: { ...scoreJob(workerProfile, job), fraud: assessJob(job), job } })

  const confirmWithdraw = () => {
    setItems((list) => list.filter((a) => a.id !== withdrawing.id))
    toast({ title: 'Application withdrawn', description: jobById[withdrawing.jobId].title })
    setWithdrawing(null)
  }

  return (
    <>
      <PageHeader
        title="My applications"
        description="Track every job you've applied to, from application to hiring."
        actions={
          <Button icon={Search} to="/worker/jobs">
            Find more jobs
          </Button>
        }
      />

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'all', label: 'All', count: groups.all.length },
          { value: 'active', label: 'In progress', count: groups.active.length },
          { value: 'hired', label: 'Hired', count: groups.hired.length },
          { value: 'closed', label: 'Closed', count: groups.closed.length },
        ]}
      />

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="Nothing here yet"
            description="Applications you send will show up here."
            action={<Button to="/worker/jobs">Browse jobs</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((app) => {
            const job = jobById[app.jobId]
            return (
              <Card key={app.id} className="flex flex-col p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <CategoryIcon category={job.category} size={46} />
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => openJob(job)}
                      className="text-left font-bold text-ink hover:text-brand-700 dark:hover:text-brand-300"
                    >
                      {job.title}
                    </button>
                    <p className="text-sm text-ink-2">
                      {job.employer.name} · {job.area} · {formatINR(job.wage)}/day
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Applied {timeAgo(app.appliedAt)} · updated {timeAgo(app.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={app.stage} size="md" />
                </div>

                {app.stage === 'rejected' ? (
                  <p className="mt-4 rounded-xl bg-surface-2 px-3.5 py-3 text-sm text-ink-2">
                    The employer filled this role. Similar {job.category.toLowerCase()} jobs are open near you.
                  </p>
                ) : (
                  <StageTracker stage={app.stage} />
                )}

                <div className="mt-auto flex flex-wrap justify-end gap-2 pt-5">
                  {app.stage === 'hired' && (
                    <Button size="sm" icon={CalendarCheck} to="/worker/attendance">
                      Mark attendance
                    </Button>
                  )}
                  {app.stage === 'rejected' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Search}
                      onClick={() => navigate(`/worker/jobs?q=${encodeURIComponent(job.category)}`)}
                    >
                      Find similar jobs
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" icon={MessageSquare} to="/worker/messages">
                      Message
                    </Button>
                  )}
                  {['applied', 'viewed', 'shortlisted'].includes(app.stage) && (
                    <Button size="sm" variant="ghost" icon={Undo2} onClick={() => setWithdrawing(app)}>
                      Withdraw
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" icon={Eye} onClick={() => openJob(job)}>
                    View job
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={Boolean(withdrawing)}
        onClose={() => setWithdrawing(null)}
        title="Withdraw application?"
        description={withdrawing && jobById[withdrawing.jobId].title}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setWithdrawing(null)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={confirmWithdraw}>
              Withdraw
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-2">
          The employer will no longer see your application. You can apply again while the job is open.
        </p>
      </Modal>

      <JobDetail
        open={detail.open}
        job={detail.match?.job}
        match={detail.match}
        applied
        onApply={() => {}}
        onMessage={() => navigate('/worker/messages')}
        onClose={() => setDetail((d) => ({ ...d, open: false }))}
      />
    </>
  )
}
