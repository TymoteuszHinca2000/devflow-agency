import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { notify } from '@/lib/notify'
import { useAuth } from '../hooks/use-auth'
import { signOut } from '../services/auth-service'
import { getAuthErrorMessage } from '../lib/auth-errors'

export function AccountControls() {
  const { state } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  if (state.status !== 'signed-in') return null

  async function logout() {
    setPending(true)
    try {
      await signOut()
      void navigate('/login', { replace: true })
    } catch (error) {
      notify('Nie udało się wylogować.', { kind: 'error', description: getAuthErrorMessage(error) })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="account-controls">
      <span className="account-email" title={state.user.email}>
        {state.user.email}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          void logout()
        }}
        disabled={pending}
        aria-label={pending ? 'Wylogowywanie…' : 'Wyloguj się'}
        title="Wyloguj się"
      >
        <LogOut size={17} aria-hidden="true" />
      </Button>
    </div>
  )
}
