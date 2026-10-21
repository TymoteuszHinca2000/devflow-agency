import { lazy, Suspense } from 'react'
import { UserRoundPlus } from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../hooks/use-auth'
import { getSafeReturnTo } from '../lib/return-to'
import { AuthPageShell } from '../components/auth-page-shell'
import { SessionStatus } from '../components/session-status'

const RegistrationForm = lazy(async () => ({
  default: (await import('../components/registration-form')).RegistrationForm,
}))

export function RegisterPage() {
  const { state } = useAuth()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const returnTo = getSafeReturnTo(search.get('returnTo'))
  if (state.status === 'signed-in') return <Navigate to={returnTo} replace />
  if (state.status === 'loading' || state.status === 'error') return <SessionStatus />
  return (
    <AuthPageShell>
      <section className="auth-card" aria-labelledby="route-title">
        <div className="auth-card-icon">
          <UserRoundPlus size={25} aria-hidden="true" />
        </div>
        <p className="eyebrow">ZACZNIJ SWÓJ FLOW</p>
        <h1 id="route-title">Stwórz konto.</h1>
        <p className="auth-card-description">Jedno konto. Miejsce na dobrą współpracę.</p>
        <Suspense fallback={<p role="status">Ładowanie formularza…</p>}>
          <RegistrationForm
            returnTo={returnTo}
            onSubmitted={(email) => {
              void navigate(`/check-email?${new URLSearchParams({ returnTo })}`, {
                replace: true,
                state: { email },
              })
            }}
          />
        </Suspense>
        <p className="auth-secondary-link">
          Masz już konto?{' '}
          <Link to={`/login?${new URLSearchParams({ returnTo })}`}>Zaloguj się</Link>
        </p>
      </section>
    </AuthPageShell>
  )
}
