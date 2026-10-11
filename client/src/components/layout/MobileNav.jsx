import { NavLink } from 'react-router'
import { Menu } from 'lucide-react'
import { allItems } from '@/app/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

/** Phone bottom bar: four pinned destinations + a Menu button that opens the full drawer. */
export default function MobileNav({ nav, onMenu }) {
  const { user } = useAuth()
  const { t } = useLang()
  const items = nav.mobile.map((to) => allItems(user.role).find((i) => i.to === to))

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden print:hidden"
    >
      <ul
        className="mx-auto grid max-w-lg"
        style={{ gridTemplateColumns: `repeat(${items.length + 1}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-semibold transition-colors',
                  isActive ? 'text-brand-700 dark:text-brand-300' : 'text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-8 w-14 place-items-center rounded-full transition-colors',
                      isActive && 'bg-brand-50 dark:bg-brand-500/15',
                    )}
                  >
                    <item.icon size={20} />
                  </span>
                  <span className="max-w-full truncate px-1">{t(item.label)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={onMenu}
            className="flex w-full flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-semibold text-muted"
          >
            <span className="grid h-8 w-14 place-items-center">
              <Menu size={20} />
            </span>
            {t('nav.menu')}
          </button>
        </li>
      </ul>
    </nav>
  )
}
