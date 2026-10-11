import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Award,
  BadgeCheck,
  Banknote,
  Briefcase,
  CalendarDays,
  CircleCheck,
  Clock,
  Fingerprint,
  GraduationCap,
  Pencil,
  Phone,
  Plus,
  QrCode,
  ScanText,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Chip, Field, Input, Select, Switch, Textarea } from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import { Meter } from '@/components/ui/Progress'
import Tabs from '@/components/ui/Tabs'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { JOB_CATEGORIES } from '@/data/jobs'
import { workerProfile } from '@/data/workers'
import OcrScanner from '@/features/ai/OcrScanner'
import { predictWage } from '@/features/ai/engine/wage'
import { cn, formatDate, formatINR } from '@/lib/utils'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'skills', label: 'Skills' },
  { value: 'experience', label: 'Experience' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'availability', label: 'Availability' },
  { value: 'verification', label: 'Verification' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const EXTRA_SKILLS = [
  'Plastering',
  'Bar bending',
  'Shuttering',
  'Waterproofing',
  'Panel wiring',
  'Pipe fitting',
  'Fabrication',
  'Modular furniture',
]

const levelLabel = (level) => (level >= 80 ? 'Expert' : level >= 50 ? 'Skilled' : 'Learning')

function Overview({ profile, setProfile, toast }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile.about)
  const details = [
    ['Phone', profile.phone],
    ['Email', profile.email],
    ['Date of birth', formatDate(profile.dob)],
    ['Blood group', profile.bloodGroup],
    ['Languages', profile.languages.join(', ')],
    ['Emergency contact', profile.emergencyContact],
    ['Address', profile.address],
  ]
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Card className="p-5">
        <CardHeader
          title="About me"
          action={
            !editing && (
              <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setEditing(true)}>
                Edit
              </Button>
            )
          }
        />
        {editing ? (
          <div className="mt-3 space-y-3">
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} aria-label="About me" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setProfile((p) => ({ ...p, about: draft }))
                  setEditing(false)
                  toast('About section updated')
                }}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 leading-relaxed text-ink-2">{profile.about}</p>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Jobs done', profile.jobsDone],
            ['Rating', `${profile.rating} ★`],
            ['Repeat employers', 6],
            ['On-time days', '96%'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface-2 p-3 text-center">
              <p className="text-lg font-extrabold text-ink">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <CardHeader title="Personal details" subtitle="Only shared with employers who hire you" />
        <dl className="mt-4 divide-y divide-line">
          {details.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[130px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  )
}

function Skills({ profile, setProfile, toast }) {
  const options = [...JOB_CATEGORIES, ...EXTRA_SKILLS].filter((s) => !profile.skills.some((k) => k.name === s))
  const [newSkill, setNewSkill] = useState(options[0])
  const [level, setLevel] = useState(50)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Card className="p-5">
        <CardHeader
          title="Skills & levels"
          subtitle="Levels come from assessments, certificates and employer ratings"
        />
        <ul className="mt-5 space-y-4">
          {profile.skills.map((skill) => (
            <li key={skill.name} className="grid grid-cols-[minmax(0,140px)_1fr_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{skill.name}</p>
                <p className="text-xs text-muted">
                  {levelLabel(skill.level)} · {skill.level}/100
                </p>
              </div>
              <Meter
                value={skill.level}
                tone={skill.level >= 80 ? 'success' : skill.level >= 50 ? 'brand' : 'warning'}
                label={skill.name}
              />
              <button
                type="button"
                onClick={() => setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s.name !== skill.name) }))}
                className="rounded-lg p-1.5 text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                aria-label={`Remove ${skill.name}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-3 rounded-2xl bg-surface-2 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Add a skill">
            <Select value={newSkill} onChange={(e) => setNewSkill(e.target.value)}>
              {options.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label={`Your level: ${level}`}>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="h-11 w-full"
            />
          </Field>
          <Button
            icon={Plus}
            disabled={!newSkill}
            onClick={() => {
              setProfile((p) => ({ ...p, skills: [...p.skills, { name: newSkill, level }] }))
              setNewSkill(options.find((s) => s !== newSkill))
              toast({ title: `${newSkill} added`, description: 'Book an assessment to get it verified.' })
            }}
          >
            Add
          </Button>
        </div>
      </Card>
      <Card className="relative overflow-hidden p-5">
        <div className="absolute -top-12 -right-12 size-40 rounded-full bg-brand-300/25 blur-2xl" />
        <span className="relative grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
          <GraduationCap size={24} />
        </span>
        <h3 className="relative mt-4 text-lg font-bold text-ink">Get your skills certified for free</h3>
        <p className="relative mt-1 text-sm text-ink-2">
          Recognition of Prior Learning (RPL) under PMKVY tests what you already know. Certified workers earn about 10%
          more on Karya Setu.
        </p>
        <ul className="relative mt-4 space-y-2 text-sm text-ink-2">
          {['1-day practical test near you', 'Government certificate', 'Skill badge on your Worker ID'].map((p) => (
            <li key={p} className="flex items-center gap-2">
              <CircleCheck size={16} className="text-emerald-600" /> {p}
            </li>
          ))}
        </ul>
        <Button
          className="relative mt-5"
          onClick={() =>
            toast({ title: 'Assessment requested', description: 'The PMKVY centre will call you within 2 days.' })
          }
        >
          Book RPL assessment
        </Button>
      </Card>
    </div>
  )
}

