import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CircleCheck,
  HardHat,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { Stepper } from '@/components/ui/Misc'
import { homeFor, useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { JOB_CATEGORIES } from '@/data/jobs'
import { DISTRICT_FACTOR } from '@/features/ai/engine/wage'
import { cn } from '@/lib/utils'

const ACCOUNT_TYPES = [
  {
    value: 'worker',
    icon: HardHat,
    title: { en: 'I want work', hi: 'मुझे काम चाहिए' },
    body: {
      en: 'Find verified jobs nearby, track attendance and wages.',
      hi: 'आसपास सत्यापित काम खोजें, हाज़िरी और मज़दूरी ट्रैक करें।',
    },
  },
  {
    value: 'employer',
    icon: Building2,
    title: { en: 'I want to hire', hi: 'मुझे श्रमिक चाहिए' },
    body: {
      en: 'Post jobs and hire verified workers in minutes.',
      hi: 'काम पोस्ट करें और मिनटों में सत्यापित श्रमिक पाएं।',
    },
  },
  {
    value: 'contractor',
    icon: Users,
    title: { en: 'I manage a team', hi: 'मैं ठेकेदार हूँ' },
    body: {
      en: 'Assign workers to sites, mark attendance, run payroll.',
      hi: 'साइट पर श्रमिक भेजें, हाज़िरी लगाएं, भुगतान करें।',
    },
  },
]

const STEPS = {
  en: ['Account type', 'Your details', 'Verify phone'],
  hi: ['खाते का प्रकार', 'आपका विवरण', 'फ़ोन सत्यापन'],
}

function OtpInput({ value, onChange }) {
  const refs = useRef([])
  const update = (i, digit) => {
    const next = [...value]
    next[i] = digit
    onChange(next)
    if (digit && i < 5) refs.current[i + 1]?.focus()
  }
  return (
    <div
      className="flex justify-between gap-2"
      onPaste={(e) => {
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
        if (digits.length) {
          e.preventDefault()
          onChange([...digits, ...Array(6 - digits.length).fill('')])
          refs.current[Math.min(digits.length, 5)]?.focus()
        }
      }}
    >
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={digit}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => update(i, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={(e) => e.key === 'Backspace' && !digit && i > 0 && refs.current[i - 1]?.focus()}
          className="control h-14 w-full max-w-14 px-0 text-center text-xl font-bold"
        />
      ))}
    </div>
  )
}

