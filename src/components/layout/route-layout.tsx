import { Link, Outlet } from 'react-router'
import { PageErrorBoundary } from '@/app/errors/page-error-boundary'
import { Brand } from '@/components/shared/brand'
import { ThemeSelector } from '@/components/shared/theme-selector'

export function RouteLayout() {
  return (
    <div className="route-shell">
      <a className="skip-link" href="#main-content">
        Przejdź do treści
      </a>
      <header className="route-header page-width">
        <Brand to="/" />
        <span className="development-badge">
          <span className="status-dot" /> W budowie
        </span>
        <ThemeSelector />
      </header>
      <main
        id="main-content"
        className="route-main page-width"
        tabIndex={-1}
        aria-labelledby="route-title"
      >
        <PageErrorBoundary>
          <Outlet />
        </PageErrorBoundary>
      </main>
      <footer className="route-footer page-width">
        <span>DevFlow Agency · Rozwijane krok po kroku.</span>
        <Link to="/#plan-rozwoju">Plan rozwoju</Link>
      </footer>
    </div>
  )
}
