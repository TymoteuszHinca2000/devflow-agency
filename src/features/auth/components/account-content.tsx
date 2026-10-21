import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { loadProfile } from '../services/profile-service'
import type { Profile } from '../services/profile-service'
import { ProfileEditor } from './profile-editor'
import { PasswordForm } from './password-form'
import { changePassword } from '../services/password-service'

function ProfileSection({ userId }: { userId: string }) {
  const [result, setResult] = useState<Profile | 'failed' | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    const deadline = setTimeout(() => {
      setResult('failed')
      controller.abort()
    }, 15_000)
    void loadProfile(userId, controller.signal)
      .then((profile) => {
        if (!controller.signal.aborted) setResult(profile)
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult('failed')
      })
      .finally(() => clearTimeout(deadline))
    return () => {
      clearTimeout(deadline)
      controller.abort()
    }
  }, [userId])
  if (!result) return <p role="status">Ładowanie profilu…</p>
  if (result === 'failed')
    return <p role="alert">Nie udało się pobrać profilu. Sprawdź połączenie i odśwież dane.</p>
  return <ProfileEditor initialProfile={result} />
}

export function AccountContent({ userId, email }: { userId: string; email: string | undefined }) {
  const [attempt, setAttempt] = useState(0)
  return (
    <div className="account-grid">
      <section className="account-panel" aria-labelledby="profile-heading">
        <div className="account-panel-heading">
          <h2 id="profile-heading">Twój profil</h2>
          <Button variant="ghost" onClick={() => setAttempt((value) => value + 1)}>
            Odśwież dane
          </Button>
        </div>
        <p className="account-description">
          Tak będą Cię widzieć osoby, z którymi współpracujesz. Odświeżenie odrzuci niezapisane
          zmiany.
        </p>
        <ProfileSection key={attempt} userId={userId} />
      </section>
      <section className="account-panel" aria-labelledby="security-heading">
        <h2 id="security-heading">Hasło i dostęp</h2>
        <p className="account-description">
          Adres konta: <strong className="account-address">{email ?? 'Brak adresu'}</strong>. Zmiana
          hasła pozostawi aktywną sesję w tej przeglądarce.
        </p>
        <PasswordForm
          onSave={(values) => changePassword(userId, values.currentPassword, values.password)}
        />
      </section>
    </div>
  )
}
