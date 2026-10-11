import { lazy, Suspense, useMemo, useState } from 'react'
import { Building2, MapPin, Send, Star, Users } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip, Field, Select, Switch } from '@/components/ui/Field'
import { EmptyState, PageHeader } from '@/components/ui/Misc'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { employerJobs, sites } from '@/data/jobs'
import { workers } from '@/data/workers'
import { cn, formatINR, haversineKm, initials } from '@/lib/utils'

const MapView = lazy(() => import('@/components/map/MapView'))

const SITE_LOCATIONS = {
  's-1': { lat: 26.8549, lng: 75.8243 },
  's-2': { lat: 26.8206, lng: 75.7969 },
  's-3': { lat: 26.8261, lng: 75.8571 },
}

export default function Nearby() {
  const toast = useToast()
  const [siteId, setSiteId] = useState('s-1')
  const [radius, setRadius] = useState(12)
  const [skill, setSkill] = useState('All')
  const [availableOnly, setAvailableOnly] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [inviting, setInviting] = useState(null)
  const [inviteJob, setInviteJob] = useState(employerJobs[0].id)

  const center = SITE_LOCATIONS[siteId]
  const skills = ['All', ...new Set(workers.map((w) => w.primarySkill))]
  const nearby = useMemo(
    () =>
      workers
        .map((w) => ({ worker: w, distance: haversineKm(center, w.location) }))
        .filter(
          ({ worker, distance }) =>
            distance <= radius &&
            (skill === 'All' || worker.primarySkill === skill) &&
            (!availableOnly || worker.available),
        )
        .sort((a, b) => a.distance - b.distance),
    [center, radius, skill, availableOnly],
  )

  const markers = [
    {
      id: 'site',
      position: [center.lat, center.lng],
      label: sites.find((s) => s.id === siteId).name,
      variant: 'saffron',
    },
    ...nearby.map(({ worker }) => ({
      id: worker.id,
      position: [worker.location.lat, worker.location.lng],
      label: `${initials(worker.name)} · ${worker.primarySkill}`,
      variant: worker.available ? 'brand' : 'muted',
      tooltip: `${worker.name} · ★ ${worker.rating}`,
    })),
  ]

  return (
    <>
      <PageHeader
        title="Nearby workers"
        description="GPS search around your sites. Workers share an approximate location only, never their home address."
      />

      <Card className="mb-5 flex flex-col gap-4 p-4 lg:flex-row lg:items-end">
        <Field label="Search around" className="lg:w-64">
          <Select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`Radius: ${radius} km`} className="lg:w-56">
          <input
            type="range"
            min={2}
            max={30}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="h-11 w-full"
          />
        </Field>
        <Switch checked={availableOnly} onChange={setAvailableOnly} label="Available now" className="lg:mb-2.5" />
        <p className="text-sm text-ink-2 lg:mb-3 lg:ml-auto">
          <b className="text-ink">{nearby.length}</b> workers found
        </p>
      </Card>

      <div className="-mx-1 mb-5 no-scrollbar flex gap-2 overflow-x-auto px-1">
        {skills.map((s) => (
          <Chip key={s} active={skill === s} onClick={() => setSkill(s)}>
            {s === 'All' ? 'All skills' : s}
          </Chip>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Suspense fallback={<div className="h-[420px] animate-pulse rounded-2xl bg-surface-2 lg:h-[620px]" />}>
          <MapView
            className="h-[420px] lg:h-[620px]"
            center={[center.lat, center.lng]}
            zoom={12}
            radiusKm={radius}
            markers={markers}
            selectedId={selectedId}
            onSelect={(id) => id !== 'site' && setSelectedId(id)}
          />
        </Suspense>

        <div className="scrollbar-thin space-y-2.5 lg:max-h-[620px] lg:overflow-y-auto lg:pr-1">
          {nearby.length === 0 ? (
            <Card>
              <EmptyState
                icon={Users}
                title="No workers in this radius"
                description="Increase the radius or include busy workers."
              />
            </Card>
          ) : (
            nearby.map(({ worker, distance }) => (
              <div
                key={worker.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(worker.id)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedId(worker.id)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border bg-surface p-3 transition',
                  selectedId === worker.id
                    ? 'border-brand-500 ring-4 ring-brand-500/10'
                    : 'border-line hover:border-line-strong',
                )}
              >
                <Avatar name={worker.name} size={44} verified={worker.verified} online={worker.available} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{worker.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    {worker.primarySkill} · {worker.experience} yrs ·{' '}
                    <Star size={11} className="fill-amber-400 text-amber-400" /> {worker.rating}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 font-semibold text-ink-2">
                      <MapPin size={12} /> {distance.toFixed(1)} km
                    </span>
                    <span className="text-muted">asks {formatINR(worker.expectedWage)}/day</span>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={worker.available ? 'primary' : 'secondary'}
                  icon={Send}
                  onClick={(e) => {
                    e.stopPropagation()
                    setInviting(worker)
                  }}
                >
                  Invite
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        open={Boolean(inviting)}
        onClose={() => setInviting(null)}
        title={inviting && `Invite ${inviting.name}`}
        description="They'll get an SMS and an app notification with the job details."
        icon={Building2}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviting(null)}>
              Cancel
            </Button>
            <Button
              icon={Send}
              onClick={() => {
                toast({
                  title: `Invite sent to ${inviting.name}`,
                  description: employerJobs.find((j) => j.id === inviteJob).title,
                })
                setInviting(null)
              }}
            >
              Send invite
            </Button>
          </>
        }
      >
        <Field label="Which job?">
          <Select value={inviteJob} onChange={(e) => setInviteJob(e.target.value)}>
            {employerJobs
              .filter((j) => j.status === 'active')
              .map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} · {formatINR(j.wage)}/day
                </option>
              ))}
          </Select>
        </Field>
        {inviting && !inviting.available && (
          <Badge tone="warning" size="md" className="mt-3">
            Currently busy. They may accept from a later date.
          </Badge>
        )}
      </Modal>
    </>
  )
}
