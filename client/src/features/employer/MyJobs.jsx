import { useState } from 'react'
import { Briefcase, CirclePlus, Eye, MapPin, Pencil, Power, RotateCcw, Search, Trash2, Users } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { Input } from '@/components/ui/Field'
import { EmptyState, PageHeader } from '@/components/ui/Misc'
import Modal from '@/components/ui/Modal'
import { Meter } from '@/components/ui/Progress'
import Tabs from '@/components/ui/Tabs'
import Avatar from '@/components/ui/Avatar'
import { useToast } from '@/context/ToastContext'
import { candidateApplications, employerJobs } from '@/data/jobs'
import { workerById } from '@/data/workers'
import { formatINR, timeAgo } from '@/lib/utils'

export default function MyJobs() {
  const toast = useToast()
  const [items, setItems] = useState(employerJobs)
  const [tab, setTab] = useState('active')
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState(null)

  const counts = {
    active: items.filter((j) => j.status === 'active').length,
    draft: items.filter((j) => j.status === 'draft').length,
    closed: items.filter((j) => j.status === 'closed').length,
  }
  const visible = items.filter(
    (j) => j.status === tab && `${j.title} ${j.area} ${j.category}`.toLowerCase().includes(query.toLowerCase()),
  )

  const setStatus = (job, status) => {
    setItems((list) => list.map((j) => (j.id === job.id ? { ...j, status } : j)))
    toast({ title: status === 'closed' ? 'Job closed' : 'Job reopened', description: job.title })
  }

  return (
    <>
      <PageHeader
        title="My jobs"
        description="Manage your postings, see who applied and keep track of hiring."
        actions={
          <Button icon={CirclePlus} to="/employer/post-job">
            Post a job
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'active', label: 'Active', count: counts.active },
            { value: 'draft', label: 'Drafts', count: counts.draft },
            { value: 'closed', label: 'Closed', count: counts.closed },
          ]}
        />
        <div className="sm:w-72">
          <Input
            icon={Search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your jobs"
            aria-label="Search jobs"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title={`No ${tab} jobs`}
            description="Jobs you post will appear here."
            action={<Button to="/employer/post-job">Post a job</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map((job) => {
            const applicants = candidateApplications.filter((c) => c.jobId === job.id)
            return (
              <Card key={job.id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <CategoryIcon category={job.category} size={50} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-ink">{job.title}</h3>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-muted" /> {job.area}
                        </span>
                        <span>{formatINR(job.wage)}/day</span>
                        <span>{job.duration}</span>
                        <span className="text-muted">Posted {timeAgo(job.postedAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 items-center gap-5 sm:flex lg:w-auto">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {applicants.slice(0, 3).map((a) => (
                          <Avatar
                            key={a.id}
                            name={workerById[a.workerId].name}
                            size={30}
                            className="rounded-full ring-2 ring-surface"
                          />
                        ))}
                        {applicants.length === 0 && (
                          <span className="grid size-[30px] place-items-center rounded-full bg-surface-2 text-muted">
                            <Users size={14} />
                          </span>
                        )}
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-ink">{job.applicants}</p>
                        <p className="text-xs text-muted">applicants</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-40">
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="font-semibold text-muted">Hired</span>
                        <span className="font-bold text-ink tabular">
                          {job.hired}/{job.workersNeeded}
                        </span>
                      </div>
                      <Meter
                        value={job.hired}
                        max={job.workersNeeded}
                        tone={job.hired >= job.workersNeeded ? 'success' : 'brand'}
                        label="Hired"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button size="sm" variant="outline" icon={Eye} to={`/employer/candidates?job=${job.id}`}>
                      Candidates
                    </Button>
                    <Button size="sm" variant="ghost" icon={Pencil} to={`/employer/jobs/${job.id}/edit`}>
                      Edit
                    </Button>
                    {job.status === 'active' ? (
                      <Button size="sm" variant="ghost" icon={Power} onClick={() => setStatus(job, 'closed')}>
                        Close
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => setStatus(job, 'active')}>
                        {job.status === 'draft' ? 'Publish' : 'Reopen'}
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="danger-soft"
                      aria-label={`Delete ${job.title}`}
                      onClick={() => setDeleting(job)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this job?"
        description={deleting?.title}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => {
                setItems((list) => list.filter((j) => j.id !== deleting.id))
                toast({ title: 'Job deleted', description: deleting.title })
                setDeleting(null)
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-2">
          Applicants will be told the job is no longer available. Hired workers, attendance and payments are kept.
        </p>
      </Modal>
    </>
  )
}
