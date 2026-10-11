import { useState } from 'react'
import { useParams } from 'react-router'
import { motion } from 'motion/react'
import { Award, BadgeCheck, Briefcase, CircleCheck, Clock, ShieldX, Star } from 'lucide-react'
import Logo from '@/components/brand/Logo'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { workerProfile } from '@/data/workers'
import { formatDate } from '@/lib/utils'

/** Public page opened by scanning a Worker ID QR code. Replace the lookup with GET /verify/:workerId. */
export default function VerifyWorker() {
  const { workerId } = useParams()
  const [checkedAt] = useState(() => new Date())
  const found = workerId === workerProfile.workerId
  const p = workerProfile

  return (
    <div className="min-h-dvh bg-linear-to-b from-brand-50 to-bg px-4 py-8 dark:from-brand-950/40">
      <div className="mx-auto max-w-md">
        <Logo className="mx-auto w-fit" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mt-6 overflow-hidden">
            {found ? (
              <>
                <div className="flex items-center gap-2 bg-emerald-600 px-5 py-3 text-sm font-bold text-white">
                  <BadgeCheck size={18} /> Verified Karya Setu worker
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    <Avatar name={p.name} size={64} verified />
                    <div>
                      <p className="text-xl font-extrabold text-ink">{p.name}</p>
                      <p className="text-sm text-ink-2">
                        {p.primarySkill} · {p.experience} years · {p.district}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted">{p.workerId}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                    {[
                      [Star, `${p.rating}`, `${p.reviews} reviews`],
                      [Briefcase, p.jobsDone, 'jobs done'],
                      [Award, p.certificates.filter((c) => c.verified).length, 'certificates'],
                    ].map(([Icon, value, label]) => (
                      <div key={label} className="rounded-xl bg-surface-2 p-3">
                        <Icon size={16} className="mx-auto text-brand-600 dark:text-brand-300" />
                        <p className="mt-1 font-extrabold text-ink">{value}</p>
                        <p className="text-[11px] text-muted">{label}</p>
                      </div>
                    ))}
                  </div>
                  <ul className="mt-5 space-y-2 text-sm">
                    {[
                      ['Aadhaar e-KYC', true],
                      ['Mobile number', true],
                      ['Skill certificate (NSQF L3)', true],
                      ['Police verification', false],
                    ].map(([label, ok]) => (
                      <li
                        key={label}
                        className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5"
                      >
                        <span className="text-ink-2">{label}</span>
                        {ok ? (
                          <Badge tone="success" icon={CircleCheck}>
                            Verified
                          </Badge>
                        ) : (
                          <Badge tone="warning" icon={Clock}>
                            Pending
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-center text-xs text-muted">
                    Checked {formatDate(checkedAt)} · Karya Setu trust & safety
                  </p>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <ShieldX size={40} className="mx-auto text-rose-500" />
                <p className="mt-3 text-lg font-bold text-ink">ID not found</p>
                <p className="mt-1 text-sm text-ink-2">
                  <span className="font-mono">{workerId}</span> is not a valid Karya Setu Worker ID. Do not hire based
                  on this card.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
        <div className="mt-6 text-center">
          <Button variant="ghost" to="/">
            What is Karya Setu?
          </Button>
        </div>
      </div>
    </div>
  )
}
