import { use } from 'react'
import { AuthContext } from '../session/auth-context'

export function useAuth() {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth requires AuthProvider')
  return context
}
