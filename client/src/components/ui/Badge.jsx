import {
  Ban,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleX,
  Clock,
  Eye,
  FileText,
  Flag,
  LoaderCircle,
  ShieldAlert,
  Star,
  TriangleAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tones = {
  neutral: 'bg-surface-2 text-ink-2 ring-line',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/25',
  success:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25',
  info: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25',
  ai: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/25',
  saffron:
    'bg-saffron-50 text-saffron-700 ring-saffron-200 dark:bg-saffron-500/10 dark:text-saffron-300 dark:ring-saffron-500/25',
}

export default function Badge({ tone = 'neutral', icon: Icon, dot = false, size = 'sm', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {Icon && <Icon size={size === 'sm' ? 12 : 13} strokeWidth={2.4} />}
      {children}
    </span>
  )
}

// Status → tone + icon + label. Status is never shown by colour alone.
const STATUS = {
  active: ['success', CircleDot, 'Active'],
  draft: ['neutral', FileText, 'Draft'],
  closed: ['neutral', CircleX, 'Closed'],
  applied: ['info', Clock, 'Applied'],
  viewed: ['info', Eye, 'Viewed'],
  new: ['info', CircleDot, 'New'],
  shortlisted: ['brand', Star, 'Shortlisted'],
  hired: ['success', CircleCheck, 'Hired'],
  rejected: ['danger', CircleX, 'Not selected'],
  paid: ['success', CircleCheck, 'Paid'],
  pending: ['warning', Clock, 'Pending'],
  processing: ['info', LoaderCircle, 'Processing'],
  disputed: ['danger', TriangleAlert, 'Disputed'],
  open: ['warning', CircleDashed, 'Open'],
  'in-review': ['info', Eye, 'In review'],
  investigating: ['info', Eye, 'Investigating'],
  escalated: ['danger', Flag, 'Escalated'],
  resolved: ['success', CircleCheck, 'Resolved'],
  actioned: ['success', CircleCheck, 'Actioned'],
  dismissed: ['neutral', CircleX, 'Dismissed'],
  verified: ['success', CircleCheck, 'Verified'],
  flagged: ['danger', ShieldAlert, 'Flagged'],
  suspended: ['danger', Ban, 'Suspended'],
  present: ['success', CircleCheck, 'Present'],
  half: ['warning', Clock, 'Half day'],
  absent: ['danger', CircleX, 'Absent'],
  leave: ['neutral', CircleDashed, 'On leave'],
  employed: ['success', CircleCheck, 'Employed'],
  seeking: ['warning', Clock, 'Seeking work'],
}

export function StatusBadge({ status, size, className }) {
  const [tone, icon, label] = STATUS[status] ?? ['neutral', CircleDot, status]
  return (
    <Badge tone={tone} icon={icon} size={size} className={className}>
      {label}
    </Badge>
  )
}
