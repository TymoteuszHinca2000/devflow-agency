import { ArrowUpRight, Fingerprint, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { useAuth } from '../hooks/use-auth'
import { getSafeReturnTo } from '../lib/return-to'
import { lazy, Suspense } from 'react'
import { SessionStatus } from '../components/session-status'

const LoginForm = lazy(async () => ({
  default: (await import('../components/login-form')).LoginForm,
}))

export function LoginPage() {
  const { state } = useAuth()
  const [search] = useSearchParams()
  if (state.status === 'signed-in')
    return <Navigate to={getSafeReturnTo(search.get('returnTo'))} replace />
  if (state.status === 'loading' || state.status === 'error') return <SessionStatus />

  return (
    <div className="auth-layout">
      <aside className="auth-intro" aria-label="Twoja przestrzeń DevFlow">
        <p className="eyebrow">TWÓJ ZESPÓŁ. TWÓJ FLOW.</p>
        <h2>
          Dobre rzeczy
          <br />
          zaczynają się
          <br />
          <span>od połączenia.</span>
        </h2>
        <p className="auth-intro-description">
          Wróć do swojej przestrzeni i zrób miejsce na to, co ważne.
        </p>
        <div className="auth-assurance">
          <ShieldCheck size={22} aria-hidden="true" />
          <p>
            <strong>Twój dostęp, Twoje uprawnienia.</strong>
            <span>Dane pozostają w przestrzeni właściwego zespołu.</span>
          </p>
        </div>
        <Link to="/#plan-rozwoju" className="auth-plan-link">
          Zobacz, dokąd zmierzamy <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </aside>
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
        <Suspense fallback={<p role="status">Ładowanie formularza…</p>}>
          <LoginForm />
        </Suspense>
      </section>
    </div>
  )
}
