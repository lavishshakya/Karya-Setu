import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, animate, motion, useInView } from 'motion/react'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Handshake,
  HardHat,
  IndianRupee,
  Landmark,
  Languages,
  LayoutDashboard,
  MapPin,
  Menu,
  Mic,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  WifiOff,
  X,
} from 'lucide-react'
import Logo from '@/components/brand/Logo'
import HeroIllustration from '@/components/brand/HeroIllustration'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { Meter } from '@/components/ui/Progress'
import { LanguageToggle, ThemeToggle } from '@/components/layout/Toggles'
import { homeFor, useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { cn, formatCompact } from '@/lib/utils'

const YEAR = new Date().getFullYear()

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

function CountUp({ to, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration: 1.6, ease: 'easeOut', onUpdate: setValue })
    return () => controls.stop()
  }, [inView, to])
  return (
    <span ref={ref}>
      {prefix}
      {formatCompact(Math.round(value))}
      {suffix}
    </span>
  )
}

function SectionHeading({ eyebrow, title, sub, className }) {
  return (
    <motion.div {...reveal} className={cn('mx-auto max-w-2xl text-center', className)}>
      <p className="text-sm font-bold tracking-wider text-brand-600 uppercase dark:text-brand-300">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-base text-ink-2 sm:text-lg">{sub}</p>}
    </motion.div>
  )
}

