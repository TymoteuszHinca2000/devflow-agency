import { useEffect, useRef, useState } from 'react'
import { MailCheck } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '../hooks/use-auth'
import { readConfirmationCallback } from '../lib/confirmation-url'
import type { ConfirmationCallback } from '../lib/confirmation-url'
import { exchangeConfirmationCode } from '../services/registration-service'
import { getConfirmationErrorMessage } from '../lib/auth-errors'
import { SessionStatus } from '../components/session-status'

type CallbackState =
  | ConfirmationCallback
  | { status: 'pending' | 'exchanged'; returnTo: string }
  | { status: 'failed'; returnTo: string; message: string }

export function ConfirmEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useAuth()
  const feedback = useRef<HTMLParagraphElement>(null)
  const [callback, setCallback] = useState<CallbackState>(() =>
    readConfirmationCallback(location.search, location.hash),
  )
  const returnTo = callback.returnTo
  // Keep an unconsumed code reloadable. After the attempt, navigation removes it.
  // Invalid callbacks are cleaned immediately; no-referrer prevents URL disclosure.
  useEffect(() => {
    if (
      callback.status === 'ready' ||
      callback.status === 'pending' ||
      callback.status === 'exchanged'
    )
      return
    void navigate(`/auth/confirm?${new URLSearchParams({ returnTo })}`, { replace: true })
  }, [callback.status, navigate, returnTo])

  useEffect(() => {
    if (callback.status !== 'failed') return
    document.title = 'Sprawdź swój link. — DevFlow Agency'
    feedback.current?.focus()
  }, [callback.status])

  async function complete() {
    if (callback.status !== 'ready' || state.status !== 'signed-out') return
    const { code, flowId } = callback
    setCallback({ status: 'pending', returnTo })
    try {
      await exchangeConfirmationCode(code, flowId)
      setCallback({ status: 'exchanged', returnTo })
    } catch (error) {
      setCallback({ status: 'failed', returnTo, message: getConfirmationErrorMessage(error) })
    }
  }

  if (callback.status === 'exchanged')
    return (
      <Navigate
        to={
          state.status === 'signed-in'
            ? returnTo
            : `/login?${new URLSearchParams({ returnTo, notice: 'confirmation-complete' })}`
        }
        replace
      />
    )
  const invalid = callback.status === 'invalid' || callback.status === 'failed'
  if (
    !invalid &&
    (state.status === 'loading' || state.status === 'error' || callback.status === 'pending')
  )
    return <SessionStatus />
  const alreadySignedIn = state.status === 'signed-in'
  return (
    <section className="auth-card auth-centered" aria-labelledby="route-title">
      <div className="auth-card-icon">
        <MailCheck size={25} aria-hidden="true" />
      </div>
      <p className="eyebrow">TWOJE KONTO</p>
      <h1 id="route-title">
        {invalid
          ? 'Sprawdź swój link.'
          : alreadySignedIn
            ? 'Masz aktywną sesję.'
            : 'Dokończ logowanie.'}
      </h1>
      <p
        className="auth-card-description"
        role={invalid ? 'alert' : undefined}
        tabIndex={invalid ? -1 : undefined}
        ref={feedback}
      >
        {invalid
          ? callback.status === 'failed'
            ? callback.message
            : 'Ten link jest nieprawidłowy, wygasł lub został już wykorzystany. Spróbuj zalogować się hasłem albo poproś o nową wiadomość.'
          : alreadySignedIn
            ? 'Kontynuuj pracę na zalogowanym koncie. Aby użyć linku dla innego konta, najpierw się wyloguj.'
            : 'Kontynuuj, aby sprawdzić link i bezpiecznie otworzyć swoją przestrzeń.'}
      </p>
      {!invalid && !alreadySignedIn && (
        <Button
          className="auth-submit"
          onClick={() => {
            void complete()
          }}
        >
          Dokończ logowanie
        </Button>
      )}
      {alreadySignedIn && (
        <p className="auth-secondary-link">
          <Link to={returnTo}>Przejdź do aplikacji</Link>
        </p>
      )}
      {invalid && (
        <p className="auth-secondary-link">
          <Link to={`/check-email?${new URLSearchParams({ returnTo })}`}>Poproś o nowy link</Link>
        </p>
      )}
      <p className="auth-secondary-link">
        <Link to={`/login?${new URLSearchParams({ returnTo })}`}>Wróć do logowania</Link>
      </p>
    </section>
  )
}
