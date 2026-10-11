import { lazy, Suspense } from 'react'
import {
  BadgeCheck,
  CalendarClock,
  CircleCheck,
  Clock,
  GraduationCap,
  IndianRupee,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import CategoryIcon from '@/components/ui/CategoryIcon'
import Modal from '@/components/ui/Modal'
import { cn, formatINR, timeAgo } from '@/lib/utils'

const MapView = lazy(() => import('@/components/map/MapView'))

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <Icon size={14} /> {label}
      </p>
      <p className="mt-1 text-sm font-bold text-ink">{value}</p>
    </div>
  )
}

/**
 * Slide-over with full job details, AI match breakdown and the fraud check.
 * Keep `job` set while closing (only flip `open`) so the content stays during the exit animation.
 */
export default function JobDetail({ open, job, match, applied, onApply, onClose, onMessage }) {
  const fraud = match?.fraud
  const flagged = fraud?.level === 'high'

  return (
    <Modal
      open={open && Boolean(job)}
      onClose={onClose}
      side="right"
      title={job?.title}
      description={job && `${job.employer.name} · ${job.area}, ${job.district}`}
      footer={
        job && (
          <>
            <Button variant="outline" icon={MessageSquare} onClick={onMessage}>
              Message
            </Button>
            {flagged ? (
              <Button variant="danger" icon={ShieldAlert} onClick={onClose}>
                Report & hide
              </Button>
            ) : (
              <Button icon={applied ? CircleCheck : undefined} disabled={applied} onClick={onApply}>
                {applied ? 'Applied' : `Apply · ${formatINR(job.wage)}/day`}
              </Button>
            )}
          </>
        )
      }
    >
      {job && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <CategoryIcon category={job.category} size={52} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-bold text-ink">
                {job.employer.name}
                {job.employer.verified && <BadgeCheck size={17} className="text-brand-500" />}
              </p>
              <p className="flex items-center gap-1 text-sm text-muted">
                <Star size={14} className="fill-amber-400 text-amber-400" /> {job.employer.rating} employer rating ·
                posted {timeAgo(job.postedAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Fact icon={IndianRupee} label="Daily wage" value={formatINR(job.wage)} />
            <Fact icon={CalendarClock} label="Duration" value={job.duration} />
            <Fact icon={Clock} label="Shift" value={job.shift} />
            <Fact icon={Users} label="Openings" value={`${job.workersNeeded - job.hired} of ${job.workersNeeded}`} />
            <Fact icon={GraduationCap} label="Experience" value={job.experience} />
            <Fact icon={ShieldCheck} label="Employer" value={job.employer.verified ? 'Verified' : 'Not verified'} />
          </div>

          {match && !flagged && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-500/25 dark:bg-violet-500/10">
              <p className="flex items-center gap-2 font-bold text-violet-800 dark:text-violet-200">
                <Sparkles size={17} /> {match.score}% match for you
              </p>
              <ul className="mt-2 space-y-1.5">
                {match.reasons.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-ink-2">
                    <CircleCheck size={15} className="shrink-0 text-violet-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fraud && (
            <div
              className={cn(
                'rounded-2xl border p-4',
                fraud.level === 'low'
                  ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/10'
                  : fraud.level === 'medium'
                    ? 'border-amber-200 bg-amber-50/70 dark:border-amber-500/25 dark:bg-amber-500/10'
                    : 'border-rose-200 bg-rose-50/70 dark:border-rose-500/25 dark:bg-rose-500/10',
              )}
            >
              <p className="flex items-center gap-2 font-bold text-ink">
                {fraud.level === 'low' ? (
                  <ShieldCheck size={17} className="text-emerald-600" />
                ) : (
                  <ShieldAlert size={17} className={fraud.level === 'high' ? 'text-rose-600' : 'text-amber-600'} />
                )}
                AI safety check:{' '}
                {fraud.level === 'low'
                  ? 'looks genuine'
                  : fraud.level === 'medium'
                    ? 'review carefully'
                    : 'likely fraudulent'}
                <span className="ml-auto text-xs font-semibold text-muted">risk {fraud.risk}/100</span>
              </p>
              {fraud.reasons.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
                  {fraud.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <h3 className="font-bold text-ink">About the job</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{job.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <h3 className="mb-2 text-sm font-bold text-ink">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <Badge key={s} tone="brand" size="md">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-ink">Perks</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.perks.map((p) => (
                  <Badge key={p} tone="success" icon={CircleCheck} size="md">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-ink">Location</h3>
            <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-surface-2" />}>
              <MapView
                className="h-48"
                zoom={14}
                center={[job.location.lat, job.location.lng]}
                markers={[
                  {
                    id: job.id,
                    position: [job.location.lat, job.location.lng],
                    label: formatINR(job.wage),
                    variant: flagged ? 'danger' : 'brand',
                  },
                ]}
              />
            </Suspense>
          </div>
        </div>
      )}
    </Modal>
  )
}
