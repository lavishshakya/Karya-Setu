import { useId } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

/** The bridge mark: a suspension arc over a deck, with a saffron sun at its crown. */
export function LogoMark({ size = 36, className }) {
  const gradientId = `ks-logo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={cn('shrink-0', className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2bb3cc" />
          <stop offset="1" stopColor="#0e6278" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gradientId})`} />
      <circle cx="20" cy="11" r="3.4" fill="#f8983a" />
      <path d="M7 27 Q20 8 33 27" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 19.6V27M20 17.6V27M26 19.6V27" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".85" />
      <path d="M5 27H35" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function Logo({ compact = false, inverted = false, to = '/', size = 36, className }) {
  return (
    <Link to={to} className={cn('flex items-center gap-2.5 rounded-xl', className)} aria-label="Karya Setu home">
      <LogoMark size={size} />
      {!compact && (
        <span className="leading-none">
          <span className={cn('block text-[17px] font-extrabold tracking-tight', inverted ? 'text-white' : 'text-ink')}>
            Karya Setu
          </span>
          <span className={cn('mt-0.5 block text-[11px] font-semibold', inverted ? 'text-white/70' : 'text-muted')}>
            कार्य सेतु
          </span>
        </span>
      )}
    </Link>
  )
}
