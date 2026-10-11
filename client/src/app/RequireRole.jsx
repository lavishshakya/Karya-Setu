import { Navigate, useLocation } from 'react-router'
import { homeFor, useAuth } from '@/context/AuthContext'

/** Gate a portal by role (role-based authorisation on the client; the API must enforce it too). */
export default function RequireRole({ role, children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to={`/login?role=${role}`} replace state={{ from: location.pathname }} />
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />
  return children
}
