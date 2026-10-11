import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  LocateFixed,
  Minus,
  Plus,
  Rocket,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { Chip, Field, Input, Select, Textarea } from '@/components/ui/Field'
import { PageHeader, Stepper } from '@/components/ui/Misc'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { JOB_CATEGORIES, employers, jobById } from '@/data/jobs'
import { assessJob } from '@/features/ai/engine/fraud'
import { DISTRICT_FACTOR, predictWage } from '@/features/ai/engine/wage'
import { cn, formatINR } from '@/lib/utils'

const MapView = lazy(() => import('@/components/map/MapView'))

const STEPS = ['Basics', 'Location & time', 'Pay & skills', 'Review']
const DURATIONS = ['1 week', '2 weeks', '1 month', '3 months', 'Ongoing']
const PERKS = [
  'Weekly payment',
  'Daily payment',
  'Lunch provided',
  'Safety gear',
  'Stay on site',
  'Travel allowance',
  'ESI & PF',
  'Overtime pay',
]
const SKILL_OPTIONS = [
  'Mason',
  'Plastering',
  'Tile fitter',
  'Bar bending',
  'Shuttering',
  'Carpenter',
  'Electrician',
  'Plumber',
  'Painter',
  'Welder',
  'Helper',
  'Waterproofing',
]
const DEFAULT_CENTER = { lat: 26.8549, lng: 75.8243 }
const TASKS = {
  Mason: 'brickwork, plastering and finishing',
  Carpenter: 'shuttering, fixtures and finishing',
  Electrician: 'wiring, fittings and testing',
  Plumber: 'pipe fitting and sanitary installation',
  Painter: 'putty, primer and two coats of paint',
  Welder: 'cutting, welding and fabrication',
  'Tile fitter': 'tile laying, levelling and grouting',
  Helper: 'material shifting and site support',
  'Farm worker': 'field preparation, sowing and harvesting',
  Loader: 'loading, unloading and stacking goods',
}

const blank = {
  title: '',
  category: 'Mason',
  description: '',
  workersNeeded: 4,
  area: 'Malviya Nagar',
  district: 'Jaipur',
  location: DEFAULT_CENTER,
  startDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
  duration: '1 month',
  shift: '8 AM – 6 PM',
  wage: 780,
  skills: ['Mason'],
  experience: '2+ years',
  perks: ['Weekly payment', 'Safety gear'],
}

function fromJob(job) {
  return {
    ...blank,
    ...job,
    duration: DURATIONS.includes(job.duration) ? job.duration : '1 month',
  }
}

