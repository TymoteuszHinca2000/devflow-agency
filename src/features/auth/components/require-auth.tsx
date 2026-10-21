import { Navigate, Outlet, useLocation } from 'react-router'
import { RouteLayout } from '@/components/layout/route-layout'
import { useAuth } from '../hooks/use-auth'
import { SessionStatus } from './session-status'

export function RequireAuth() {
  const { state } = useAuth()
  const location = useLocation()
  if (state.status === 'signed-in') return <Outlet />
  if (state.status === 'signed-out') {
    const query = new URLSearchParams({
      returnTo: location.pathname + location.search + location.hash,
    })
    if (state.expired) query.set('reason', 'session-expired')
    return <Navigate to={`/login?${query}`} replace />
  }
  return (
    <RouteLayout>
      <SessionStatus />
    </RouteLayout>
  )
}
