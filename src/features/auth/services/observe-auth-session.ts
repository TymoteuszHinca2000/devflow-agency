import type { Session } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase/client'
import type { AuthState } from '../session/auth-state'

const unavailable = 'Nie udało się sprawdzić sesji. Sprawdź połączenie i spróbuj ponownie.'

/** The SDK owns tokens. Context receives only a user verified by Auth HTTP. */
export function observeAuthSession(onChange: (state: AuthState) => void): () => void {
  let active = true
  let revision = 0
  let expired = false
  let verifiedUserId: string | undefined
  let scheduled: ReturnType<typeof setTimeout> | undefined
  let deadline: ReturnType<typeof setTimeout> | undefined

  function stopTimers() {
    clearTimeout(scheduled)
    clearTimeout(deadline)
  }
  function startDeadline() {
    deadline = setTimeout(() => {
      if (!active) return
      revision++
      verifiedUserId = undefined
      onChange({ status: 'error', message: unavailable })
    }, 15_000)
  }

  try {
    const client = getSupabase()
    startDeadline()

    function rejectSession() {
      expired = true
      verifiedUserId = undefined
      stopTimers()
      revision++
      onChange({ status: 'signed-out', expired: true })
      // UI is closed immediately; an old cleanup response cannot restore it.
      void client.auth.signOut({ scope: 'local' }).catch(() => undefined)
    }

    function synchronize(session: Session | null, explicitlySignedOut: boolean) {
      if (!active) return
      stopTimers()
      const current = ++revision
      if (!session || explicitlySignedOut) {
        verifiedUserId = undefined
        onChange({ status: 'signed-out', expired })
        return
      }
      // Refreshing the same verified account must not unmount forms or move focus.
      if (session.user.id !== verifiedUserId) onChange({ status: 'loading' })
      expired = false
      startDeadline()

      // Never await another Auth call inside onAuthStateChange's SDK lock.
      scheduled = setTimeout(() => {
        void client.auth
          .getUser(session.access_token)
          .then(({ data, error }) => {
            if (!active || current !== revision) return
            if (error) {
              if (
                error.status === 401 ||
                error.status === 403 ||
                error.name === 'AuthSessionMissingError'
              ) {
                rejectSession()
                return
              }
              stopTimers()
              verifiedUserId = undefined
              onChange({ status: 'error', message: unavailable })
              return
            }
            if (!data.user || data.user.id !== session.user.id) {
              rejectSession()
              return
            }
            stopTimers()
            verifiedUserId = data.user.id
            onChange({ status: 'signed-in', user: data.user })
          })
          .catch(() => {
            if (!active || current !== revision) return
            stopTimers()
            verifiedUserId = undefined
            onChange({ status: 'error', message: unavailable })
          })
      }, 0)
    }

    const { data } = client.auth.onAuthStateChange((event, session) => {
      synchronize(session, event === 'SIGNED_OUT')
    })
    return () => {
      active = false
      revision++
      stopTimers()
      data.subscription.unsubscribe()
    }
  } catch {
    stopTimers()
    onChange({
      status: 'error',
      message: 'Logowanie jest chwilowo niedostępne. Spróbuj ponownie później.',
    })
    return () => {
      active = false
    }
  }
}
