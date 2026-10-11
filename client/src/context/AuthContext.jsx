import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_STORAGE_KEY, api, isMockMode } from '@/lib/api'
import { sleep } from '@/lib/utils'
import { demoUsers } from '@/data/users'

const AuthContext = createContext(null)

export const homeFor = (role) => `/${role}`

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  useEffect(() => {
    try {
      if (session) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      else localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // Private mode / blocked storage: the session simply won't survive a reload.
    }
  }, [session])

  // POST /auth/login → { token, user } once the backend is connected.
  const login = useCallback(async ({ role, identifier, password }) => {
    if (isMockMode) {
      await sleep(450)
      const user = { ...demoUsers[role] }
      setSession({ token: 'demo-token', user })
      return user
    }
    const { token, user } = await api('/auth/login', { method: 'POST', body: { identifier, password, role } })
    setSession({ token, user })
    return user
  }, [])

  // POST /auth/register → { token, user }
  const register = useCallback(async (payload) => {
    if (isMockMode) {
      await sleep(600)
      const base = demoUsers[payload.role]
      const user = { ...base, ...Object.fromEntries(Object.entries(payload).filter(([, v]) => v)) }
      setSession({ token: 'demo-token', user })
      return user
    }
    const { token, user } = await api('/auth/register', { method: 'POST', body: payload })
    setSession({ token, user })
    return user
  }, [])

  const logout = useCallback(() => setSession(null), [])

  const updateUser = useCallback((patch) => {
    setSession((current) => current && { ...current, user: { ...current.user, ...patch } })
  }, [])

  const value = useMemo(
    () => ({ user: session?.user ?? null, login, register, logout, updateUser }),
    [session, login, register, logout, updateUser],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  return useContext(AuthContext)
}
