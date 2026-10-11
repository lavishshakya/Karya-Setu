import { NavLink } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Building2, ChevronsLeft, ChevronsRight, HardHat, Landmark, ShieldCheck, Sparkles, X } from 'lucide-react'
import Logo from '@/components/brand/Logo'
import { useChatbot } from '@/features/ai/ChatbotWidget'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

const PORTAL_ICONS = { worker: HardHat, employer: Building2, admin: ShieldCheck, panchayat: Landmark }

function NavItem({ item, collapsed, scope, onNavigate }) {
  const { t } = useLang()
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? t(item.label) : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex h-9 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200'
            : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId={`nav-indicator-${scope}`}
              className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <item.icon
            size={19}
            className={cn(
              'shrink-0',
              isActive ? 'text-brand-600 dark:text-brand-300' : 'text-muted group-hover:text-ink-2',
            )}
          />
          {!collapsed && <span className="truncate">{t(item.label)}</span>}
          {!collapsed && item.ai && (
            <span className="rounded-md bg-violet-100 px-1.5 py-px text-[10px] font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              AI
            </span>
          )}
          {item.badge &&
            (collapsed ? (
              <span className="absolute top-2 right-3 size-2 rounded-full bg-saffron-500 ring-2 ring-surface" />
            ) : (
              <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-saffron-500 px-1.5 text-[11px] font-bold text-white">
                {item.badge}
              </span>
            ))}
        </>
      )}
    </NavLink>
  )
}

function SidebarContent({ nav, collapsed, scope, onNavigate, onClose, onToggleCollapse }) {
  const { user } = useAuth()
  const { t } = useLang()
  const chatbot = useChatbot()
  const PortalIcon = PORTAL_ICONS[user.role]

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 shrink-0 items-center gap-2 px-5', collapsed && 'justify-center px-0')}>
        <Logo compact={collapsed} to={`/${user.role}`} />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2.5 rounded-xl bg-linear-to-r from-brand-50 to-transparent px-3 py-2 dark:from-brand-500/10">
            <PortalIcon size={16} className="text-brand-600 dark:text-brand-300" />
            <span className="text-xs font-bold tracking-wide text-brand-800 uppercase dark:text-brand-200">
              {t(`portal.${user.role}`)}
            </span>
          </div>
        </div>
      )}

      <nav className="flex-1 scrollbar-thin space-y-4 overflow-y-auto px-3 py-2" aria-label="Main">
        {nav.groups.map((group) => (
          <div key={group.label}>
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-line" />
            ) : (
              <p className="mb-1.5 px-3 text-[11px] font-bold tracking-wider text-muted uppercase">{t(group.label)}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavItem item={item} collapsed={collapsed} scope={scope} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-line p-3">
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            chatbot.open()
          }}
          title={collapsed ? t('nav.askAi') : undefined}
          aria-label={collapsed ? t('nav.askAi') : undefined}
          className={cn(
            'relative flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-linear-to-r from-violet-600 to-fuchsia-500 p-2.5 text-left text-white shadow-sm shadow-violet-600/25 transition hover:brightness-110',
            collapsed && 'justify-center p-2.5',
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <Sparkles size={18} />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block text-sm font-bold">{t('nav.askAi')}</span>
              <span className="block truncate text-[11px] text-white/80">{t('nav.helpText')}</span>
            </span>
          )}
        </button>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'flex h-9 w-full items-center gap-2 rounded-xl px-3 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-ink',
              collapsed && 'justify-center px-0',
            )}
            aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
          >
            {collapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
            {!collapsed && t('nav.collapse')}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({ nav, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-surface transition-[width] duration-300 lg:block print:hidden',
          collapsed ? 'w-[84px]' : 'w-[272px]',
        )}
      >
        <SidebarContent nav={nav} collapsed={collapsed} scope="desktop" onToggleCollapse={onToggleCollapse} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="absolute inset-y-0 left-0 w-[290px] max-w-[85vw] border-r border-line bg-surface shadow-pop"
            >
              <SidebarContent
                nav={nav}
                collapsed={false}
                scope="mobile"
                onNavigate={onCloseMobile}
                onClose={onCloseMobile}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
