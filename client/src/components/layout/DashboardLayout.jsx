import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { motion } from 'motion/react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import { PageLoader } from '@/components/ui/Misc'
import ChatbotWidget, { ChatbotProvider } from '@/features/ai/ChatbotWidget'
import { navigation } from '@/app/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

function readCollapsed() {
  try {
    return localStorage.getItem('ks_sidebar') === 'collapsed'
  } catch {
    return false
  }
}

export default function DashboardLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const nav = navigation[user.role]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem('ks_sidebar', next ? 'collapsed' : 'open')
    } catch {
      // ignore
    }
  }

  return (
    <ChatbotProvider>
      <div className="min-h-dvh">
        <Sidebar
          nav={nav}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className={cn('transition-[padding] duration-300', collapsed ? 'lg:pl-[84px]' : 'lg:pl-[272px]')}>
          <Topbar onMenu={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pb-12 print:p-0">
            <Suspense fallback={<PageLoader />}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </Suspense>
          </main>
        </div>
        <MobileNav nav={nav} onMenu={() => setMobileOpen(true)} />
        <ChatbotWidget />
      </div>
    </ChatbotProvider>
  )
}