export default function Register() {
  const { t, lang } = useLang()
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preset = ACCOUNT_TYPES.some((a) => a.value === params.get('role')) ? params.get('role') : null

  const [step, setStep] = useState(preset ? 1 : 0)
  const [type, setType] = useState(preset ?? 'worker')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    district: 'Jaipur',
    skill: 'Mason',
    experience: '',
    company: '',
    gstin: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)

  const isWorker = type === 'worker'
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 3) next.name = 'Enter your full name'
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) next.phone = 'Enter a valid 10-digit mobile number'
    if (!isWorker && form.company.trim().length < 2) next.company = 'Enter your company or firm name'
    if (form.password.length < 6) next.password = 'Use at least 6 characters'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const finish = async () => {
    if (otp.join('').length < 6) return
    setLoading(true)
    const user = await register({
      role: isWorker ? 'worker' : 'employer',
      contractor: type === 'contractor',
      name: form.name.trim(),
      phone: `+91 ${form.phone}`,
      district: form.district,
      ...(isWorker ? { skill: form.skill } : { company: form.company.trim() }),
    })
    setLoading(false)
    toast({
      title: lang === 'hi' ? 'कार्य सेतु में आपका स्वागत है!' : 'Welcome to Karya Setu!',
      description: 'Your account is ready.',
    })
    navigate(homeFor(user.role), { replace: true })
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{t('auth.registerTitle')}</h1>
      <p className="mt-1.5 text-ink-2">{t('auth.registerSub')}</p>
      <Stepper steps={STEPS[lang]} current={step} className="mt-7" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="mt-7"
        >
          {step === 0 && (
            <div className="space-y-3">
              {ACCOUNT_TYPES.map((a) => {
                const active = type === a.value
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setType(a.value)}
                    aria-pressed={active}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition',
                      active
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-500/10'
                        : 'border-line bg-surface hover:border-line-strong',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-12 shrink-0 place-items-center rounded-xl transition',
                        active ? 'bg-brand-600 text-white' : 'bg-surface-2 text-ink-2',
                      )}
                    >
                      <a.icon size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink">{a.title[lang]}</span>
                      <span className="block text-sm text-muted">{a.body[lang]}</span>
                    </span>
                    <CircleCheck
                      size={22}
                      className={cn('shrink-0 transition', active ? 'text-brand-600' : 'text-transparent')}
                    />
                  </button>
                )
              })}
              <Button size="lg" className="mt-3 w-full" iconRight={ArrowRight} onClick={() => setStep(1)}>
                Continue
              </Button>
            </div>
          )}

          {step === 1 && (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                if (validate()) setStep(2)
              }}
              className="space-y-4"
            >
              <Field label="Full name" required error={errors.name}>
                <Input
                  icon={UserRound}
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Sunita Devi"
                  autoComplete="name"
                />
              </Field>
              <Field
                label="Mobile number"
                required
                error={errors.phone}
                hint="We'll send a one-time password to verify it."
              >
                <Input
                  icon={Phone}
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="98290 41212"
                  inputMode="tel"
                  autoComplete="tel-national"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="District">
                  <Select value={form.district} onChange={set('district')}>
                    {Object.keys(DISTRICT_FACTOR).map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </Select>
                </Field>
                {isWorker ? (
                  <Field label="Main skill">
                    <Select value={form.skill} onChange={set('skill')}>
                      {JOB_CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  </Field>
                ) : (
                  <Field label="GSTIN / Udyam no." hint="Optional, speeds up verification">
                    <Input value={form.gstin} onChange={set('gstin')} placeholder="08ABCDE1234F1Z5" />
                  </Field>
                )}
              </div>
              {!isWorker && (
                <Field label={type === 'contractor' ? 'Firm name' : 'Company name'} required error={errors.company}>
                  <Input
                    icon={Building2}
                    value={form.company}
                    onChange={set('company')}
                    placeholder="e.g. Sharma Constructions"
                  />
                </Field>
              )}
              <Field label="Password" required error={errors.password}>
                <Input
                  icon={Lock}
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </Field>
              <p className="flex items-start gap-2 text-xs text-muted">
                <ShieldCheck size={15} className="mt-px shrink-0 text-brand-500" />
                Aadhaar e-KYC and skill verification come next, from your profile. Your data is never shared without
                consent.
              </p>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" size="lg" icon={ArrowLeft} onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button type="submit" size="lg" className="flex-1" iconRight={ArrowRight}>
                  Send OTP
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-4">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  <Phone size={20} />
                </span>
                <div className="text-sm">
                  <p className="font-semibold text-ink">Enter the 6-digit code sent to</p>
                  <p className="text-ink-2">+91 {form.phone}</p>
                </div>
              </div>
              <div className="mt-6">
                <OtpInput value={otp} onChange={setOtp} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setOtp('123456'.split(''))}
                  className="font-semibold text-brand-700 hover:underline dark:text-brand-300"
                >
                  Demo: auto-fill 123456
                </button>
                <span className="flex items-center gap-1 text-muted">
                  <MapPin size={14} /> {form.district}
                </span>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" size="lg" icon={ArrowLeft} onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  loading={loading}
                  disabled={otp.join('').length < 6}
                  onClick={finish}
                >
                  Verify & create account
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="mt-8 text-center text-sm text-ink-2">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-bold text-brand-700 hover:underline dark:text-brand-300">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  )
}
