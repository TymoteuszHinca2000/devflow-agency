import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router'
import { PageErrorBoundary } from '@/app/errors/page-error-boundary'
import { AppSidebar } from './app-sidebar'
import { AppTopbar } from './app-topbar'

export function AppLayout({ accountControls }: { accountControls?: ReactNode }) {
  const sidebarRef = useRef<HTMLElement>(null)

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Przejdź do treści
      </a>
      <AppSidebar sidebarRef={sidebarRef} />
      <div className="app-shell-body">
        <AppTopbar sidebarRef={sidebarRef} accountControls={accountControls} />
        <main id="main-content" className="app-main" tabIndex={-1} aria-labelledby="route-title">
          <PageErrorBoundary>
            <Outlet />
          </PageErrorBoundary>
        </main>
        <footer className="app-footer">
          <span>DevFlow Agency · Rozwijane krok po kroku.</span>
          <Link to="/#plan-rozwoju">Plan rozwoju</Link>
        </footer>
      </div>
    </div>
  )
}
