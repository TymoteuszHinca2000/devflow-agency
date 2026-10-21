import type { FallbackProps } from 'react-error-boundary'
import { Link, useLocation } from 'react-router'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { useErrorRecovery } from './use-error-recovery'

export function PageErrorState({ resetErrorBoundary }: FallbackProps) {
  const { pathname } = useLocation()
  const retry = useErrorRecovery(resetErrorBoundary, pathname)

  return (
    <div data-page-error>
      <ErrorState
        title="Nie udało się wyświetlić tej strony."
        description="Możesz spróbować ponownie lub przejść do innego widoku. Nawigacja aplikacji pozostaje dostępna."
        headingLevel={1}
        headingId="route-title"
        onRetry={retry}
      >
        <Button asChild variant="outline">
          <Link to="/app">Wszystkie moduły</Link>
        </Button>
      </ErrorState>
    </div>
  )
}
