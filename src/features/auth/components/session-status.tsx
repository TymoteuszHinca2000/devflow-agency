import { ErrorState } from '@/components/shared/error-state'
import { LoadingState } from '@/components/shared/loading-state'
import { useAuth } from '../hooks/use-auth'

export function SessionStatus() {
  const { state, retry } = useAuth()
  if (state.status === 'error') {
    return (
      <ErrorState
        title="Nie udało się sprawdzić sesji."
        description={state.message}
        onRetry={retry}
        headingId="route-title"
        headingLevel={1}
      />
    )
  }
  return (
    <div className="auth-session-status">
      <h1 id="route-title">Sprawdzamy Twoją sesję.</h1>
      <LoadingState label="Trwa bezpieczne sprawdzanie dostępu…" layout="list" />
    </div>
  )
}
