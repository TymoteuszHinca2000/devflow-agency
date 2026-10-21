import { ChevronRight } from 'lucide-react'
import type { RefObject } from 'react'
import { Link, matchPath, useLocation } from 'react-router'
import { appModules } from '@/app/app-modules'
import { ThemeSelector } from '@/components/shared/theme-selector'
import { AppMobileNavigation } from './app-mobile-navigation'

export function AppTopbar({ sidebarRef }: { sidebarRef: RefObject<HTMLElement | null> }) {
  const { pathname } = useLocation()
  const module = appModules.find(({ path }) => matchPath(`/app/${path}`, pathname))
  const title =
    module?.title ?? (matchPath('/app', pathname) ? 'Wszystkie moduły' : 'Nieznany adres')

  return (
    <header className="app-topbar">
      <AppMobileNavigation key={pathname} sidebarRef={sidebarRef} />
      <nav className="app-breadcrumb" aria-label="Ścieżka strony">
        <ol>
          <li>
            <Link to="/app">Aplikacja</Link>
          </li>
          <li>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">{title}</span>
          </li>
        </ol>
      </nav>
      <ThemeSelector />
    </header>
  )
}