function Experience({ profile, setProfile, toast }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ role: '', employer: '', place: '', from: '', to: '', description: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <Card className="p-5">
      <CardHeader
        title="Work experience"
        subtitle="Jobs done through Karya Setu are added automatically"
        action={
          <Button size="sm" icon={Plus} onClick={() => setOpen(true)}>
            Add
          </Button>
        }
      />
      <ol className="relative mt-6 space-y-6 border-l-2 border-line pl-6">
        {profile.history.map((h, i) => (
          <li key={h.id} className="relative">
            <span
              className={cn(
                'absolute top-1 -left-[33px] grid size-4 place-items-center rounded-full ring-4 ring-surface',
                i === 0 ? 'bg-brand-500' : 'bg-surface-3',
              )}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-bold text-ink">{h.role}</p>
              <p className="text-xs font-semibold text-muted">
                {h.from} – {h.to}
              </p>
            </div>
            <p className="text-sm font-medium text-ink-2">
              {h.employer} · {h.place}
            </p>
            <p className="mt-1 text-sm text-ink-2">{h.description}</p>
          </li>
        ))}
      </ol>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add experience"
        icon={Briefcase}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!form.role || !form.employer}
              onClick={() => {
                setProfile((p) => ({
                  ...p,
                  history: [{ id: Date.now(), ...form, to: form.to || 'Present' }, ...p.history],
                }))
                setOpen(false)
                setForm({ role: '', employer: '', place: '', from: '', to: '', description: '' })
                toast('Experience added')
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role" required>
            <Input value={form.role} onChange={set('role')} placeholder="e.g. Mason" />
          </Field>
          <Field label="Employer" required>
            <Input value={form.employer} onChange={set('employer')} placeholder="Company or contractor" />
          </Field>
          <Field label="Place" className="sm:col-span-2">
            <Input value={form.place} onChange={set('place')} placeholder="Area, city" />
          </Field>
          <Field label="From">
            <Input value={form.from} onChange={set('from')} placeholder="Jan 2024" />
          </Field>
          <Field label="To">
            <Input value={form.to} onChange={set('to')} placeholder="Present" />
          </Field>
          <Field label="What did you do?" className="sm:col-span-2">
            <Textarea value={form.description} onChange={set('description')} rows={3} />
          </Field>
        </div>
      </Modal>
    </Card>
  )
}

