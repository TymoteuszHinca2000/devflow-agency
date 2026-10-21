import { Grid2X2 } from 'lucide-react'
import type { MouseEvent, Ref } from 'react'
import { NavLink } from 'react-router'
import { appModules } from '@/app/app-modules'

export function AppNavigation({
  navRef,
  onNavigate,
}: {
  navRef?: Ref<HTMLElement>
  onNavigate?: () => void
}) {
  function handleNavigate(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button === 0 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      onNavigate?.()
    }
  }

  return (
    <nav ref={navRef} className="app-navigation" aria-label="Nawigacja aplikacji">
      <NavLink to="/app" end className="app-nav-link" onClick={handleNavigate}>
        <Grid2X2 size={19} aria-hidden="true" />
        <span>Wszystkie moduły</span>
      </NavLink>
      <p className="app-nav-label">MODUŁY W PLANIE</p>
      <ul className="app-nav-list">
        {appModules.map(({ path, title, icon: Icon }) => (
          <li key={path}>
            <NavLink to={`/app/${path}`} end className="app-nav-link" onClick={handleNavigate}>
              <Icon size={19} aria-hidden="true" />
              <span>{title}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
