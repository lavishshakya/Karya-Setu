import { MotionConfig } from 'motion/react'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'

export default function Providers({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </MotionConfig>
  )
}
