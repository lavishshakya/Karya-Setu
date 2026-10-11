import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  BellRing,
  CircleCheck,
  Coins,
  GraduationCap,
  HeartPulse,
  Info,
  Landmark,
  Search,
  ShieldCheck,
  Sparkles,
  Umbrella,
  Wallet,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Chip, Field, Input, Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/Misc'
import { Meter } from '@/components/ui/Progress'
import { useToast } from '@/context/ToastContext'
import { JOB_CATEGORIES } from '@/data/jobs'
import { eligibleSchemes, schemes, villageWorkers } from '@/data/panchayat'
import { cn, formatNumber } from '@/lib/utils'

const CATEGORY_META = {
  'Social security': [ShieldCheck, 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'],
  Pension: [Wallet, 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300'],
  Health: [HeartPulse, 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'],
  Insurance: [Umbrella, 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300'],
  Employment: [Coins, 'bg-saffron-50 text-saffron-600 dark:bg-saffron-500/10 dark:text-saffron-300'],
  Skilling: [GraduationCap, 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'],
}

export default function Schemes() {
  const toast = useToast()
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [person, setPerson] = useState({ age: 44, skill: 'Painter', income: 13500 })
  const [picked, setPicked] = useState('')

  const matches = useMemo(() => eligibleSchemes(person), [person])
  const categories = ['All', ...Object.keys(CATEGORY_META)]
  const visible = schemes.filter(
    (s) =>
      (category === 'All' || s.category === category) &&
      `${s.name} ${s.short} ${s.benefit}`.toLowerCase().includes(query.toLowerCase()),
  )

  const pickWorker = (id) => {
    setPicked(id)
    const w = villageWorkers.find((v) => v.id === id)
    if (w) setPerson({ age: w.age, skill: w.skill, income: w.income })
  }

  return (
    <>
      <PageHeader
        title="Government schemes"
        description="Match workers to welfare, insurance, pension and skilling schemes, and track enrolment across your panchayat."
      />

      <Card className="relative mb-6 overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <CardHeader
              icon={Sparkles}
              title="Eligibility checker"
              subtitle="Pick a worker or enter details. Rules run instantly."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Village worker" className="sm:col-span-2">
                <Select value={picked} onChange={(e) => pickWorker(e.target.value)}>
                  <option value="">Enter details manually</option>
                  {villageWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} · Ward {w.ward}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={`Age: ${person.age}`}>
                <input
                  type="range"
                  min={15}
                  max={75}
                  value={person.age}
                  onChange={(e) => setPerson((p) => ({ ...p, age: Number(e.target.value) }))}
                  className="h-11 w-full"
                />
              </Field>
              <Field label="Work">
                <Select value={person.skill} onChange={(e) => setPerson((p) => ({ ...p, skill: e.target.value }))}>
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Monthly income" className="sm:col-span-2">
                <Input
                  type="number"
                  value={person.income}
                  onChange={(e) => setPerson((p) => ({ ...p, income: Number(e.target.value) }))}
                  suffix="₹"
                />
              </Field>
            </div>
          </div>
          <div className="rounded-2xl bg-surface-2 p-4 sm:p-5">
            <p className="text-sm font-semibold text-ink-2">Likely eligible for</p>
            <p className="text-3xl font-extrabold text-ink">
              {matches.length} <span className="text-base font-semibold text-muted">of {schemes.length} schemes</span>
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {schemes.map((s) => {
                const ok = matches.includes(s)
                return (
                  <motion.li
                    key={s.id}
                    layout
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                      ok
                        ? 'bg-surface font-semibold text-ink ring-1 ring-line'
                        : 'text-muted line-through decoration-line-strong',
                    )}
                  >
                    <CircleCheck size={16} className={ok ? 'shrink-0 text-emerald-600' : 'shrink-0 text-line-strong'} />
                    {s.short}
                  </motion.li>
                )
              })}
            </ul>
          </div>
        </div>
      </Card>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="-mx-1 no-scrollbar flex gap-2 overflow-x-auto px-1">
          {categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="lg:ml-auto lg:w-72">
          <Input
            icon={Search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schemes"
            aria-label="Search schemes"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {visible.map((s) => {
          const [Icon, tone] = CATEGORY_META[s.category] ?? [Landmark, 'bg-surface-2 text-ink-2']
          const pct = Math.round((s.enrolled / s.eligible) * 100)
          const gap = s.eligible - s.enrolled
          return (
            <Card key={s.id} interactive className="flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl', tone)}>
                  <Icon size={22} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-extrabold text-ink">{s.short}</h3>
                    <Badge tone="neutral">{s.category}</Badge>
                  </div>
                  <p className="text-xs text-muted">{s.name !== s.short ? s.name : s.ministry}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{s.benefit}</p>
              <ul className="mt-3 space-y-1">
                {s.eligibility.map((e) => (
                  <li key={e} className="flex items-start gap-1.5 text-xs text-ink-2">
                    <CircleCheck size={13} className="mt-0.5 shrink-0 text-brand-500" /> {e}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold text-muted">Enrolled in panchayat</span>
                  <span className="font-bold text-ink tabular">
                    {formatNumber(s.enrolled)} / {formatNumber(s.eligible)} · {pct}%
                  </span>
                </div>
                <Meter
                  value={pct}
                  tone={pct >= 70 ? 'success' : pct >= 40 ? 'brand' : 'warning'}
                  label={`${s.short} enrolment`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={BellRing}
                  className="mt-4 w-full"
                  onClick={() =>
                    toast({
                      title: `SMS sent to ${formatNumber(gap)} eligible workers`,
                      description: `${s.short}: how to apply and documents needed.`,
                    })
                  }
                >
                  Notify {formatNumber(gap)} eligible workers
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <p className="mt-6 flex items-start gap-2 text-xs text-muted">
        <Info size={14} className="mt-px shrink-0" />
        Scheme benefits and eligibility are summarised for guidance and can change. Always confirm on the official
        scheme portal or with the block office before advising a worker.
      </p>
    </>
  )
}
