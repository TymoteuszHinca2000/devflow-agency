import { lazy, Suspense } from 'react'
import { KeyRound } from 'lucide-react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../hooks/use-auth'
import { SessionStatus } from '../components/session-status'
import { AuthPageShell } from '../components/auth-page-shell'
const ForgotPasswordForm = lazy(async () => ({
  default: (await import('../components/forgot-password-form')).ForgotPasswordForm,
}))

export function ForgotPasswordPage() {
  const { state } = useAuth()
  if (state.status === 'signed-in') return <Navigate to="/app/account" replace />
  if (state.status !== 'signed-out') return <SessionStatus />
  return (
    <AuthPageShell>
      <section className="auth-card" aria-labelledby="route-title">
        <div className="auth-card-icon">
          <KeyRound size={25} aria-hidden="true" />
        </div>
        <p className="eyebrow">ODZYSKIWANIE KONTA</p>
        <h1 id="route-title">Nowy początek.</h1>
        <p className="auth-card-description">
          Podaj swój adres e-mail. Wyślemy link pozwalający ustawić nowe hasło.
        </p>
        <Suspense fallback={<p role="status">Ładowanie formularza…</p>}>
          <ForgotPasswordForm />
        </Suspense>
        <p className="auth-secondary-link">
          <Link to="/login">Wróć do logowania</Link>
        </p>
      </section>
    </AuthPageShell>
  )
}
