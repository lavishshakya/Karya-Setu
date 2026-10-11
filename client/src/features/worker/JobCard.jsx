import { BadgeCheck, CircleCheck, Clock, MapPin, ShieldAlert, Users, Zap } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { ProgressRing } from '@/components/ui/Progress'
import { useLang } from '@/context/LanguageContext'
import { cn, formatINR, timeAgo } from '@/lib/utils'

/** Job card used across the worker portal. `match` = { score, distance, reasons, fraud } from the recommender. */
export default function JobCard({ job, match, applied, onApply, onOpen, className }) {
  const { t, lang } = useLang()
  const fraud = match?.fraud
  const flagged = fraud?.level === 'high'
  const caution = fraud?.level === 'medium'

  return (
    <Card
      interactive
      className={cn('flex flex-col p-4 sm:p-5', flagged && 'border-rose-200 dark:border-rose-500/30', className)}
    >
      <div className="flex items-start gap-3">
        <CategoryIcon category={job.category} size={46} />
        <div className="min-w-0 flex-1">
          {(job.urgent || flagged) && (
            <div className="mb-1 flex flex-wrap gap-1.5">
              {flagged ? (
                <Badge tone="danger" icon={ShieldAlert}>
                  {t('job.flagged')}
                </Badge>
              ) : (
                <Badge tone="saffron" icon={Zap}>
                  {t('job.urgent')}
                </Badge>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="line-clamp-2 text-left leading-snug font-bold text-ink hover:text-brand-700 dark:hover:text-brand-300"
          >
            {job.title}
          </button>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-2">
            <span className="truncate">{job.employer.name}</span>
            {job.employer.verified && (
              <BadgeCheck size={15} className="shrink-0 text-brand-500" aria-label="Verified employer" />
            )}
          </p>
        </div>
        {match && !flagged && (
          <ProgressRing
            value={match.score}
            size={50}
            stroke={5}
            color="var(--color-violet-500)"
            track="var(--surface-2)"
          >
            <span className="text-[11px] leading-none font-extrabold text-ink">
              {match.score}
              <span className="text-[9px]">%</span>
            </span>
          </ProgressRing>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-ink-2">
        <span className="flex items-center gap-1.5">
          <MapPin size={15} className="text-muted" />
          {job.area}
          {match && ` · ${match.distance.toFixed(1)} km`}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={15} className="text-muted" />
          {job.duration}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={15} className="text-muted" />
          {t('job.open', { n: job.workersNeeded - job.hired })}
        </span>
      </div>

      {(flagged || caution) && (
        <div
          className={cn(
            'mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs',
            flagged
              ? 'bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200'
              : 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200',
          )}
        >
          <ShieldAlert size={15} className="mt-px shrink-0" />
          <span>
            <b>{flagged ? t('job.fraudHigh') : t('job.fraudMedium')}</b> {fraud.reasons[0]}. {t('job.neverPay')}
          </span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <p>
          <span className="text-xl font-extrabold tracking-tight text-ink">{formatINR(job.wage)}</span>
          <span className="text-sm text-muted">{t('job.perDay')}</span>
          <span className="ml-2 text-xs text-muted">{timeAgo(job.postedAt, lang)}</span>
        </p>
        {flagged ? (
          <Button size="sm" variant="danger-soft" icon={ShieldAlert} onClick={onOpen}>
            {t('job.details')}
          </Button>
        ) : (
          <Button
            size="sm"
            variant={applied ? 'secondary' : 'primary'}
            icon={applied ? CircleCheck : undefined}
            disabled={applied}
            onClick={onApply}
          >
            {applied ? t('common.applied') : t('common.apply')}
          </Button>
        )}
      </div>
    </Card>
  )
}
