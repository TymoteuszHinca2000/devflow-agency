import { Fingerprint } from 'lucide-react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { useAuth } from '../hooks/use-auth'
import { getSafeReturnTo } from '../lib/return-to'
import { lazy, Suspense } from 'react'
import { SessionStatus } from '../components/session-status'
import { AuthPageShell } from '../components/auth-page-shell'

const LoginForm = lazy(async () => ({
  default: (await import('../components/login-form')).LoginForm,
}))

export function LoginPage() {
  const { state } = useAuth()
  const [search] = useSearchParams()
  const returnTo = getSafeReturnTo(search.get('returnTo'))
  if (state.status === 'signed-in') return <Navigate to={returnTo} replace />
  if (state.status === 'loading' || state.status === 'error') return <SessionStatus />

  return (
    <AuthPageShell>
      <section className="auth-card" aria-labelledby="route-title">
        <div className="auth-card-icon">
          <Fingerprint size={25} aria-hidden="true" />
        </div>
        <p className="eyebrow">MIŁO CIĘ WIDZIEĆ</p>
        <h1 id="route-title">Zaloguj się.</h1>
        <p className="auth-card-description">Użyj adresu e-mail powiązanego z Twoim kontem.</p>
        {(state.expired || search.get('reason') === 'session-expired') && (
          <p className="auth-session-note" role="status">
            Sesja wygasła. Zaloguj się ponownie.
          </p>
        )}
        {search.get('notice') === 'confirmation-complete' && (
          <p className="auth-session-note" role="status">
            Dokończ logowanie, aby wejść do swojej przestrzeni.
          </p>
        )}
        <Suspense fallback={<p role="status">Ładowanie formularza…</p>}>
          <LoginForm />
        </Suspense>
        <p className="auth-secondary-link">
          <Link to="/forgot-password">Nie pamiętasz hasła?</Link>
        </p>
        <p className="auth-secondary-link">
          Nie masz konta?{' '}
          <Link to={`/register?${new URLSearchParams({ returnTo })}`}>Utwórz konto</Link>
        </p>
        <p className="auth-secondary-link">
          <Link to={`/check-email?${new URLSearchParams({ returnTo })}`}>
            Potwierdź adres e-mail
          </Link>
        </p>
      </section>
    </AuthPageShell>
  )
}
