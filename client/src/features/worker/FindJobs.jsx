import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { List, LocateFixed, Map as MapIcon, Search, SearchX, ShieldAlert, Sparkles } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { Chip, Select, Switch } from '@/components/ui/Field'
import { EmptyState, PageHeader } from '@/components/ui/Misc'
import Tabs from '@/components/ui/Tabs'
import { useToast } from '@/context/ToastContext'
import { jobs, workerApplications } from '@/data/jobs'
import { workerProfile } from '@/data/workers'
import { assessJob } from '@/features/ai/engine/fraud'
import { scoreJob } from '@/features/ai/engine/recommend'
import { matchesQuery, queryTokens } from '@/features/ai/engine/search'
import VoiceSearchButton from '@/features/ai/VoiceSearchButton'
import { cn, formatINR, haversineKm } from '@/lib/utils'
import JobCard from './JobCard'
import JobDetail from './JobDetail'

const MapView = lazy(() => import('@/components/map/MapView'))

const SORTS = {
  match: { label: 'Best match (AI)', fn: (a, b) => b.score - a.score },
  nearest: { label: 'Nearest first', fn: (a, b) => a.distance - b.distance },
  wage: { label: 'Highest wage', fn: (a, b) => b.job.wage - a.job.wage },
  newest: { label: 'Newest', fn: (a, b) => new Date(b.job.postedAt) - new Date(a.job.postedAt) },
}

