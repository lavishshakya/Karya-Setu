import {
  BrickWall,
  Briefcase,
  ChefHat,
  Flame,
  HardHat,
  Hammer,
  LayoutGrid,
  Package,
  PaintRoller,
  Scissors,
  Shield,
  SprayCan,
  Sprout,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS = {
  Mason: BrickWall,
  Carpenter: Hammer,
  Electrician: Zap,
  Plumber: Wrench,
  Painter: PaintRoller,
  Welder: Flame,
  'Tile fitter': LayoutGrid,
  Helper: HardHat,
  'Farm worker': Sprout,
  Driver: Truck,
  Cook: ChefHat,
  Housekeeping: SprayCan,
  'Security guard': Shield,
  Tailor: Scissors,
  Loader: Package,
}

const TONES = [
  'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  'bg-saffron-50 text-saffron-600 dark:bg-saffron-500/10 dark:text-saffron-300',
  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
]

export default function CategoryIcon({ category, size = 44, className }) {
  const Icon = CATEGORY_ICONS[category] ?? Briefcase
  const keys = Object.keys(CATEGORY_ICONS)
  const tone = TONES[Math.max(0, keys.indexOf(category)) % TONES.length]
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-xl', tone, className)}
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.48} />
    </span>
  )
}
