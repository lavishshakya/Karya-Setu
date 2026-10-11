import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  Bell,
  Briefcase,
  CalendarCheck,
  ChevronDown,
  ClipboardCheck,
  Gavel,
  IndianRupee,
  Info,
  Landmark,
  LogOut,
  Menu,
  Repeat,
  Search,
  ShieldAlert,
  UserRound,
  UsersRound,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { usePopover } from '@/lib/usePopover'
import { LogoMark } from '@/components/brand/Logo'
import { LanguageToggle, ThemeToggle } from './Toggles'
import { profileTargets, searchTargets } from '@/app/navigation'
import { homeFor, useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { notificationsFor } from '@/data/lifecycle'
import { isMockMode } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'

const NOTIFICATION_TYPES = {
  job: [Briefcase, 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'],
  application: [ClipboardCheck, 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300'],
  payment: [IndianRupee, 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'],
  attendance: [CalendarCheck, 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'],
  scheme: [Landmark, 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300'],
  fraud: [ShieldAlert, 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'],
  dispute: [Gavel, 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'],
  user: [UsersRound, 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300'],
  system: [Info, 'bg-surface-2 text-ink-2'],
}

const iconButton =
  'relative grid size-9 place-items-center rounded-full border border-line bg-surface-2 text-ink-2 transition hover:text-ink'

const dropdownMotion = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
  transition: { duration: 0.15 },
}

function SearchBox({ className }) {
  const { user } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  // Press "/" anywhere to jump to search.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    const target = searchTargets[user.role]
    navigate(query.trim() ? `${target}?q=${encodeURIComponent(query.trim())}` : target)
    inputRef.current?.blur()
  }

  return (
    <form onSubmit={onSubmit} role="search" className={className}>
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('top.search')}
          aria-label="Search"
          className="control h-10 rounded-full border-transparent bg-surface-2 pr-10 pl-10"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-line bg-surface px-1.5 text-[11px] font-semibold text-muted lg:block">
          /
        </kbd>
      </div>
    </form>
  )
}

function NotificationsMenu() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const { open, setOpen, ref } = usePopover()
  const [items, setItems] = useState(() => notificationsFor(user.role))
  const unread = items.filter((n) => n.unread).length

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={iconButton}
        aria-label={`${t('top.notifications')}${unread ? ` (${unread})` : ''}`}
        aria-expanded={open}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-saffron-500 px-1 text-[10px] font-bold text-white ring-2 ring-surface">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            {...dropdownMotion}
            className="fixed inset-x-3 top-[4.25rem] z-50 origin-top-right overflow-hidden rounded-2xl border border-line bg-surface shadow-pop sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-bold text-ink">{t('top.notifications')}</p>
              <button
                type="button"
                disabled={!unread}
                onClick={() => setItems((list) => list.map((n) => ({ ...n, unread: false })))}
                className="text-xs font-semibold text-brand-600 hover:underline disabled:pointer-events-none disabled:opacity-40 dark:text-brand-300"
              >
                {t('top.markAllRead')}
              </button>
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">{t('top.allCaughtUp')}</p>
            ) : (
              <ul className="max-h-96 scrollbar-thin divide-y divide-line overflow-y-auto">
                {items.map((n) => {
                  const [Icon, tone] = NOTIFICATION_TYPES[n.type] ?? NOTIFICATION_TYPES.system
                  return (
                    <li
                      key={n.id}
                      className={cn('flex gap-3 px-4 py-3', n.unread && 'bg-brand-50/60 dark:bg-brand-500/5')}
                    >
                      <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', tone)}>
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-ink">{n.title}</p>
                        <p className="mt-0.5 text-xs text-muted">{timeAgo(n.at, lang)}</p>
                      </div>
                      {n.unread && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" aria-label="Unread" />
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const DEMO_ROLES = ['worker', 'employer', 'admin', 'panchayat']

function UserMenu() {
  const { user, logout, login } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const { open, setOpen, ref } = usePopover()
  const subtitle = user.company ?? user.title ?? user.skill ?? t(`role.${user.role}`)
  const profileLink = profileTargets[user.role]

  const switchRole = async (role) => {
    setOpen(false)
    await login({ role })
    navigate(homeFor(role))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full p-0.5 transition hover:bg-surface-2 sm:pr-2"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} size={34} />
        <span className="hidden text-left leading-tight xl:block">
          <span className="block max-w-36 truncate text-sm font-bold text-ink">{user.name}</span>
          <span className="block max-w-36 truncate text-xs text-muted">{subtitle}</span>
        </span>
        <ChevronDown size={16} className="hidden text-muted sm:block" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            {...dropdownMotion}
            className="absolute top-12 right-0 z-50 w-64 origin-top-right rounded-2xl border border-line bg-surface p-2 shadow-pop"
          >
            <div className="flex items-center gap-3 px-2.5 py-2">
              <Avatar name={user.name} size={40} verified={user.verified} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                <p className="truncate text-xs text-muted">{subtitle}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-line" />
            {profileLink && (
              <Link
                to={profileLink}
                onClick={() => setOpen(false)}
                className="flex h-10 items-center gap-2.5 rounded-xl px-2.5 text-sm font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink"
              >
                <UserRound size={17} />
                {t('top.profile')}
              </Link>
            )}
            {isMockMode && (
              <div className="px-2.5 pt-2 pb-1">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted uppercase">
                  <Repeat size={12} /> Demo: switch portal
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {DEMO_ROLES.filter((r) => r !== user.role).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => switchRole(role)}
                      className="h-8 rounded-lg bg-surface-2 text-xs font-semibold text-ink-2 hover:bg-surface-3 hover:text-ink"
                    >
                      {t(`role.${role}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="my-1 h-px bg-line" />
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="flex h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <LogOut size={17} />
              {t('top.logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Topbar({ onMenu }) {
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          className="-ml-1.5 rounded-xl p-2 text-ink-2 hover:bg-surface-2 hover:text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <Link to={homeFor(user.role)} className="lg:hidden" aria-label="Home">
          <LogoMark size={32} />
        </Link>
        <SearchBox className="hidden flex-1 md:block md:max-w-md" />
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <NotificationsMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
