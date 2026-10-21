import { lazy, Suspense } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
const AccountContent = lazy(async () => ({
  default: (await import('../components/account-content')).AccountContent,
}))

export function AccountPage() {
  const { state } = useAuth()
  if (state.status !== 'signed-in') return null
  return (
    <div className="account-page">
      <header className="account-heading">
        <p className="eyebrow">
          <ShieldCheck size={15} aria-hidden="true" /> TWOJE KONTO
        </p>
        <h1 id="route-title">Twoja przestrzeń. Twój profil.</h1>
        <p>Zarządzaj swoim zdjęciem, nazwą i bezpieczeństwem konta.</p>
      </header>
      <Suspense fallback={<p role="status">Ładowanie ustawień konta…</p>}>
        <AccountContent key={state.user.id} userId={state.user.id} email={state.user.email} />
      </Suspense>
    </div>
  )
}
