import { createContext } from 'react'
import type { AuthState } from './auth-state'

export const AuthContext = createContext<{
  state: AuthState
  retry: () => void
} | null>(null)
