import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight, Building2, Eye, EyeOff, HardHat, Landmark, Lock, Phone, ShieldCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import Tabs from '@/components/ui/Tabs'
import { homeFor, useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { isMockMode } from '@/lib/api'

const ROLE_OPTIONS = [
  { value: 'worker', icon: HardHat },
  { value: 'employer', icon: Building2 },
  { value: 'admin', icon: ShieldCheck },
  { value: 'panchayat', icon: Landmark },
]

export default function Login() {
  const { t } = useLang()
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const initialRole = ROLE_OPTIONS.some((r) => r.value === params.get('role')) ? params.get('role') : 'worker'

  const [role, setRole] = useState(initialRole)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  const enter = async (asRole, creds = {}) => {
    setError('')
    setLoading(asRole)
    try {
      const user = await login({ role: asRole, ...creds })
      toast({ title: `Welcome, ${user.name.split(' ')[0]}!`, description: t(`portal.${user.role}`) })
      const from = location.state?.from
      navigate(from?.startsWith(homeFor(user.role)) ? from : homeFor(user.role), { replace: true })
    } catch (err) {
      setError(err.message || 'Could not log in. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!isMockMode && (!identifier || !password)) {
      setError('Enter your phone number or email and password.')
      return
    }
    enter(role, { identifier, password })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{t('auth.welcome')}</h1>
      <p className="mt-1.5 text-ink-2">{t('auth.loginSub')}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">{t('auth.iam')}</p>
          <Tabs
            fullWidth
            value={role}
            onChange={setRole}
            tabs={ROLE_OPTIONS.map((r) => ({ value: r.value, label: t(`role.${r.value}`), icon: r.icon }))}
            className="[&_button]:px-1.5 [&_button]:text-[13px]"
          />
        </div>
        <Field label={t('auth.identifier')}>
          <Input
            icon={Phone}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="98290 41212"
            autoComplete="username"
            inputMode="email"
          />
        </Field>
        <Field label={t('auth.password')}>
          <Input
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="grid size-8 place-items-center rounded-lg text-muted hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-2">
            <input type="checkbox" defaultChecked className="size-4 rounded accent-brand-600" /> Remember me
          </label>
          <button type="button" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">
            {t('auth.forgot')}
          </button>
        </div>
        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading === role} iconRight={ArrowRight}>
          {t('auth.login')}
        </Button>
      </form>

      {isMockMode && (
        <div className="mt-8">
          <div className="flex items-center gap-3 text-xs font-semibold text-muted">
            <span className="h-px flex-1 bg-line" />
            {t('auth.demo')}
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => enter(r.value)}
                disabled={loading !== null}
                className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/50 disabled:opacity-60 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-surface-2 text-ink-2 transition group-hover:bg-brand-100 group-hover:text-brand-700 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-300">
                  <r.icon size={18} />
                </span>
                <span className="text-sm font-semibold text-ink">{t(`role.${r.value}`)}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted">{t('auth.demoHint')}</p>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-ink-2">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-bold text-brand-700 hover:underline dark:text-brand-300">
          {t('auth.create')}
        </Link>
      </p>
    </motion.div>
  )
}
