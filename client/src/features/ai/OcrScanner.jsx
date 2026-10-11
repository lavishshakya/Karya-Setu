import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Award, CircleCheck, FileImage, RotateCcw, ScanText, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Meter } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'

// Demo extraction. Member 4: replace `extract()` with the OCR service
// (e.g. Tesseract on the server or a cloud OCR API) and return the same field list.
async function extract(name) {
  await new Promise((r) => setTimeout(r, 2400))
  return [
    { label: 'Certificate', value: 'Tile Laying Technician (NSQF Level 4)', confidence: 97 },
    { label: 'Name', value: name, confidence: 99 },
    { label: 'Certificate no.', value: 'PMKVY/RJ/2026/284511', confidence: 94 },
    { label: 'Issued by', value: 'PMKVY Training Centre, Sanganer', confidence: 91 },
    { label: 'Issue date', value: '12 Sep 2026', confidence: 88 },
  ]
}

function SampleCertificate({ name }) {
  return (
    <div className="grid size-full place-items-center bg-[#fffaf0] p-4 text-center text-[#5b3a12]">
      <div className="w-full rounded-lg border-4 border-double border-[#c8a24a] px-3 py-4">
        <Award className="mx-auto text-[#c8a24a]" size={28} />
        <p className="mt-1 font-serif text-[11px] tracking-[0.2em] uppercase">Certificate of Skill</p>
        <p className="mt-2 text-[10px]">This is to certify that</p>
        <p className="font-serif text-base font-bold">{name}</p>
        <p className="text-[10px]">has completed Tile Laying Technician · NSQF Level 4</p>
        <p className="mt-2 font-mono text-[9px] opacity-70">PMKVY/RJ/2026/284511 · 12 Sep 2026</p>
      </div>
    </div>
  )
}

export default function OcrScanner({ name, onAdd }) {
  const [preview, setPreview] = useState(null) // { url } | { sample: true }
  const [phase, setPhase] = useState('idle') // idle | scanning | done
  const [fields, setFields] = useState([])
  const inputRef = useRef(null)
  const run = useRef(0)

  useEffect(() => () => preview?.url && URL.revokeObjectURL(preview.url), [preview])

  const scan = async (nextPreview) => {
    const id = ++run.current
    setPreview(nextPreview)
    setPhase('scanning')
    const result = await extract(name)
    if (id !== run.current) return
    setFields(result)
    setPhase('done')
  }

  const onFile = (file) => {
    if (!file) return
    scan(file.type.startsWith('image/') ? { url: URL.createObjectURL(file) } : { file: file.name })
  }

  const reset = () => {
    run.current++
    setPreview(null)
    setPhase('idle')
    setFields([])
  }

  if (phase === 'idle') {
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          onFile(e.dataTransfer.files[0])
        }}
        className="flex flex-col items-center rounded-2xl border-2 border-dashed border-line-strong bg-surface-2/50 px-6 py-8 text-center"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
          <ScanText size={26} />
        </span>
        <p className="mt-3 font-bold text-ink">Scan a certificate with AI</p>
        <p className="mt-1 max-w-xs text-sm text-muted">
          Drop a photo or PDF. We read the name, certificate number and issuer for you.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button icon={Upload} onClick={() => inputRef.current?.click()}>
            Upload certificate
          </Button>
          <Button variant="outline" onClick={() => scan({ sample: true })}>
            Try a sample
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => onFile(e.target.files[0])}
        />
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface-2 sm:aspect-[3/4]">
        {preview?.url ? (
          <img src={preview.url} alt="Uploaded certificate" className="size-full object-cover" />
        ) : preview?.sample ? (
          <SampleCertificate name={name} />
        ) : (
          <div className="grid size-full place-items-center p-4 text-center text-sm text-muted">
            <div>
              <FileImage className="mx-auto mb-2" size={28} />
              {preview?.file}
            </div>
          </div>
        )}
        {phase === 'scanning' && (
          <>
            <div className="absolute inset-0 bg-violet-600/10" />
            <div className="absolute inset-x-0 h-0.5 animate-scan bg-violet-500 shadow-[0_0_16px_4px_rgb(139_92_246/0.6)]" />
          </>
        )}
      </div>

      <div className="min-w-0">
        <AnimatePresence mode="wait">
          {phase === 'scanning' ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 pt-2"
            >
              <Badge tone="ai" icon={ScanText} size="md">
                Reading text…
              </Badge>
              {[80, 65, 72, 50, 40].map((w, i) => (
                <div key={i} className="h-3 animate-pulse rounded-full bg-surface-3" style={{ width: `${w}%` }} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <Badge tone="success" icon={CircleCheck} size="md">
                5 fields extracted
              </Badge>
              <dl className="space-y-2.5">
                {fields.map((f) => (
                  <div key={f.label} className="grid grid-cols-[110px_1fr] items-center gap-3">
                    <dt className="text-xs font-semibold text-muted">{f.label}</dt>
                    <dd className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{f.value}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Meter
                          value={f.confidence}
                          tone={f.confidence > 90 ? 'success' : 'warning'}
                          height={4}
                          label={`${f.label} confidence`}
                        />
                        <span className={cn('text-[11px] font-semibold text-muted tabular')}>{f.confidence}%</span>
                      </div>
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button icon={CircleCheck} onClick={() => onAdd?.(fields)}>
                  Add to profile
                </Button>
                <Button variant="ghost" icon={RotateCcw} onClick={reset}>
                  Scan another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
