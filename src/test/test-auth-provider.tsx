import type { ReactNode } from 'react'
import { AuthContext } from '@/features/auth/session/auth-context'
import type { AuthState } from '@/features/auth/session/auth-state'
import { verifiedTestUser } from './auth-user'

export function TestAuthProvider({
  children,
  state = { status: 'signed-in', user: verifiedTestUser },
  retry = () => undefined,
}: {
  children: ReactNode
  state?: AuthState
  retry?: () => void
}) {
  return <AuthContext value={{ state, retry }}>{children}</AuthContext>
}
