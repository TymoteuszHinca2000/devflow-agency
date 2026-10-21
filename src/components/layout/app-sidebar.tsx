import { ArrowLeft } from 'lucide-react'
import type { Ref } from 'react'
import { Link } from 'react-router'
import { Brand } from '@/components/shared/brand'
import { AppNavigation } from './app-navigation'

export function AppSidebar({ sidebarRef }: { sidebarRef: Ref<HTMLElement> }) {
  return (
    <aside ref={sidebarRef} className="app-sidebar" aria-label="Panel boczny">
      <div className="app-sidebar-header">
        <Brand to="/" />
        <span className="app-development-status">
          <span className="status-dot" /> Aplikacja w budowie
        </span>
      </div>
      <AppNavigation />
      <div className="app-sidebar-footer">
        <p>Rozwijane krok po kroku.</p>
        <Link to="/">
          <ArrowLeft size={16} aria-hidden="true" />
          Powrót na stronę główną
        </Link>
      </div>
    </aside>
  )
}