function LandingNav() {
  const { t } = useLang()
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    ['#how', t('landing.nav.how')],
    ['#portals', t('landing.nav.portals')],
    ['#bharat', t('landing.nav.bharat')],
  ]

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open ? 'border-b border-line bg-surface/85 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-2 transition hover:bg-surface-2 hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle className="hidden sm:inline-flex" />
          <ThemeToggle />
          {user ? (
            <Button to={homeFor(user.role)} icon={LayoutDashboard} className="hidden sm:inline-flex">
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" to="/login" className="hidden sm:inline-flex">
                {t('landing.login')}
              </Button>
              <Button to="/register" className="hidden sm:inline-flex">
                {t('landing.getStarted')}
              </Button>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-xl p-2 text-ink-2 hover:bg-surface-2 md:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden"
          >
            <div className="space-y-1 px-4 pt-1 pb-4">
              {links.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 font-semibold text-ink-2 hover:bg-surface-2"
                >
                  {label}
                </a>
              ))}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold text-muted">Language</span>
                <LanguageToggle />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {user ? (
                  <Button to={homeFor(user.role)} className="col-span-2">
                    Go to dashboard
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" to="/login">
                      {t('landing.login')}
                    </Button>
                    <Button to="/register">{t('landing.getStarted')}</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function Hero() {
  const { t } = useLang()
  const stats = [
    { to: 12480, suffix: '+', label: t('landing.stat.workers') },
    { to: 3216, suffix: '+', label: t('landing.stat.jobs') },
    { to: 42000000, prefix: '₹', label: t('landing.stat.wages') },
    { to: 140, suffix: '+', label: t('landing.stat.panchayats') },
  ]
  return (
    <section className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)] opacity-60" />
        <div className="absolute -top-48 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-600/20" />
        <div className="absolute top-56 -right-24 size-96 rounded-full bg-saffron-300/25 blur-3xl dark:bg-saffron-600/10" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface/80 py-1 pr-3 pl-1 text-sm font-semibold text-brand-800 shadow-sm backdrop-blur dark:border-brand-500/30 dark:text-brand-200"
          >
            <span className="rounded-full bg-saffron-500 px-2 py-0.5 text-xs font-bold text-white">New</span>
            {t('landing.badge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6 }}
            className="mt-5 text-4xl leading-[1.08] font-extrabold tracking-tight text-ink sm:text-5xl lg:text-[64px] [&:lang(hi)]:leading-[1.3]"
          >
            {t('landing.title1')} <span className="text-gradient">{t('landing.title2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6 }}
            className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2"
          >
            {t('landing.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button size="lg" to="/register?role=worker" icon={HardHat}>
              {t('landing.ctaWorker')}
            </Button>
            <Button size="lg" variant="accent" to="/register?role=employer" icon={Building2}>
              {t('landing.ctaEmployer')}
            </Button>
          </motion.div>
          <Link
            to="/login"
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 dark:text-brand-300"
          >
            {t('landing.demo')}
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-xs font-semibold text-muted">{s.label}</dt>
                <dd className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroIllustration />
      </div>
    </section>
  )
}

const SCHEMES = [
  'e-Shram',
  'PM-SYM',
  'PMKVY 4.0',
  'Ayushman Bharat',
  'MGNREGA',
  'PM Vishwakarma',
  'PMSBY',
  'Atal Pension Yojana',
  'BOCW Welfare',
  'Skill India Digital',
  'UPI',
  'DigiLocker',
]

function SchemeStrip() {
  const { lang } = useLang()
  return (
    <section className="border-y border-line bg-surface/60 py-6">
      <p className="mb-4 text-center text-xs font-bold tracking-wider text-muted uppercase">
        {lang === 'hi'
          ? 'श्रमिकों को इन योजनाओं और सेवाओं से जोड़ता है'
          : 'Connects workers to welfare, skilling and payment rails'}
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
          {[...SCHEMES, ...SCHEMES].map((s, i) => (
            <span
              key={i}
              className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink-2"
            >
              <BadgeCheck size={15} className="text-brand-500" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { icon: ShieldCheck, key: 's1', color: 'from-brand-400 to-brand-600' },
  { icon: Sparkles, key: 's2', color: 'from-violet-400 to-violet-600' },
  { icon: Handshake, key: 's3', color: 'from-sky-400 to-sky-600' },
  { icon: CalendarCheck, key: 's4', color: 'from-emerald-400 to-emerald-600' },
  { icon: Wallet, key: 's5', color: 'from-saffron-400 to-saffron-600' },
]

function HowItWorks() {
  const { t } = useLang()
  return (
    <section id="how" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t('landing.how.eyebrow')} title={t('landing.how.title')} />
        <div className="relative mt-14">
          <div className="absolute top-8 right-[10%] left-[10%] hidden h-0.5 bg-linear-to-r from-brand-300 via-violet-300 to-saffron-300 lg:block dark:from-brand-700 dark:via-violet-700 dark:to-saffron-700" />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.key}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.08 }}
                className="relative text-center"
              >
                <span
                  className={cn(
                    'relative mx-auto grid size-16 place-items-center rounded-2xl bg-linear-to-br text-white shadow-lg ring-8 ring-bg',
                    step.color,
                  )}
                >
                  <step.icon size={28} />
                  <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-ink text-[11px] font-bold text-surface">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink">{t(`landing.how.${step.key}`)}</h3>
                <p className="mx-auto mt-1.5 max-w-[220px] text-sm text-ink-2">{t(`landing.how.${step.key}d`)}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function WorkerVisual() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar name="Ramesh Kumar" size={44} verified />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">Ramesh Kumar</p>
          <p className="flex items-center gap-1 text-xs text-muted">
            <Star size={12} className="fill-amber-400 text-amber-400" /> 4.8 · Mason · 9 yrs
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-xl bg-ink text-surface">
          <QrCode size={24} />
        </span>
      </div>
      <div className="mt-4 space-y-2.5">
        {[
          ['Mason', 90],
          ['Plastering', 80],
          ['Tile fitting', 65],
        ].map(([skill, level]) => (
          <div key={skill} className="grid grid-cols-[90px_1fr_32px] items-center gap-2 text-xs">
            <span className="font-semibold text-ink-2">{skill}</span>
            <Meter value={level} height={6} label={skill} />
            <span className="text-right font-bold text-ink">{level}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MapVisual() {
  const pins = [
    [22, 30],
    [64, 22],
    [40, 58],
    [76, 64],
    [30, 78],
  ]
  return (
    <div className="relative h-44 overflow-hidden rounded-2xl border border-line bg-surface-2 bg-dots">
      <div className="absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-saffron-400/70 bg-saffron-400/10" />
      <span className="absolute top-1/2 left-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-saffron-500 text-white ring-4 ring-saffron-500/25">
        <Building2 size={15} />
      </span>
      {pins.map(([x, y], i) => (
        <motion.span
          key={i}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
          className="absolute -translate-x-1/2 -translate-y-full text-brand-600"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <MapPin size={22} className="fill-brand-100 dark:fill-brand-900" />
        </motion.span>
      ))}
      <span className="absolute bottom-3 left-3 rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm">
        12 workers within 5 km
      </span>
    </div>
  )
}

function ChatVisual() {
  return (
    <div className="space-y-2 rounded-2xl border border-line bg-surface p-3 text-xs">
      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-3 py-2 text-white">
        पास में मिस्त्री का काम?
      </div>
      <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-surface-2 px-3 py-2 text-ink">
        5 किमी में 3 काम मिले। सबसे अच्छा मेल <b>94%</b> · ₹800/दिन
      </div>
      <div className="flex gap-1.5">
        <span className="rounded-full bg-violet-50 px-2 py-1 font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          Fraud check ✓
        </span>
        <span className="rounded-full bg-violet-50 px-2 py-1 font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          Fair wage ✓
        </span>
      </div>
    </div>
  )
}

function ChartVisual() {
  const cols = [42, 55, 48, 66, 72, 84, 96]
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted">Placements, last 7 months</p>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          +18%
        </span>
      </div>
      <div className="mt-3 flex h-24 items-end gap-2">
        {cols.map((h, i) => (
          <motion.span
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.6 }}
            className={cn(
              'flex-1 rounded-t-[4px]',
              i === cols.length - 1 ? 'bg-emerald-500' : 'bg-emerald-200 dark:bg-emerald-900',
            )}
          />
        ))}
      </div>
    </div>
  )
}

const PORTALS = [
  {
    role: 'worker',
    icon: HardHat,
    tone: 'from-brand-500 to-brand-700',
    span: 'lg:col-span-4',
    title: { en: 'Worker portal', hi: 'श्रमिक पोर्टल' },
    body: {
      en: 'A verified digital identity that travels with every worker.',
      hi: 'हर श्रमिक के साथ चलने वाली सत्यापित डिजिटल पहचान।',
    },
    points: {
      en: [
        'Profile, skills & certificates',
        'QR-based worker ID',
        'AI resume with PDF download',
        'Training & skill-gap analysis',
      ],
      hi: [
        'प्रोफ़ाइल, हुनर और प्रमाणपत्र',
        'QR आधारित श्रमिक पहचान पत्र',
        'AI रिज़्यूमे और PDF डाउनलोड',
        'प्रशिक्षण और हुनर-अंतर विश्लेषण',
      ],
    },
    visual: WorkerVisual,
  },
  {
    role: 'employer',
    icon: Building2,
    tone: 'from-saffron-400 to-saffron-600',
    span: 'lg:col-span-2',
    title: { en: 'Employer portal', hi: 'नियोक्ता पोर्टल' },
    body: { en: 'Hire nearby, verified workers in minutes.', hi: 'मिनटों में आसपास के सत्यापित श्रमिक।' },
    points: {
      en: ['Post jobs in 60 seconds', 'GPS nearby search', 'Contractor team dashboard'],
      hi: ['60 सेकंड में काम पोस्ट', 'GPS से आसपास खोज', 'ठेकेदार टीम डैशबोर्ड'],
    },
    visual: MapVisual,
  },
  {
    role: 'worker',
    icon: Sparkles,
    tone: 'from-violet-500 to-fuchsia-500',
    span: 'lg:col-span-2',
    title: { en: 'AI that works for workers', hi: 'श्रमिकों के लिए AI' },
    body: { en: 'Smart matching with safety built in.', hi: 'सुरक्षा के साथ स्मार्ट मिलान।' },
    points: {
      en: ['Job recommendations & wage prediction', 'Fraud and duplicate detection', 'OCR certificates & voice search'],
      hi: ['काम की सिफ़ारिश और मज़दूरी अनुमान', 'धोखाधड़ी और डुप्लिकेट पहचान', 'OCR प्रमाणपत्र और आवाज़ से खोज'],
    },
    visual: ChatVisual,
  },
  {
    role: 'admin',
    icon: Landmark,
    tone: 'from-emerald-500 to-teal-600',
    span: 'lg:col-span-4',
    title: { en: 'Admin & Panchayat', hi: 'एडमिन और पंचायत' },
    body: {
      en: 'Live employment data for better local decisions.',
      hi: 'बेहतर स्थानीय फ़ैसलों के लिए रोज़गार के ताज़ा आंकड़े।',
    },
    points: {
      en: [
        'Employment & hiring-trend analytics',
        'Fraud reports & dispute resolution',
        'Government scheme recommendations',
      ],
      hi: ['रोज़गार और भर्ती रुझान विश्लेषण', 'धोखाधड़ी रिपोर्ट और विवाद समाधान', 'सरकारी योजनाओं की सिफ़ारिश'],
    },
    visual: ChartVisual,
  },
]

function Portals() {
  const { t, lang } = useLang()
  return (
    <section id="portals" className="scroll-mt-20 bg-surface/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('landing.portals.eyebrow')}
          title={t('landing.portals.title')}
          sub={t('landing.portals.sub')}
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-6">
          {PORTALS.map((p, i) => (
            <motion.article
              key={p.title.en}
              {...reveal}
              transition={{ ...reveal.transition, delay: (i % 2) * 0.1 }}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card transition hover:shadow-pop sm:p-7',
                p.span,
              )}
            >
              <div
                className={cn(
                  'pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-linear-to-br opacity-15 blur-2xl transition group-hover:opacity-25',
                  p.tone,
                )}
              />
              <div className={cn('grid flex-1 content-center gap-6', p.span === 'lg:col-span-4' && 'md:grid-cols-2 md:items-center')}>
                <div>
                  <span
                    className={cn(
                      'grid size-12 place-items-center rounded-2xl bg-linear-to-br text-white shadow-md',
                      p.tone,
                    )}
                  >
                    <p.icon size={24} />
                  </span>
                  <h3 className="mt-4 text-xl font-extrabold text-ink">{p.title[lang]}</h3>
                  <p className="mt-1 text-sm text-ink-2">{p.body[lang]}</p>
                  <ul className="mt-4 space-y-2">
                    {p.points[lang].map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-ink-2">
                        <BadgeCheck size={16} className="mt-0.5 shrink-0 text-brand-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/login?role=${p.role}`}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:gap-2 dark:text-brand-300"
                  >
                    {lang === 'hi' ? 'डेमो खोलें' : 'Open demo'} <ArrowRight size={15} />
                  </Link>
                </div>
                <p.visual />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

const BHARAT_FEATURES = [
  {
    icon: Mic,
    en: ['Voice search', 'Speak in Hindi or English, no typing needed.'],
    hi: ['आवाज़ से खोज', 'हिंदी या अंग्रेज़ी में बोलिए, टाइप करने की ज़रूरत नहीं।'],
  },
  {
    icon: Languages,
    en: ['Bilingual by default', 'Every screen works in Hindi and English.'],
    hi: ['दो भाषाओं में', 'हर स्क्रीन हिंदी और अंग्रेज़ी में।'],
  },
  {
    icon: WifiOff,
    en: ['Light on data', 'Fast on low-end phones and patchy networks.'],
    hi: ['कम डेटा', 'सस्ते फ़ोन और कमज़ोर नेटवर्क पर भी तेज़।'],
  },
  {
    icon: IndianRupee,
    en: ['Every rupee tracked', 'UPI, bank and cash payments in one record.'],
    hi: ['हर रुपये का हिसाब', 'UPI, बैंक और नकद भुगतान एक जगह।'],
  },
  {
    icon: ShieldCheck,
    en: ['Safe workplaces', 'Report unsafe sites or harassment in a tap.'],
    hi: ['सुरक्षित कार्यस्थल', 'असुरक्षित साइट या उत्पीड़न की शिकायत एक टैप में।'],
  },
  {
    icon: QrCode,
    en: ['QR identity', 'Skills and ratings verified with one scan.'],
    hi: ['QR पहचान', 'एक स्कैन में हुनर और रेटिंग की पुष्टि।'],
  },
]

function BuiltForBharat() {
  const { t, lang } = useLang()
  return (
    <section id="bharat" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <motion.div {...reveal}>
            <p className="text-sm font-bold tracking-wider text-brand-600 uppercase dark:text-brand-300">
              {t('landing.bharat.eyebrow')}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {t('landing.bharat.title')}
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {BHARAT_FEATURES.map((f, i) => {
              const [title, body] = f[lang]
              return (
                <motion.div
                  key={f.en[0]}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * 0.05 }}
                  className="flex gap-3.5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <f.icon size={21} />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink">{title}</h3>
                    <p className="mt-0.5 text-sm text-ink-2">{body}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <motion.div {...reveal} className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-6 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="relative rounded-[2.2rem] border border-line bg-surface p-2.5 shadow-pop">
            <div className="rounded-[1.8rem] bg-bg p-5">
              <p className="text-center text-xs font-semibold text-muted">
                {lang === 'hi' ? 'आवाज़ से खोज' : 'Voice search'}
              </p>
              <div className="relative mx-auto mt-5 grid size-24 place-items-center">
                <span className="absolute inset-0 animate-ping-slow rounded-full bg-violet-500/25" />
                <span className="absolute inset-3 animate-ping-slow rounded-full bg-violet-500/25 [animation-delay:600ms]" />
                <span className="relative grid size-16 place-items-center rounded-full bg-linear-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg">
                  <Mic size={28} />
                </span>
              </div>
              <p className="mt-5 text-center text-lg font-bold text-ink">“मुझे पास में राजमिस्त्री का काम चाहिए”</p>
              <div className="mt-5 space-y-2">
                {[
                  ['Mason · Sanganer', '₹780', '1.4 km'],
                  ['Mason · Malviya Nagar', '₹800', '2.3 km'],
                  ['Bar bender · Jagatpura', '₹760', '4.8 km'],
                ].map(([title, wage, dist], i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5"
                  >
                    <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                      <HardHat size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{title}</p>
                      <p className="text-xs text-muted">{dist}</p>
                    </div>
                    <span className="text-sm font-extrabold text-ink">{wage}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FinalCta() {
  const { t } = useLang()
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <motion.div
        {...reveal}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-700 via-brand-800 to-brand-950 px-6 py-14 text-center text-white sm:px-12 sm:py-20"
      >
        <svg
          viewBox="0 0 800 300"
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-20"
          aria-hidden="true"
        >
          <path d="M-20 260 Q400 -40 820 260" fill="none" stroke="white" strokeWidth="3" />
          <path d="M-20 262 H820" stroke="white" strokeWidth="3" />
          {[100, 200, 300, 500, 600, 700].map((x) => {
            const t = (x + 20) / 840 // the arc's x is linear in t, so y = 260 − 600·t·(1−t)
            return <line key={x} x1={x} x2={x} y1={260 - 600 * t * (1 - t)} y2={262} stroke="white" strokeWidth="1.5" />
          })}
        </svg>
        <div className="absolute -top-20 -left-20 size-72 rounded-full bg-saffron-500/25 blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{t('landing.cta.title')}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">{t('landing.cta.sub')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="white" to="/register?role=worker" icon={HardHat}>
              {t('landing.ctaWorker')}
            </Button>
            <Button size="lg" variant="accent" to="/register?role=employer" icon={Building2}>
              {t('landing.ctaEmployer')}
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  const columns = [
    [
      'Portals',
      [
        ['Worker portal', '/login?role=worker'],
        ['Employer portal', '/login?role=employer'],
        ['Admin console', '/login?role=admin'],
        ['Panchayat portal', '/login?role=panchayat'],
      ],
    ],
    [
      'Platform',
      [
        ['How it works', '#how'],
        ['Built for Bharat', '#bharat'],
        ['Create account', '/register'],
      ],
    ],
  ]
  return (
    <footer className="border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-ink-2">
            Karya Setu bridges India's workers and employers with verified profiles, fair wages and a transparent
            employment record.
          </p>
        </div>
        {columns.map(([title, links]) => (
          <div key={title}>
            <p className="text-sm font-bold text-ink">{title}</p>
            <ul className="mt-3 space-y-2">
              {links.map(([label, href]) => (
                <li key={label}>
                  {href.startsWith('#') ? (
                    <a href={href} className="text-sm text-ink-2 hover:text-ink">
                      {label}
                    </a>
                  ) : (
                    <Link to={href} className="text-sm text-ink-2 hover:text-ink">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {YEAR} Karya Setu · कार्य सेतु · Made in India
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div className="min-h-dvh overflow-x-clip">
      <LandingNav />
      <main>
        <Hero />
        <SchemeStrip />
        <HowItWorks />
        <Portals />
        <BuiltForBharat />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
