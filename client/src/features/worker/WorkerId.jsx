import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import {
  BadgeCheck,
  Building2,
  CircleCheck,
  Clock,
  Download,
  Printer,
  RotateCw,
  ScanLine,
  Share2,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { LogoMark } from '@/components/brand/Logo'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/Misc'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { workerProfile } from '@/data/workers'
import { cn, downloadUrl, formatDate } from '@/lib/utils'

function CardFront({ name, className }) {
  const p = workerProfile
  return (
    <div
      className={cn(
        'relative size-full overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 p-5 text-white shadow-2xl sm:p-6',
        className,
      )}
    >
      <svg viewBox="0 0 200 200" className="absolute -right-16 -bottom-20 size-72 opacity-15" aria-hidden="true">
        {[20, 35, 50, 65, 80, 95].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="white" strokeWidth="0.8" />
        ))}
      </svg>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-saffron-400 via-white/80 to-emerald-400" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center gap-2.5">
          <span className="rounded-xl bg-white p-1">
            <LogoMark size={28} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold">Karya Setu</p>
            <p className="text-[10px] font-semibold text-white/70">श्रमिक पहचान पत्र · Worker ID</p>
          </div>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-bold text-emerald-200 ring-1 ring-emerald-300/40">
            <BadgeCheck size={12} /> VERIFIED
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3 sm:mt-5">
          <span
            aria-hidden="true"
            className="grid h-8 w-11 grid-cols-3 gap-px overflow-hidden rounded-md bg-amber-600/40 p-px shadow-inner ring-1 ring-amber-700/30"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="bg-linear-to-br from-amber-200 to-amber-400" />
            ))}
          </span>
          <div className="flex flex-wrap gap-1">
            {p.skills.slice(0, 3).map((s) => (
              <span key={s.name} className="rounded-full bg-white/12 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-white/15">
                {s.name}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-auto flex items-end gap-4">
          <Avatar name={name} size={72} className="rounded-2xl ring-4 ring-white/20" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-extrabold">{name}</p>
            <p className="text-sm text-white/80">
              {p.primarySkill} · {p.experience} yrs · {p.district}
            </p>
            <p className="mt-2 font-mono text-sm tracking-wider">{p.workerId}</p>
          </div>
          <div className="rounded-lg bg-white p-1.5">
            <QRCodeSVG value={`${window.location.origin}/verify/${p.workerId}`} size={56} level="M" marginSize={0} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CardBack({ verifyUrl, className }) {
  const p = workerProfile
  return (
    <div
      className={cn(
        'relative size-full overflow-hidden rounded-3xl border border-line bg-surface p-5 text-ink shadow-2xl sm:p-6',
        className,
      )}
    >
      <div className="flex h-full gap-5">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-2xl bg-white p-2.5 ring-1 ring-line">
            <QRCodeSVG
              value={verifyUrl}
              size={132}
              level="H"
              marginSize={0}
              imageSettings={{ src: '/favicon.svg', height: 28, width: 28, excavate: true }}
            />
          </div>
          <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-brand-700 dark:text-brand-300">
            <ScanLine size={13} /> Scan to verify
          </p>
        </div>
        <dl className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 text-xs">
          {[
            ['Date of birth', formatDate(p.dob)],
            ['Blood group', p.bloodGroup],
            ['Emergency', p.emergencyContact],
            ['Issued', `${formatDate(p.joined, { month: 'short', year: 'numeric' })} · valid 5 yrs`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10px] font-semibold tracking-wider text-muted uppercase">{label}</dt>
              <dd className="truncate font-semibold">{value}</dd>
            </div>
          ))}
          <p className="mt-1 text-[10px] text-muted">If found, please return to the nearest gram panchayat office.</p>
        </dl>
      </div>
    </div>
  )
}

export default function WorkerId() {
  const { user } = useAuth()
  const toast = useToast()
  const [flipped, setFlipped] = useState(false)
  const qrCanvas = useRef(null)
  const verifyUrl = `${window.location.origin}/verify/${workerProfile.workerId}`

  const downloadQr = () => {
    downloadUrl(qrCanvas.current.toDataURL('image/png'), `${workerProfile.workerId}-qr.png`)
    toast({ title: 'QR code downloaded', description: 'Print it or share it on WhatsApp.' })
  }

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `${user.name} · Karya Setu Worker ID`, url: verifyUrl })
      else {
        await navigator.clipboard.writeText(verifyUrl)
        toast({ title: 'Verification link copied', description: verifyUrl })
      }
    } catch {
      // share sheet dismissed
    }
  }

  return (
    <>
      <PageHeader
        title="Worker ID"
        description="Your QR identity card. Employers scan it to instantly verify your identity, skills and ratings."
        actions={
          <>
            <Button variant="outline" icon={Share2} onClick={share}>
              Share
            </Button>
            <Button variant="outline" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <Button icon={Download} onClick={downloadQr}>
              Download QR
            </Button>
          </>
        }
      />

      {/* Print layout: both faces, flat. */}
      <div className="hidden gap-6 print:flex print:flex-col">
        <div className="aspect-[1.586] w-[86mm]">
          <CardFront name={user.name} className="shadow-none" />
        </div>
        <div className="aspect-[1.586] w-[86mm]">
          <CardBack verifyUrl={verifyUrl} className="shadow-none" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] print:hidden">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[480px] [perspective:1800px]">
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 70, damping: 14 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative aspect-[1.586] w-full cursor-pointer"
              onClick={() => setFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              aria-label="Flip card"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setFlipped((f) => !f)}
            >
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <CardFront name={user.name} />
              </div>
              <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <CardBack verifyUrl={verifyUrl} />
              </div>
            </motion.div>
          </div>
          <Button variant="ghost" icon={RotateCw} className="mt-5" onClick={() => setFlipped((f) => !f)}>
            {flipped ? 'Show front' : 'Show back'}
          </Button>
          <QRCodeCanvas ref={qrCanvas} value={verifyUrl} size={720} level="H" marginSize={4} className="hidden" />
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <CardHeader title="How employers verify you" />
            <ol className="mt-4 space-y-4">
              {[
                [Smartphone, 'Scan with any phone camera', 'No app needed. The QR opens your verified profile.'],
                [ShieldCheck, 'See what Karya Setu has checked', 'Aadhaar e-KYC, skill certificates and work history.'],
                [Building2, 'Hire with confidence', 'Ratings from past employers are shown with every job.'],
              ].map(([Icon, title, body], i) => (
                <li key={title} className="flex gap-3.5">
                  <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <Icon size={19} />
                    <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-surface">
                      {i + 1}
                    </span>
                  </span>
                  <div>
                    <p className="font-bold text-ink">{title}</p>
                    <p className="text-sm text-ink-2">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="p-5">
            <CardHeader title="What your QR shows" subtitle="Personal details like your address are never shown" />
            <div className="mt-4 flex flex-wrap gap-2">
              {['Name & photo', 'Primary skill', 'Aadhaar verified', 'Certificates', 'Rating 4.8', '38 jobs done'].map(
                (item) => (
                  <Badge key={item} tone="success" icon={CircleCheck} size="md">
                    {item}
                  </Badge>
                ),
              )}
              <Badge tone="warning" icon={Clock} size="md">
                Police verification pending
              </Badge>
            </div>
            <p className="mt-4 rounded-xl bg-surface-2 p-3 text-sm text-ink-2">
              Scanned <b className="text-ink">14 times</b> this month by employers in Jaipur.
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
