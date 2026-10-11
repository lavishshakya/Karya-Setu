import { useRef, useState } from 'react'
import {
  BadgeCheck,
  Building2,
  CircleCheck,
  Clock,
  FileText,
  FileUp,
  Landmark,
  MapPin,
  Phone,
  Save,
  Star,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/Misc'
import { Meter, ProgressRing } from '@/components/ui/Progress'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const RATINGS = [
  [5, 68],
  [4, 22],
  [3, 6],
  [2, 3],
  [1, 1],
]

export default function Company() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const fileRef = useRef(null)
  const [licence, setLicence] = useState('todo')
  const [form, setForm] = useState({
    company: user.company,
    type: 'Builder / contractor',
    gstin: '08ABCDE1234F1Z5',
    contact: user.name,
    phone: user.phone,
    email: user.email,
    address: 'Plot 14, Sector 3, Malviya Nagar, Jaipur 302017',
    about:
      'Residential and commercial construction across Jaipur since 2009. Weekly UPI payments and safety gear for every worker.',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const steps = [
    { icon: Phone, title: 'Mobile number', body: 'Verified with OTP', status: 'done' },
    { icon: FileText, title: 'GSTIN', body: `${form.gstin} · matched with GST portal`, status: 'done' },
    { icon: Building2, title: 'Udyam registration', body: 'UDYAM-RJ-17-0024581', status: 'done' },
    { icon: MapPin, title: 'Site address proof', body: 'Electricity bill · Malviya Nagar', status: 'done' },
    {
      icon: Landmark,
      title: 'Contractor labour licence',
      body:
        licence === 'todo'
          ? 'Required for teams of 20+ workers (Verified+ badge)'
          : 'Uploaded · admin review in 24 hours',
      status: licence,
    },
  ]
  const progress = Math.round((steps.filter((s) => s.status === 'done').length / steps.length) * 100)

  return (
    <>
      <PageHeader
        title="Company & verification"
        description="A complete, verified profile earns worker trust and ranks your jobs higher."
      />

      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-5 bg-linear-to-r from-saffron-50 via-surface to-surface p-5 sm:flex-row sm:items-center sm:p-6 dark:from-saffron-500/10">
          <Avatar name={form.company} size={76} className="rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-ink">{form.company}</h2>
              <Badge tone="success" icon={BadgeCheck} size="md">
                Verified employer
              </Badge>
            </div>
            <p className="mt-0.5 text-ink-2">{form.type} · Jaipur · on Karya Setu since Jun 2025</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center sm:w-80">
            {[
              ['41', 'jobs posted'],
              ['168', 'workers hired'],
              ['97%', 'paid on time'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-surface p-2.5 ring-1 ring-line">
                <p className="text-lg font-extrabold text-ink">{value}</p>
                <p className="text-[11px] text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="p-5 sm:p-6">
          <CardHeader title="Company details" subtitle="Shown on every job you post" />
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              updateUser({ company: form.company })
              toast('Company details saved')
            }}
          >
            <Field label="Company name" required>
              <Input value={form.company} onChange={set('company')} />
            </Field>
            <Field label="Business type">
              <Select value={form.type} onChange={set('type')}>
                {[
                  'Builder / contractor',
                  'Farm / agriculture',
                  'Factory / manufacturing',
                  'Logistics & warehousing',
                  'Hospitality',
                  'Household',
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="GSTIN">
              <Input value={form.gstin} onChange={set('gstin')} />
            </Field>
            <Field label="Contact person">
              <Input value={form.contact} onChange={set('contact')} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={set('phone')} />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={set('email')} />
            </Field>
            <Field label="Registered address" className="sm:col-span-2">
              <Input value={form.address} onChange={set('address')} />
            </Field>
            <Field label="About the company" className="sm:col-span-2">
              <Textarea value={form.about} onChange={set('about')} rows={3} />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" icon={Save}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={progress} size={68} stroke={7} color="var(--color-emerald-500)">
                <span className="text-base font-extrabold text-ink">{progress}%</span>
              </ProgressRing>
              <div>
                <p className="font-bold text-ink">Verification</p>
                <p className="text-sm text-muted">
                  {progress === 100 ? 'Verified+ unlocked' : 'One step to Verified+'}
                </p>
              </div>
            </div>
            <ol className="mt-5 space-y-3">
              {steps.map((s) => (
                <li key={s.title} className="flex items-start gap-3">
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-xl',
                      s.status === 'done'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'bg-surface-2 text-muted',
                    )}
                  >
                    <s.icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{s.title}</p>
                    <p className="text-xs text-muted">{s.body}</p>
                  </div>
                  {s.status === 'done' && (
                    <CircleCheck size={18} className="shrink-0 text-emerald-600" aria-label="Done" />
                  )}
                  {s.status === 'pending' && (
                    <Badge tone="warning" icon={Clock}>
                      In review
                    </Badge>
                  )}
                  {s.status === 'todo' && (
                    <Button size="xs" icon={FileUp} onClick={() => fileRef.current?.click()}>
                      Upload
                    </Button>
                  )}
                </li>
              ))}
            </ol>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (!e.target.files[0]) return
                setLicence('pending')
                toast({
                  title: 'Labour licence uploaded',
                  description: `${e.target.files[0].name} · we'll review it within 24 hours.`,
                })
              }}
            />
          </Card>

          <Card className="p-5">
            <CardHeader title="What workers say" subtitle="4.6 average from 168 hires" />
            <div className="mt-4 flex items-center gap-4">
              <p className="text-4xl font-extrabold text-ink">4.6</p>
              <div className="flex-1 space-y-1.5">
                {RATINGS.map(([stars, pct]) => (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="flex w-7 items-center gap-0.5 font-semibold text-ink-2">
                      {stars} <Star size={10} className="fill-amber-400 text-amber-400" />
                    </span>
                    <Meter value={pct} tone="warning" height={6} label={`${stars} star: ${pct}%`} />
                    <span className="w-8 text-right text-muted tabular">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['Pays on time', 'Safety gear given', 'Respectful supervisors', 'Clear instructions'].map((tag) => (
                <Badge key={tag} tone="success" icon={CircleCheck}>
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
