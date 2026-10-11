import { BadgeCheck } from 'lucide-react'
import { cn, hashString, initials } from '@/lib/utils'

const GRADIENTS = [
  'from-brand-400 to-brand-700',
  'from-saffron-300 to-saffron-600',
  'from-violet-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-sky-400 to-blue-600',
  'from-pink-400 to-rose-600',
  'from-amber-300 to-orange-500',
  'from-lime-400 to-green-600',
]

export default function Avatar({ name = '', size = 40, online, verified = false, className }) {
  const gradient = GRADIENTS[hashString(name) % GRADIENTS.length]
  return (
    <span className={cn('relative inline-block shrink-0', className)} style={{ width: size, height: size }}>
      <span
        className={cn(
          'grid size-full place-items-center rounded-full bg-linear-to-br font-bold text-white select-none',
          gradient,
        )}
        style={{ fontSize: Math.max(10, size * 0.36) }}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
      {online !== undefined && (
        <span
          className={cn(
            'absolute right-0 bottom-0 rounded-full ring-2 ring-surface',
            online ? 'bg-emerald-500' : 'bg-slate-400',
          )}
          style={{ width: Math.max(8, size * 0.24), height: Math.max(8, size * 0.24) }}
        />
      )}
      {verified && (
        <BadgeCheck
          className="absolute -right-1 -bottom-1 rounded-full bg-surface fill-brand-500 text-white"
          size={Math.max(14, size * 0.38)}
          aria-label="Verified"
        />
      )}
    </span>
  )
}
