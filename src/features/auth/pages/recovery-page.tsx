import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '../hooks/use-auth'
import { readConfirmationCallback } from '../lib/confirmation-url'
import { getConfirmationErrorMessage } from '../lib/auth-errors'
import { openPasswordRecovery, resumePasswordRecovery } from '../services/password-service'
import type { RecoveryAccess } from '../services/password-service'
import { SessionStatus } from '../components/session-status'
const PasswordForm = lazy(async () => ({
  default: (await import('../components/password-form')).PasswordForm,
}))

export function RecoveryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useAuth()
  const [callback] = useState(() =>
    readConfirmationCallback(location.search, location.hash, 'recovery'),
  )
  const [phase, setPhase] = useState<'ready' | 'restoring' | 'pending' | 'failed' | 'form'>(
    callback.status === 'ready'
      ? 'ready'
      : !location.search && !location.hash
        ? 'restoring'
        : 'failed',
  )
  const [access, setAccess] = useState<RecoveryAccess | null>(null)
  const [message, setMessage] = useState(
    'Ten link jest nieprawidłowy, wygasł lub został już wykorzystany. Poproś o nową wiadomość.',
  )
  const heading = useRef<HTMLHeadingElement>(null)
  const userId = state.status === 'signed-in' ? state.user.id : null
  useEffect(() => {
    if (phase !== 'restoring' || state.status === 'loading' || state.status === 'error') return
    let active = true
    void (userId ? resumePasswordRecovery() : Promise.resolve(null))
      .then((value) => {
        if (!active) return
        setAccess(value)
        setPhase(value ? 'form' : 'failed')
      })
      .catch(() => {
        if (active) setPhase('failed')
      })
    return () => {
      active = false
    }
  }, [phase, state.status, userId])
  useEffect(() => {
    if ((phase === 'failed' || phase === 'form') && (location.search || location.hash))
      void navigate('/auth/recovery', { replace: true })
    if (phase === 'form') document.title = 'Ustaw nowe hasło. — DevFlow Agency'
    if (phase === 'failed') document.title = 'Sprawdź swój link. — DevFlow Agency'
    if (phase === 'form') heading.current?.focus()
  }, [phase, navigate, location.search, location.hash])
  async function complete() {
    if (phase !== 'ready' || callback.status !== 'ready' || state.status !== 'signed-out') return
    setPhase('pending')
    try {
      setAccess(await openPasswordRecovery(callback.code, callback.flowId))
      setPhase('form')
    } catch (error) {
      setMessage(getConfirmationErrorMessage(error))
      setPhase('failed')
    }
  }
  if (
    phase === 'pending' ||
    phase === 'restoring' ||
    (phase !== 'failed' && (state.status === 'loading' || state.status === 'error'))
  )
    return <SessionStatus />
  const usable =
    phase === 'form' && access && state.status === 'signed-in' && access.userId === state.user.id
  return (
    <section className="auth-card auth-centered" aria-labelledby="route-title">
      <div className="auth-card-icon">
        <KeyRound size={25} aria-hidden="true" />
      </div>
      <p className="eyebrow">BEZPIECZEŃSTWO KONTA</p>
      <h1 id="route-title" tabIndex={-1} ref={heading}>
        {usable
          ? 'Ustaw nowe hasło.'
          : phase === 'failed'
            ? 'Sprawdź swój link.'
            : state.status === 'signed-in'
              ? 'Masz aktywną sesję.'
              : 'Odzyskaj dostęp.'}
      </h1>
      {usable ? (
        <>
          <p className="auth-card-description">
            Wybierz nowe hasło do swojego konta. Możesz odświeżyć ten ekran — aktywny reset wznowimy
            przez maksymalnie 30 minut od potwierdzenia linku.
          </p>
          <Suspense fallback={<p role="status">Ładowanie formularza…</p>}>
            <PasswordForm recovery onSave={(values) => access.updatePassword(values.password)} />
          </Suspense>
          <p className="auth-secondary-link">
            <Link to="/app/account">Przejdź do swojego konta</Link>
          </p>
        </>
      ) : (
        <>
          <p className="auth-card-description" role={phase === 'failed' ? 'alert' : undefined}>
            {phase === 'failed'
              ? message
              : state.status === 'signed-in'
                ? 'Zmień hasło w swoim koncie, podając obecne hasło. Aby użyć linku dla innego konta, najpierw się wyloguj.'
                : 'Kliknij poniżej, aby sprawdzić link. Użyj przeglądarki, w której poproszono o wiadomość.'}
          </p>
          {phase === 'ready' && state.status === 'signed-out' && (
            <Button
              className="auth-submit"
              onClick={() => {
                void complete()
              }}
            >
              Kontynuuj zmianę hasła
            </Button>
          )}
          <p className="auth-secondary-link">
            <Link to={state.status === 'signed-in' ? '/app/account' : '/forgot-password'}>
              {state.status === 'signed-in' ? 'Przejdź do swojego konta' : 'Poproś o nowy link'}
            </Link>
          </p>
        </>
      )}
      <p className="auth-secondary-link">
        <Link to="/login">Wróć do logowania</Link>
      </p>
    </section>
  )
}