export default function PostJob() {
  const { jobId } = useParams()
  const editing = jobId ? jobById[jobId] : null
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => (editing ? fromJob(editing) : blank))
  const [errors, setErrors] = useState({})
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const toggleIn = (key, value) =>
    set(key, form[key].includes(value) ? form[key].filter((v) => v !== value) : [...form[key], value])

  const suggestion = useMemo(
    () =>
      predictWage({
        skill: form.category === 'Loader' ? 'Helper' : form.category,
        district: form.district,
        experience: parseInt(form.experience) || 2,
        certified: false,
      }),
    [form.category, form.district, form.experience],
  )
  const safety = useMemo(
    () => assessJob({ ...form, employer: { ...employers.sharma, verified: user.verified } }),
    [form, user.verified],
  )

  const validate = () => {
    const next = {}
    if (step === 0) {
      if (form.title.trim().length < 6) next.title = 'Give the job a clear title (at least 6 characters)'
      if (form.description.trim().length < 30) next.description = 'Describe the work in at least 30 characters'
    }
    if (step === 2 && (!form.wage || form.wage < 200)) next.wage = 'Enter a daily wage of at least ₹200'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const next = () => validate() && setStep((s) => Math.min(s + 1, STEPS.length - 1))

  // "AI" description v1: a template filled from the form (swap for an LLM call later).
  const writeDescription = () => {
    const n = form.workersNeeded
    const who = `${n} experienced ${form.category.toLowerCase()}${n > 1 ? 's' : ''}`
    const tasks = TASKS[form.category] ?? `${form.category.toLowerCase()} work`
    const pay = form.perks.includes('Daily payment') ? 'daily' : 'weekly'
    const gear = form.perks.includes('Safety gear') ? ' Helmets, gloves and safety gear are provided on site.' : ''
    set(
      'description',
      `We need ${who} at our site in ${form.area}, ${form.district}. Work includes ${tasks}, starting ${new Date(form.startDate).toDateString().slice(4, 10)} for ${form.duration}. Wages are paid ${pay} via UPI.${gear}`,
    )
  }

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        set('location', { lat: coords.latitude, lng: coords.longitude })
        toast({ title: 'Site location set from GPS' })
      },
      () =>
        toast({
          tone: 'error',
          title: 'Could not read your location',
          description: 'Drag the pin on the map instead.',
        }),
    )
  }

  const publish = (asDraft) => {
    toast({
      title: asDraft ? 'Saved as draft' : editing ? 'Job updated' : 'Job published 🎉',
      description: asDraft ? form.title : `Matching workers near ${form.area} are being notified.`,
    })
    navigate('/employer/jobs')
  }

  return (
    <>
      <PageHeader
        title={editing ? 'Edit job' : 'Post a job'}
        description="Four quick steps. Our AI suggests a fair wage and checks the post for safety before it goes live."
        actions={
          <Button variant="outline" icon={Save} onClick={() => publish(true)}>
            Save draft
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-5 sm:p-7">
          <Stepper steps={STEPS} current={step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="mt-8 space-y-5"
            >
              {step === 0 && (
                <>
                  <Field label="Job title" required error={errors.title}>
                    <Input
                      value={form.title}
                      onChange={(e) => set('title', e.target.value)}
                      placeholder="e.g. Mason for G+3 residential building"
                    />
                  </Field>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-ink">Category</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {JOB_CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            set('category', c)
                            if (!form.skills.includes(c) && SKILL_OPTIONS.includes(c)) set('skills', [c])
                          }}
                          aria-pressed={form.category === c}
                          className={cn(
                            'flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 text-center text-xs font-semibold transition',
                            form.category === c
                              ? 'border-brand-500 bg-brand-50/60 text-ink dark:bg-brand-500/10'
                              : 'border-line text-ink-2 hover:border-line-strong',
                          )}
                        >
                          <CategoryIcon category={c} size={34} />
                          <span className="line-clamp-1">{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-ink">
                        Description <span className="text-rose-500">*</span>
                      </span>
                      <Button variant="ai" size="xs" icon={Wand2} onClick={writeDescription}>
                        Write with AI
                      </Button>
                    </div>
                    <Textarea
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      rows={5}
                      placeholder="What will workers do? Mention materials, timing and payment."
                      aria-label="Description"
                    />
                    {errors.description && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.description}</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-ink">Workers needed</p>
                    <div className="inline-flex items-center gap-1 rounded-xl border border-line p-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Fewer"
                        onClick={() => set('workersNeeded', Math.max(1, form.workersNeeded - 1))}
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-12 text-center text-lg font-bold text-ink tabular">{form.workersNeeded}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="More"
                        onClick={() => set('workersNeeded', form.workersNeeded + 1)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Area / locality">
                      <Input value={form.area} onChange={(e) => set('area', e.target.value)} />
                    </Field>
                    <Field label="District">
                      <Select value={form.district} onChange={(e) => set('district', e.target.value)}>
                        {Object.keys(DISTRICT_FACTOR).map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">Site location</p>
                      <Button variant="outline" size="sm" icon={LocateFixed} onClick={locate}>
                        Use my location
                      </Button>
                    </div>
                    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" />}>
                      <MapView
                        className="h-64"
                        zoom={14}
                        center={[form.location.lat, form.location.lng]}
                        draggable
                        onDragEnd={({ lat, lng }) => set('location', { lat, lng })}
                        markers={[
                          {
                            id: 'site',
                            position: [form.location.lat, form.location.lng],
                            label: 'Site · drag me',
                            variant: 'saffron',
                          },
                        ]}
                      />
                    </Suspense>
                    <p className="mt-1.5 text-xs text-muted">
                      Workers within your radius are alerted. Pin: {form.location.lat.toFixed(4)},{' '}
                      {form.location.lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Start date">
                      <Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                    </Field>
                    <Field label="Shift timing">
                      <Select value={form.shift} onChange={(e) => set('shift', e.target.value)}>
                        {['8 AM – 6 PM', '9 AM – 6 PM', '7 AM – 3 PM', 'Night (8 PM – 8 AM)', 'Rotational'].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-ink">Duration</p>
                    <div className="flex flex-wrap gap-2">
                      {DURATIONS.map((d) => (
                        <Chip key={d} active={form.duration === d} onClick={() => set('duration', d)}>
                          {d}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-500/25 dark:bg-violet-500/10">
                    <p className="flex items-center gap-2 text-sm font-bold text-violet-800 dark:text-violet-200">
                      <Sparkles size={16} /> AI wage suggestion for a {form.category.toLowerCase()} in {form.district}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-2xl font-extrabold text-ink">
                        {formatINR(suggestion.min)} – {formatINR(suggestion.max)}
                        <span className="text-sm font-semibold text-muted"> /day</span>
                      </p>
                      <Button size="sm" variant="ai" onClick={() => set('wage', suggestion.daily)}>
                        Use {formatINR(suggestion.daily)}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Daily wage"
                      required
                      error={errors.wage}
                      hint={
                        form.wage < suggestion.min
                          ? 'Below the fair range: expect fewer applicants.'
                          : 'Within or above the fair range.'
                      }
                    >
                      <Input
                        type="number"
                        value={form.wage}
                        onChange={(e) => set('wage', Number(e.target.value))}
                        suffix="₹/day"
                      />
                    </Field>
                    <Field label="Experience needed">
                      <Select value={form.experience} onChange={(e) => set('experience', e.target.value)}>
                        {['Freshers welcome', '1+ years', '2+ years', '3+ years', '5+ years'].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-ink">Skills required</p>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map((s) => (
                        <Chip key={s} active={form.skills.includes(s)} onClick={() => toggleIn('skills', s)}>
                          {s}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-ink">Perks</p>
                    <div className="flex flex-wrap gap-2">
                      {PERKS.map((p) => (
                        <Chip key={p} active={form.perks.includes(p)} onClick={() => toggleIn('perks', p)}>
                          {p}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div
                    className={cn(
                      'flex items-start gap-3 rounded-2xl border p-4',
                      safety.level === 'low'
                        ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/25 dark:bg-emerald-500/10'
                        : 'border-rose-200 bg-rose-50/70 dark:border-rose-500/25 dark:bg-rose-500/10',
                    )}
                  >
                    {safety.level === 'low' ? (
                      <ShieldCheck className="shrink-0 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="shrink-0 text-rose-600" />
                    )}
                    <div>
                      <p className="font-bold text-ink">
                        {safety.level === 'low' ? 'AI safety check passed' : 'Fix these before publishing'}
                      </p>
                      {safety.level === 'low' ? (
                        <p className="text-sm text-ink-2">
                          No fee requests, unrealistic wages or missing details found. Risk score {safety.risk}/100.
                        </p>
                      ) : (
                        <ul className="mt-1 list-disc pl-5 text-sm text-ink-2">
                          {safety.reasons.map((r) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['Title', form.title || '—'],
                      ['Category', form.category],
                      ['Workers', form.workersNeeded],
                      ['Location', `${form.area}, ${form.district}`],
                      ['Starts', new Date(form.startDate).toDateString()],
                      ['Duration & shift', `${form.duration} · ${form.shift}`],
                      ['Wage', `${formatINR(form.wage)}/day`],
                      ['Experience', form.experience],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-surface-2 p-3">
                        <dt className="text-xs font-semibold text-muted">{label}</dt>
                        <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-sm leading-relaxed text-ink-2">{form.description}</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
            <Button variant="ghost" icon={ArrowLeft} disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button iconRight={ArrowRight} onClick={next}>
                Continue
              </Button>
            ) : (
              <Button icon={Rocket} disabled={safety.level !== 'low'} onClick={() => publish(false)}>
                {editing ? 'Save changes' : 'Publish job'}
              </Button>
            )}
          </div>
        </Card>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <p className="text-xs font-bold tracking-wider text-muted uppercase">Live preview</p>
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <CategoryIcon category={form.category} size={46} />
              <div className="min-w-0">
                <p className="line-clamp-2 font-bold text-ink">{form.title || 'Your job title'}</p>
                <p className="text-sm text-ink-2">{user.company}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-2">
              {form.area} · {form.duration} · {form.workersNeeded} openings
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {form.skills.map((s) => (
                <Badge key={s} tone="brand">
                  {s}
                </Badge>
              ))}
            </div>
            <p className="mt-4">
              <span className="text-xl font-extrabold text-ink">{formatINR(form.wage || 0)}</span>
              <span className="text-sm text-muted">/day</span>
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-bold text-ink">Tips for more applicants</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              {[
                ['Pay within the AI fair range', form.wage >= suggestion.min],
                ['Mention weekly or daily payment', form.perks.some((p) => p.includes('payment'))],
                ['Provide safety gear', form.perks.includes('Safety gear')],
                ['Write 30+ words of description', form.description.split(/\s+/).filter(Boolean).length >= 30],
              ].map(([tip, done]) => (
                <li key={tip} className="flex items-center gap-2">
                  <CircleCheck size={16} className={done ? 'text-emerald-600' : 'text-line-strong'} />
                  <span className={done ? 'text-ink' : undefined}>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
