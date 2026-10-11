import { motion } from 'motion/react'
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  HardHat,
  IndianRupee,
  MapPin,
  QrCode,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { ProgressRing } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'

function Floating({ className, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4 + delay, type: 'spring', damping: 18, stiffness: 140 }}
      className={cn('absolute z-20', className)}
    >
      <div
        className="animate-float rounded-2xl border border-line bg-surface/95 p-3 shadow-pop backdrop-blur"
        style={{ animationDelay: `${delay * 2}s` }}
      >
        {children}
      </div>
    </motion.div>
  )
}

const bars = [38, 52, 46, 64, 58, 76, 88]

/** Landing hero: a worker-side and employer-side pillar joined by the bridge, with live UI cards. */
export default function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-[6/5.4] w-full max-w-[600px]">
      {/* glow */}
      <div className="absolute inset-[12%] rounded-full bg-brand-400/25 blur-3xl dark:bg-brand-500/20" />
      <div className="absolute right-[6%] bottom-[10%] size-40 rounded-full bg-saffron-400/25 blur-3xl" />

      {/* bridge line-art */}
      <svg viewBox="0 0 600 540" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <linearGradient id="hero-arc" x1="0" x2="1">
            <stop offset="0" stopColor="var(--color-brand-500)" />
            <stop offset="1" stopColor="var(--color-saffron-500)" />
          </linearGradient>
        </defs>
        <path
          d="M60 390 Q300 40 540 390"
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M60 390 Q300 40 540 390"
          fill="none"
          stroke="url(#hero-arc)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 10"
          className="animate-dash"
        />
        {[120, 180, 240, 360, 420, 480].map((x) => {
          const t = (x - 60) / 480
          const y = (1 - t) ** 2 * 390 + 2 * (1 - t) * t * 40 + t ** 2 * 390
          return <line key={x} x1={x} y1={y + 6} x2={x} y2={390} stroke="var(--line-strong)" strokeWidth="2" />
        })}
        <line x1="30" y1="392" x2="570" y2="392" stroke="var(--line-strong)" strokeWidth="8" strokeLinecap="round" />
        <rect x="46" y="330" width="28" height="150" rx="8" fill="var(--surface-3)" />
        <rect x="526" y="330" width="28" height="150" rx="8" fill="var(--surface-3)" />
      </svg>

      {/* pillar nodes */}
      <div className="absolute top-[52%] left-[1%] z-10 flex flex-col items-center gap-1.5">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg ring-4 shadow-brand-600/30 ring-surface">
          <HardHat size={26} />
        </span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-ink-2 shadow-sm">Workers</span>
      </div>
      <div className="absolute top-[52%] right-[1%] z-10 flex flex-col items-center gap-1.5">
        <span className="grid size-14 place-items-center rounded-2xl bg-saffron-500 text-white shadow-lg ring-4 shadow-saffron-500/30 ring-surface">
          <Building2 size={26} />
        </span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-ink-2 shadow-sm">
          Employers
        </span>
      </div>

      {/* phone */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 110 }}
        className="absolute top-[4%] left-1/2 z-10 w-[42%] -translate-x-1/2"
      >
        <div className="rounded-[2rem] border border-line bg-surface p-2 shadow-pop">
          <div className="overflow-hidden rounded-[1.6rem] bg-bg">
            <div className="bg-linear-to-br from-brand-600 to-brand-800 px-3.5 pt-4 pb-8 text-white">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/30" />
              <p className="text-[10px] font-medium text-white/70">नमस्ते, Ramesh</p>
              <p className="text-sm font-bold">3 new matches near you</p>
            </div>
            <div className="-mt-6 space-y-2 px-2.5 pb-3">
              <div className="rounded-xl border border-line bg-surface p-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <ProgressRing value={94} size={38} stroke={4} color="var(--color-violet-500)">
                    <span className="text-[10px] font-extrabold text-ink">94%</span>
                  </ProgressRing>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-ink">Mason · G+3 building</p>
                    <p className="flex items-center gap-0.5 text-[10px] text-muted">
                      <MapPin size={10} /> Malviya Nagar · 2.3 km
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-ink">₹800/day</span>
                  <span className="rounded-md bg-brand-600 px-2 py-1 text-[10px] font-bold text-white">Apply</span>
                </div>
              </div>
              <div className="rounded-xl border border-line bg-surface p-2.5">
                <p className="text-[10px] font-semibold text-muted">Earnings · last 7 weeks</p>
                <div className="mt-2 flex h-12 items-end gap-1">
                  {bars.map((h, i) => (
                    <motion.span
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.8 + i * 0.07, duration: 0.6 }}
                      className={cn(
                        'flex-1 rounded-t-[3px]',
                        i === bars.length - 1 ? 'bg-brand-500' : 'bg-brand-200 dark:bg-brand-800',
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* floating cards */}
      <Floating className="top-[8%] left-0 hidden sm:block" delay={0.1}>
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <CalendarCheck size={18} />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Checked in</p>
            <p className="text-[11px] text-muted">8:02 AM · GPS ✓</p>
          </div>
        </div>
      </Floating>

      <Floating className="top-[10%] right-0" delay={0.25}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-500" />
          <div>
            <p className="text-[11px] font-semibold text-muted">AI job match</p>
            <p className="text-sm font-extrabold text-ink">94% fit</p>
          </div>
        </div>
      </Floating>

      <Floating className="right-[4%] bottom-[6%]" delay={0.4}>
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-saffron-50 text-saffron-600 dark:bg-saffron-500/15 dark:text-saffron-300">
            <IndianRupee size={18} />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-muted">Payment received</p>
            <p className="text-sm font-extrabold text-ink">₹4,800 · UPI</p>
          </div>
        </div>
      </Floating>

      <Floating className="bottom-[4%] left-[4%] hidden sm:block" delay={0.55}>
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-ink text-surface">
            <QrCode size={28} />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <Avatar name="Ramesh Kumar" size={20} />
              <p className="text-xs font-bold text-ink">Worker ID</p>
              <BadgeCheck size={14} className="text-brand-500" />
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted">KS-RJ-2026-004512</p>
          </div>
        </div>
      </Floating>

      <Floating className="top-[61%] left-1/2 hidden -translate-x-1/2 md:block" delay={0.7}>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-600" />
          <p className="text-[11px] font-bold text-ink">Fair wage ₹780/day</p>
        </div>
      </Floating>
    </div>
  )
}
