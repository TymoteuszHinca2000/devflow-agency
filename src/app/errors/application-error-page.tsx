import type { FallbackProps } from 'react-error-boundary'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { useErrorRecovery } from './use-error-recovery'

export function ApplicationErrorPage({ resetErrorBoundary }: FallbackProps) {
  const retry = useErrorRecovery(resetErrorBoundary)

  return (
    <div className="application-error-shell" data-page-error>
      <header className="application-error-header page-width">
        <a className="application-error-brand" href="/">
          DevFlow Agency
        </a>
        <span className="development-badge">W budowie</span>
      </header>
      <main
        id="main-content"
        className="application-error-main page-width"
        tabIndex={-1}
        aria-labelledby="route-title"
      >
        <ErrorState
          title="Nie udało się wyświetlić aplikacji."
          description="Wystąpił nieoczekiwany problem. Spróbuj ponownie lub wróć na stronę główną."
          headingLevel={1}
          headingId="route-title"
          onRetry={retry}
        >
          <Button asChild variant="outline">
            <a href="/">Strona główna</a>
          </Button>
        </ErrorState>
      </main>
    </div>
  )
}
