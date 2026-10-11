import { Suspense } from 'react'
import { Link, Outlet } from 'react-router'
import { motion } from 'motion/react'
import { ArrowLeft, BadgeCheck, CalendarCheck, QrCode, Sparkles, Star } from 'lucide-react'
import Logo from '@/components/brand/Logo'
import Avatar from '@/components/ui/Avatar'
import { PageLoader } from '@/components/ui/Misc'
import { LanguageToggle, ThemeToggle } from './Toggles'
import { useLang } from '@/context/LanguageContext'

function BrandPanel() {
  const { t } = useLang()
  const points = [
    [QrCode, t('auth.panel.p1')],
    [Sparkles, t('auth.panel.p2')],
    [CalendarCheck, t('auth.panel.p3')],
  ]
  return (
    <div className="relative hidden overflow-hidden bg-linear-to-br from-brand-700 via-brand-800 to-brand-950 p-10 text-white lg:flex lg:flex-col xl:p-14">
      <div className="absolute inset-0 [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:44px_44px] opacity-[0.07]" />
      <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-cyan-300/15 blur-3xl" />
      <div className="absolute top-1/3 -left-24 size-72 rounded-full bg-brand-400/25 blur-3xl" />

      <Logo inverted className="relative" />

      <div className="relative mt-auto max-w-md">
        <h2 className="text-4xl leading-tight font-extrabold tracking-tight">{t('auth.panel.title')}</h2>
        <ul className="mt-8 space-y-4">
          {points.map(([Icon, text]) => (
            <li key={text} className="flex items-center gap-3 text-white/90">
              <span className="grid size-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <Icon size={19} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative mt-10 max-w-sm rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['Sunita Devi', 'Mohammed Irfan', 'Geeta Yadav', 'Rajesh Gurjar'].map((n) => (
              <Avatar key={n} name={n} size={32} className="rounded-full ring-2 ring-brand-800" />
            ))}
          </div>
          <div className="text-sm">
            <p className="font-bold">126 workers hired today</p>
            <p className="flex items-center gap-1 text-xs text-white/70">
              <Star size={12} className="fill-amber-300 text-amber-300" /> 4.7 average employer rating
            </p>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-white/70">
          <BadgeCheck size={14} className="text-saffron-300" /> Every employer is GST or Udyam verified
        </p>
      </motion.div>
      <p className="relative mt-8 text-sm text-white/60">हुनर से रोज़गार तक · From skill to livelihood</p>
    </div>
  )
}

export default function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <BrandPanel />
      <div className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
            <ArrowLeft size={16} /> Home
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-8">
          <div className="w-full max-w-md">
            <Logo className="mb-8 w-fit lg:hidden" />
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
