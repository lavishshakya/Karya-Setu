import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Check, CircleCheck, Download, Lightbulb, Sparkles, Wand2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Chip, Field, Input, Switch, Textarea } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/Misc'
import { ProgressRing } from '@/components/ui/Progress'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { workerProfile } from '@/data/workers'
import { cn } from '@/lib/utils'
import { downloadResumePdf } from './resumePdf'

const TEMPLATES = [
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Classic' },
  { id: 'compact', label: 'Sidebar' },
]
const ACCENTS = ['#0b7a94', '#db620b', '#6d28d9', '#334155']

/** "AI" summary v1 — template-filled from verified profile data. Swap for an LLM call later. */
function generateSummary(p, skills) {
  const top = skills.slice(0, 3).map((s) => s.name.toLowerCase())
  const verifiedCerts = p.certificates.filter((c) => c.verified).length
  return `${p.primarySkill} with ${p.experience} years of experience on residential and commercial sites across ${p.district}. Skilled in ${top.join(', ')}. Holds ${verifiedCerts} government-recognised certificate${verifiedCerts === 1 ? '' : 's'} and has completed ${p.jobsDone} jobs on Karya Setu with a ${p.rating}/5 employer rating. Known for punctuality, safe work practices and clean finishing.`
}

function ResumePreview({ r }) {
  const accent = r.accent
  const sidebar = r.template === 'compact'
  const classic = r.template === 'classic'
  return (
    <div className="@container mx-auto w-full max-w-[620px]">
      <div className="relative aspect-[1/1.414] overflow-hidden rounded-md bg-white text-[1.75cqw] leading-snug text-slate-800 shadow-2xl ring-1 ring-black/5">
        {sidebar && <div className="absolute inset-y-0 left-0 w-[35%]" style={{ background: `${accent}14` }} />}
        {classic ? (
          <div className="px-[7cqw] pt-[7cqw] text-center">
            <p className="text-[5cqw] font-extrabold tracking-tight">{r.name}</p>
            <p className="text-[2.2cqw] font-semibold" style={{ color: accent }}>
              {r.headline}
            </p>
            <p className="mt-[0.6cqw] text-[1.6cqw] text-slate-500">{r.contact}</p>
            <div className="mt-[2.5cqw] h-[0.35cqw]" style={{ background: accent }} />
          </div>
        ) : (
          <div className="relative px-[7cqw] py-[5cqw] text-white" style={{ background: accent }}>
            <p className="text-[5cqw] font-extrabold tracking-tight">{r.name}</p>
            <p className="text-[2.2cqw] font-medium opacity-95">{r.headline}</p>
            <p className="mt-[0.6cqw] text-[1.6cqw] opacity-85">{r.contact}</p>
          </div>
        )}
        <div className="relative grid grid-cols-[35%_1fr] gap-[4cqw] px-[7cqw] pt-[4.5cqw]">
          <div className="space-y-[3cqw]">
            <section>
              <h4
                className="mb-[1.4cqw] border-b-[0.25cqw] pb-[0.5cqw] text-[1.6cqw] font-bold tracking-wider uppercase"
                style={{ color: accent, borderColor: accent }}
              >
                Skills
              </h4>
              <ul className="space-y-[1.3cqw]">
                {r.skills.map((s) => (
                  <li key={s.name}>
                    <div className="flex justify-between font-semibold">
                      <span>{s.name}</span>
                      <span className="text-slate-400">{s.level}</span>
                    </div>
                    <div className="mt-[0.5cqw] h-[0.7cqw] rounded-full bg-slate-200">
                      <div className="h-full rounded-full" style={{ width: `${s.level}%`, background: accent }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            {r.certificates.length > 0 && (
              <section>
                <h4
                  className="mb-[1.4cqw] border-b-[0.25cqw] pb-[0.5cqw] text-[1.6cqw] font-bold tracking-wider uppercase"
                  style={{ color: accent, borderColor: accent }}
                >
                  Certificates
                </h4>
                <ul className="space-y-[1.4cqw]">
                  {r.certificates.map((c) => (
                    <li key={c.id}>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-[1.5cqw] text-slate-500">{c.issuer}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h4
                className="mb-[1.4cqw] border-b-[0.25cqw] pb-[0.5cqw] text-[1.6cqw] font-bold tracking-wider uppercase"
                style={{ color: accent, borderColor: accent }}
              >
                Languages
              </h4>
              <p>{r.languages}</p>
            </section>
          </div>
          <div className="space-y-[3cqw]">
            <section>
              <h4
                className="mb-[1.4cqw] border-b-[0.25cqw] pb-[0.5cqw] text-[1.6cqw] font-bold tracking-wider uppercase"
                style={{ color: accent, borderColor: accent }}
              >
                Profile
              </h4>
              <p className="text-slate-600">{r.summary}</p>
            </section>
            <section>
              <h4
                className="mb-[1.4cqw] border-b-[0.25cqw] pb-[0.5cqw] text-[1.6cqw] font-bold tracking-wider uppercase"
                style={{ color: accent, borderColor: accent }}
              >
                Work experience
              </h4>
              <ul className="space-y-[2cqw]">
                {r.history.map((h) => (
                  <li key={h.id}>
                    <div className="flex items-baseline justify-between gap-[1cqw]">
                      <p className="text-[2cqw] font-bold">{h.role}</p>
                      <p className="shrink-0 text-[1.45cqw] text-slate-400">
                        {h.from} – {h.to}
                      </p>
                    </div>
                    <p className="font-medium" style={{ color: accent }}>
                      {h.employer} · {h.place}
                    </p>
                    <p className="mt-[0.4cqw] text-slate-600">{h.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
        <div className="absolute inset-x-[7cqw] bottom-[4cqw] flex items-center justify-between border-t border-slate-200 pt-[1.5cqw] text-[1.45cqw] text-slate-400">
          <span>Verified on Karya Setu · {r.workerId}</span>
          <span
            className="rounded px-[1cqw] py-[0.3cqw] font-semibold"
            style={{ color: accent, background: `${accent}14` }}
          >
            QR on PDF
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ResumeBuilder() {
  const { user } = useAuth()
  const toast = useToast()
  const p = workerProfile
  const [template, setTemplate] = useState('modern')
  const [accent, setAccent] = useState(ACCENTS[0])
  const [headline, setHeadline] = useState(`${p.primarySkill} · ${p.experience} years experience · ${p.district}`)
  const [summary, setSummary] = useState(p.about)
  const [skillNames, setSkillNames] = useState(() => p.skills.map((s) => s.name))
  const [historyIds, setHistoryIds] = useState(() => p.history.map((h) => h.id))
  const [certIds, setCertIds] = useState(() => p.certificates.filter((c) => c.verified).map((c) => c.id))
  const [showPhone, setShowPhone] = useState(true)
  const [writing, setWriting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const qrCanvas = useRef(null)
  const typer = useRef(null)

  useEffect(() => () => clearInterval(typer.current), [])

  const verifyUrl = `${window.location.origin}/verify/${p.workerId}`
  const resume = useMemo(
    () => ({
      template,
      accent,
      name: user.name,
      headline,
      contact: [showPhone && p.phone, p.email, `${p.area}, ${p.district}`].filter(Boolean).join('  ·  '),
      summary,
      skills: p.skills.filter((s) => skillNames.includes(s.name)),
      history: p.history.filter((h) => historyIds.includes(h.id)),
      certificates: p.certificates.filter((c) => certIds.includes(c.id)),
      languages: p.languages.join(', '),
      workerId: p.workerId,
      verifyUrl,
    }),
    [template, accent, user.name, headline, showPhone, p, summary, skillNames, historyIds, certIds, verifyUrl],
  )

  const score = Math.min(
    100,
    50 +
      (summary.length > 220 ? 12 : 4) +
      Math.min(resume.skills.length * 4, 16) +
      Math.min(resume.certificates.length * 6, 12) +
      (resume.history.length >= 2 ? 6 : 0) +
      (showPhone ? 4 : 0),
  )
  const tips = [
    summary.length <= 220 && 'Write a longer profile summary (try the AI writer).',
    resume.certificates.length < 2 && 'Add verified certificates; they double employer trust.',
    resume.skills.length < 3 && 'List at least three skills with levels.',
    !showPhone && 'Show your phone number so employers can call you.',
    resume.history.length < 2 && 'Include at least two past jobs.',
  ].filter(Boolean)

  const toggle = (setter) => (value) =>
    setter((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]))

  const writeWithAi = () => {
    const full = generateSummary(p, resume.skills.length ? resume.skills : p.skills)
    clearInterval(typer.current)
    setWriting(true)
    let i = 0
    typer.current = setInterval(() => {
      i += 4
      setSummary(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(typer.current)
        setWriting(false)
      }
    }, 16)
  }

  const download = async () => {
    setDownloading(true)
    try {
      await downloadResumePdf(resume, qrCanvas.current?.toDataURL('image/png'))
      toast({ title: 'Resume downloaded', description: 'Share the PDF on WhatsApp or print it.' })
    } catch {
      toast({ tone: 'error', title: 'Could not create the PDF', description: 'Please try again.' })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="AI tools"
        title="Resume builder"
        description="Built from your verified profile. Edit anything, pick a style, and download a PDF with your QR verification."
        actions={
          <Button icon={Download} loading={downloading} onClick={download}>
            Download PDF
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card className="p-5">
            <CardHeader title="Style" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  aria-pressed={template === t.id}
                  className={cn(
                    'rounded-xl border-2 p-2 text-xs font-bold transition',
                    template === t.id ? 'border-brand-500 text-ink' : 'border-line text-muted hover:border-line-strong',
                  )}
                >
                  <span className="mb-1.5 block aspect-[1/1.3] overflow-hidden rounded-md bg-white ring-1 ring-black/5">
                    {t.id === 'classic' ? (
                      <span className="mx-auto mt-2 block h-1.5 w-1/2 rounded" style={{ background: accent }} />
                    ) : (
                      <span className="block h-1/4" style={{ background: accent }} />
                    )}
                    {t.id === 'compact' && (
                      <span className="mt-0 block h-3/4 w-1/3" style={{ background: `${accent}22` }} />
                    )}
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-semibold text-ink">Colour</span>
              {ACCENTS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setAccent(hex)}
                  className={cn(
                    'grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-surface transition',
                    accent === hex && 'ring-2 ring-ink',
                  )}
                  style={{ background: hex }}
                  aria-label={`Accent ${hex}`}
                  aria-pressed={accent === hex}
                >
                  {accent === hex && <Check size={15} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <Field label="Headline">
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
            </Field>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Profile summary</span>
                <Button variant="ai" size="xs" icon={Wand2} loading={writing} onClick={writeWithAi}>
                  Write with AI
                </Button>
              </div>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={6}
                aria-label="Profile summary"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Skills</p>
              <div className="flex flex-wrap gap-2">
                {p.skills.map((s) => (
                  <Chip key={s.name} active={skillNames.includes(s.name)} onClick={() => toggle(setSkillNames)(s.name)}>
                    {s.name}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Experience</p>
              <div className="space-y-1.5">
                {p.history.map((h) => (
                  <label key={h.id} className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={historyIds.includes(h.id)}
                      onChange={() => toggle(setHistoryIds)(h.id)}
                      className="size-4 accent-brand-600"
                    />
                    <span className="font-semibold text-ink">{h.role}</span>
                    <span className="truncate text-muted">· {h.employer}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Certificates</p>
              <div className="space-y-1.5">
                {p.certificates.map((c) => (
                  <label key={c.id} className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={certIds.includes(c.id)}
                      onChange={() => toggle(setCertIds)(c.id)}
                      className="size-4 accent-brand-600"
                    />
                    <span className="truncate font-semibold text-ink">{c.name}</span>
                    {c.verified && (
                      <CircleCheck size={15} className="shrink-0 text-emerald-600" aria-label="Verified" />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <Switch checked={showPhone} onChange={setShowPhone} label="Show phone number" />
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={score} size={72} stroke={7} color="var(--color-violet-500)">
                <span className="text-lg font-extrabold text-ink">{score}</span>
              </ProgressRing>
              <div>
                <p className="flex items-center gap-1.5 font-bold text-ink">
                  <Sparkles size={16} className="text-violet-500" /> Resume strength
                </p>
                <p className="text-sm text-muted">
                  {score >= 85 ? 'Ready to impress employers.' : 'A few tweaks will make it stronger.'}
                </p>
              </div>
            </div>
            {tips.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-ink-2">
                    <Lightbulb size={16} className="mt-0.5 shrink-0 text-saffron-500" /> {tip}
                  </li>
                ))}
              </ul>
            ) : (
              <Badge tone="success" icon={CircleCheck} size="md" className="mt-4">
                All recommendations done
              </Badge>
            )}
          </Card>
        </div>

        <div className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <ResumePreview r={resume} />
        </div>
      </div>
      <QRCodeCanvas ref={qrCanvas} value={verifyUrl} size={360} level="M" marginSize={2} className="hidden" />
    </>
  )
}