function Certificates({ profile, setProfile, toast }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-3">
        {profile.certificates.map((c) => (
          <Card key={c.id} className="flex items-start gap-4 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-saffron-50 text-saffron-600 dark:bg-saffron-500/10 dark:text-saffron-300">
              <Award size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">{c.name}</p>
              <p className="text-sm text-ink-2">{c.issuer}</p>
              <p className="mt-1 font-mono text-xs text-muted">
                {c.number} · {formatDate(c.issued)}
              </p>
            </div>
            {c.verified ? (
              <Badge tone="success" icon={BadgeCheck}>
                Verified
              </Badge>
            ) : (
              <Badge tone="warning" icon={Clock}>
                Checking
              </Badge>
            )}
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <CardHeader
          icon={ScanText}
          title="Add a certificate"
          subtitle="AI reads the details. We verify them with the issuer."
        />
        <div className="mt-5">
          <OcrScanner
            name={profile.name}
            onAdd={(fields) => {
              const get = (label) => fields.find((f) => f.label === label)?.value
              setProfile((p) => ({
                ...p,
                certificates: [
                  ...p.certificates,
                  {
                    id: `c${Date.now()}`,
                    name: get('Certificate'),
                    issuer: get('Issued by'),
                    number: get('Certificate no.'),
                    issued: new Date().toISOString(),
                    verified: false,
                  },
                ],
              }))
              toast({
                tone: 'ai',
                title: 'Certificate added',
                description: 'We will verify it with the issuer within 48 hours.',
              })
            }}
          />
        </div>
      </Card>
    </div>
  )
}

function Availability({ profile, toast }) {
  const [available, setAvailable] = useState(profile.available)
  const [days, setDays] = useState(profile.availability.days)
  const [shift, setShift] = useState(profile.availability.shift)
  const [radius, setRadius] = useState(profile.availability.radiusKm)
  const [wage, setWage] = useState(profile.expectedWage)
  const fair = useMemo(
    () =>
      predictWage({
        skill: profile.primarySkill,
        district: profile.district,
        experience: profile.experience,
        certified: true,
      }),
    [profile],
  )

  return (
    <Card className="max-w-3xl p-5 sm:p-6">
      <CardHeader
        title="When and where you want to work"
        subtitle="Employers only see jobs that fit these preferences"
      />
      <div className="mt-6 space-y-6">
        <Switch
          checked={available}
          onChange={setAvailable}
          label="Available for new work"
          description="Turn off when you're busy. Your profile stays visible to current employers."
        />
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Working days</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <Chip
                key={d}
                active={days.includes(d)}
                onClick={() => setDays((list) => (list.includes(d) ? list.filter((x) => x !== d) : [...list, d]))}
              >
                {d}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Shift</p>
          <Tabs
            value={shift}
            onChange={setShift}
            tabs={[
              { value: 'day', label: 'Day' },
              { value: 'night', label: 'Night' },
              { value: 'flexible', label: 'Flexible' },
            ]}
          />
        </div>
        <Field label={`Travel up to ${radius} km`}>
          <input
            type="range"
            min={2}
            max={50}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full"
          />
        </Field>
        <Field
          label="Expected daily wage"
          hint={`AI fair range for you: ${formatINR(fair.min)} – ${formatINR(fair.max)}`}
        >
          <Input
            type="number"
            value={wage}
            onChange={(e) => setWage(Number(e.target.value))}
            suffix="/day"
            className="max-w-xs"
          />
        </Field>
        <Button
          onClick={() =>
            toast({
              title: 'Preferences saved',
              description: `${days.length} days · ${shift} shift · ${radius} km · ${formatINR(wage)}/day`,
            })
          }
        >
          Save preferences
        </Button>
      </div>
    </Card>
  )
}

function Verification({ toast }) {
  const [police, setPolice] = useState('none')
  const items = [
    { icon: Phone, title: 'Mobile number', body: '+91 98290 41212 verified with OTP', status: 'done' },
    { icon: Fingerprint, title: 'Aadhaar e-KYC', body: 'XXXX XXXX 4417 · verified via DigiLocker', status: 'done' },
    { icon: Banknote, title: 'Bank account', body: 'Bank of Baroda ••2208 · wages go here', status: 'done' },
    { icon: Award, title: 'Skill assessment', body: 'Mason, NSQF Level 3 (PMKVY)', status: 'done' },
    {
      icon: ShieldCheck,
      title: 'Police verification',
      body: police === 'none' ? 'Needed for security and household jobs' : 'Requested · usually takes 7–10 days',
      status: police === 'none' ? 'todo' : 'pending',
    },
  ]
  return (
    <Card className="max-w-3xl p-5 sm:p-6">
      <CardHeader title="Verification" subtitle="Verified workers appear first in employer searches" />
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.title} className="flex items-center gap-4 rounded-2xl border border-line p-4">
            <span
              className={cn(
                'grid size-11 shrink-0 place-items-center rounded-xl',
                item.status === 'done'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : 'bg-surface-2 text-muted',
              )}
            >
              <item.icon size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">{item.title}</p>
              <p className="text-sm text-muted">{item.body}</p>
            </div>
            {item.status === 'done' && (
              <Badge tone="success" icon={CircleCheck} size="md">
                Verified
              </Badge>
            )}
            {item.status === 'pending' && (
              <Badge tone="warning" icon={Clock} size="md">
                Pending
              </Badge>
            )}
            {item.status === 'todo' && (
              <Button
                size="sm"
                onClick={() => {
                  setPolice('requested')
                  toast({
                    title: 'Police verification requested',
                    description: 'Your panchayat will help with the paperwork.',
                  })
                }}
              >
                Request
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('overview')
  const [profile, setProfile] = useState(() => ({ ...workerProfile, name: user.name }))

  const share = async () => {
    const url = `${window.location.origin}/verify/${profile.workerId}`
    try {
      if (navigator.share) await navigator.share({ title: `${profile.name} · Karya Setu`, url })
      else {
        await navigator.clipboard.writeText(url)
        toast({ title: 'Profile link copied', description: url })
      }
    } catch {
      // share sheet dismissed
    }
  }

  const sectionProps = { profile, setProfile, toast }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative h-32 overflow-hidden bg-linear-to-r from-brand-800 via-brand-600 to-brand-400 sm:h-40">
          <div className="absolute inset-0 [background-image:radial-gradient(white_1.5px,transparent_1.5px)] [background-size:18px_18px] opacity-15" />
          {/* The logo motif: a saffron sun rising over the bridge. */}
          <svg viewBox="0 0 600 160" className="absolute right-0 bottom-0 h-full" aria-hidden="true">
            <circle cx="300" cy="40" r="16" className="fill-saffron-400" />
            <circle cx="300" cy="40" r="30" className="fill-saffron-300/25" />
            <g stroke="white" strokeOpacity="0.3" strokeWidth="4" fill="none">
              <path d="M40 150 Q300 -30 560 150" />
              <path d="M20 152 H580" />
              <path d="M170 83 V152 M300 60 V152 M430 83 V152" strokeWidth="2.5" />
            </g>
          </svg>
        </div>
        <div className="px-5 pb-5 sm:px-6">
          {/* Only the avatar overlaps the cover; it must be positioned to paint above it. */}
          <div className="relative -mt-12 w-fit sm:-mt-14">
            <Avatar name={profile.name} size={104} verified className="rounded-full ring-4 ring-surface" />
          </div>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink">{profile.name}</h1>
              <p className="text-ink-2">
                {profile.primarySkill} · {profile.experience} years · {profile.area}, {profile.district}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="success" icon={BadgeCheck}>
                  Aadhaar verified
                </Badge>
                <Badge tone="brand" icon={Award}>
                  Skill certified
                </Badge>
                <Badge tone="saffron" icon={Star}>
                  {profile.rating} · {profile.reviews} reviews
                </Badge>
                <Badge tone="neutral" icon={CalendarDays}>
                  Member since {formatDate(profile.joined, { month: 'short', year: 'numeric' })}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" icon={Share2} onClick={share}>
                Share
              </Button>
              <Button icon={QrCode} to="/worker/id">
                Worker ID
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
        <Button variant="ai" size="sm" icon={Sparkles} to="/worker/resume">
          Turn into resume
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'overview' && <Overview {...sectionProps} />}
          {tab === 'skills' && <Skills {...sectionProps} />}
          {tab === 'experience' && <Experience {...sectionProps} />}
          {tab === 'certificates' && <Certificates {...sectionProps} />}
          {tab === 'availability' && <Availability {...sectionProps} />}
          {tab === 'verification' && <Verification toast={toast} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
