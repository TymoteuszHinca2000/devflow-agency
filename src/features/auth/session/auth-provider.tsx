import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth-context'
import type { AuthState } from './auth-state'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    let dispose: (() => void) | undefined
    void import('../services/observe-auth-session')
      .then(({ observeAuthSession }) => {
        if (active) dispose = observeAuthSession(setState)
      })
      .catch(() => {
        if (active)
          setState({
            status: 'error',
            message: 'Logowanie jest chwilowo niedostępne. Spróbuj ponownie później.',
          })
      })
    return () => {
      active = false
      dispose?.()
    }
  }, [attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  return <AuthContext value={{ state, retry }}>{children}</AuthContext>
}