export default function FindJobs() {
  const toast = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const setQuery = (q) => setParams(q ? { q } : {}, { replace: true })

  const [category, setCategory] = useState('All')
  const [radius, setRadius] = useState(20)
  const [sort, setSort] = useState('match')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showFlagged, setShowFlagged] = useState(false)
  const [view, setView] = useState('list')
  const [origin, setOrigin] = useState({ ...workerProfile.location, label: `${workerProfile.area}, Jaipur` })
  const [applied, setApplied] = useState(() => new Set(workerApplications.map((a) => a.jobId)))
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState({ open: false, match: null })

  const scored = useMemo(() => {
    const worker = { ...workerProfile, location: origin }
    return jobs
      .filter((j) => j.status === 'active' && j.hired < j.workersNeeded)
      .map((job) => ({ job, ...scoreJob(worker, job), fraud: assessJob(job) }))
  }, [origin])

  const categories = useMemo(() => ['All', ...new Set(scored.map((r) => r.job.category))], [scored])
  const flaggedCount = scored.filter((r) => r.fraud.level === 'high').length
  const tokens = queryTokens(query)

  const results = scored
    .filter((r) => {
      if (r.fraud.level === 'high' && !showFlagged) return false
      if (category !== 'All' && r.job.category !== category && !r.job.skills.includes(category)) return false
      if (r.distance > radius) return false
      if (verifiedOnly && !r.job.employer.verified) return false
      const { title, area, employer, skills } = r.job
      return matchesQuery(`${title} ${r.job.category} ${area} ${employer.name} ${skills.join(' ')}`, tokens)
    })
    .sort(SORTS[sort].fn)

  const apply = (job) => {
    setApplied((s) => new Set(s).add(job.id))
    toast({ title: `Applied to ${job.employer.name}`, description: "We'll notify you as soon as they respond." })
  }

  const open = (match) => setDetail({ open: true, match })

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast({ tone: 'error', title: 'Location is not available on this device' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here = { lat: coords.latitude, lng: coords.longitude }
        if (haversineKm(here, workerProfile.location) > 60) {
          toast({
            tone: 'info',
            title: "You're outside the demo area",
            description: 'Showing jobs around Jaipur instead.',
          })
          return
        }
        setOrigin({ ...here, label: 'your current location' })
        toast({ title: 'Using your GPS location' })
      },
      () =>
        toast({
          tone: 'error',
          title: 'Location permission denied',
          description: 'Showing jobs near your saved address.',
        }),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const markers = results.map((r) => ({
    id: r.job.id,
    position: [r.job.location.lat, r.job.location.lng],
    label: formatINR(r.job.wage),
    variant: r.fraud.level === 'high' ? 'danger' : r.job.urgent ? 'saffron' : 'brand',
    tooltip: r.job.title,
  }))

  return (
    <>
      <PageHeader
        title="Find jobs"
        description={`AI-ranked jobs within ${radius} km of ${origin.label}.`}
        actions={
          <Tabs
            value={view}
            onChange={setView}
            tabs={[
              { value: 'list', label: 'List', icon: List },
              { value: 'map', label: 'Map', icon: MapIcon },
            ]}
          />
        }
      />

      <Card className="mb-5 space-y-4 p-3 sm:p-4">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mason, Sanganer, tile… or tap the mic"
              className="control h-11 pl-10"
              aria-label="Search jobs"
            />
          </div>
          <VoiceSearchButton onTranscript={setQuery} size={44} />
          <div className="hidden w-48 sm:block">
            <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort jobs">
              {Object.entries(SORTS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="-mx-1 no-scrollbar flex gap-2 overflow-x-auto px-1">
          {categories.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
              icon={c === 'All' ? Sparkles : undefined}
            >
              {c === 'All' ? 'All jobs' : c}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-4">
          <label className="flex min-w-56 flex-1 items-center gap-3 text-sm font-semibold text-ink sm:max-w-xs">
            <span className="shrink-0">Within {radius} km</span>
            <input
              type="range"
              min={2}
              max={40}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <Switch size="sm" checked={verifiedOnly} onChange={setVerifiedOnly} label="Verified employers only" />
          {flaggedCount > 0 && (
            <Switch
              size="sm"
              checked={showFlagged}
              onChange={setShowFlagged}
              label={`Show ${flaggedCount} AI-flagged`}
            />
          )}
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="sm:hidden">
              <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort jobs" className="h-9">
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button variant="outline" size="sm" icon={LocateFixed} onClick={locateMe}>
              Use GPS
            </Button>
          </div>
        </div>
      </Card>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-2">
          <b className="text-ink">{results.length}</b> jobs found
          {tokens.length > 0 && (
            <>
              {' '}
              for <span className="font-semibold text-ink">“{tokens.join(' ')}”</span>
            </>
          )}
        </p>
        {!showFlagged && flaggedCount > 0 && (
          <Badge tone="ai" icon={ShieldAlert} size="md">
            AI hid {flaggedCount} suspicious job{flaggedCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {results.length === 0 ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="No jobs match these filters"
            description="Try a wider distance, another category or a different search."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('')
                  setCategory('All')
                  setRadius(40)
                }}
              >
                Reset filters
              </Button>
            }
          />
        </Card>
      ) : view === 'list' ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {results.map((r) => (
            <JobCard
              key={r.job.id}
              job={r.job}
              match={r}
              applied={applied.has(r.job.id)}
              onApply={() => apply(r.job)}
              onOpen={() => open(r)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Suspense fallback={<div className="h-[420px] animate-pulse rounded-2xl bg-surface-2 lg:h-[600px]" />}>
            <MapView
              className="h-[420px] lg:h-[600px]"
              center={[origin.lat, origin.lng]}
              zoom={11}
              radiusKm={radius}
              me={[origin.lat, origin.lng]}
              markers={markers}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </Suspense>
          <div className="scrollbar-thin space-y-2 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1">
            {results.map((r) => (
              <button
                key={r.job.id}
                type="button"
                onClick={() => (selectedId === r.job.id ? open(r) : setSelectedId(r.job.id))}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border bg-surface p-3 text-left transition',
                  selectedId === r.job.id
                    ? 'border-brand-500 ring-4 ring-brand-500/10'
                    : 'border-line hover:border-line-strong',
                )}
              >
                <CategoryIcon category={r.job.category} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{r.job.title}</p>
                  <p className="text-xs text-muted">
                    {r.job.area} · {r.distance.toFixed(1)} km ·{' '}
                    {r.fraud.level === 'high' ? 'flagged' : `${r.score}% match`}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-ink">{formatINR(r.job.wage)}</span>
              </button>
            ))}
            <p className="px-1 pt-1 text-xs text-muted">Tap a job to highlight it on the map, tap again for details.</p>
          </div>
        </div>
      )}

      <JobDetail
        open={detail.open}
        job={detail.match?.job}
        match={detail.match}
        applied={detail.match && applied.has(detail.match.job.id)}
        onApply={() => apply(detail.match.job)}
        onMessage={() => navigate('/worker/messages')}
        onClose={() => setDetail((d) => ({ ...d, open: false }))}
      />
    </>
  )
}
