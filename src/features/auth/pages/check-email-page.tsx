import { lazy, Suspense } from 'react'
import { MailCheck } from 'lucide-react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router'
import { useAuth } from '../hooks/use-auth'
import { getSafeReturnTo } from '../lib/return-to'

const ConfirmationEmailForm = lazy(async () => ({
  default: (await import('../components/confirmation-email-form')).ConfirmationEmailForm,
}))

export function CheckEmailPage() {
  const { state } = useAuth()
  const location = useLocation()
  const [search] = useSearchParams()
  const returnTo = getSafeReturnTo(search.get('returnTo'))
  const routeState: unknown = location.state
  const email =
    typeof routeState === 'object' &&
    routeState !== null &&
    'email' in routeState &&
    typeof routeState.email === 'string'
      ? routeState.email.slice(0, 254)
      : ''
  if (state.status === 'signed-in') return <Navigate to={returnTo} replace />
  return (
    <section className="auth-card auth-centered" aria-labelledby="route-title">
      <div className="auth-card-icon">
        <MailCheck size={25} aria-hidden="true" />
      </div>
      <p className="eyebrow">JESZCZE JEDEN KROK</p>
      <h1 id="route-title">Sprawdź swoją skrzynkę.</h1>
      <p className="auth-card-description">
        Jeśli adres wymaga potwierdzenia, otrzymasz wiadomość z linkiem. Sprawdź także spam i otwórz
        najnowszy link w tej samej przeglądarce, w której wysłano prośbę.
      </p>
      <Suspense fallback={<p role="status">Ładowanie formularza…</p>}>
        <ConfirmationEmailForm initialEmail={email} returnTo={returnTo} />
      </Suspense>
      <p className="auth-secondary-link">
        <Link to={`/login?${new URLSearchParams({ returnTo })}`}>Wróć do logowania</Link>
      </p>
      <p className="auth-secondary-link">
        Błąd w adresie?{' '}
        <Link to={`/register?${new URLSearchParams({ returnTo })}`}>
          Zarejestruj właściwy adres
        </Link>
      </p>
    </section>
  )
}
