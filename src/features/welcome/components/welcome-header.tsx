import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { Brand } from '@/components/shared/brand'

export function WelcomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const menuButton = useRef<HTMLButtonElement>(null)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) {
          closeMenu()
          menuButton.current?.focus()
        }
      }}
    >
      <div className="site-header-inner page-width">
        <Brand />
        <span className="development-badge">
          <span className="status-dot" /> W budowie
        </span>
        <button
          ref={menuButton}
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? 'Zamknij nawigację' : 'Otwórz nawigację'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <nav
          id={menuId}
          aria-label="Nawigacja główna"
          className={`header-nav ${menuOpen ? 'is-open' : ''}`}
        >
          <a href="#main-content" onClick={closeMenu}>
            Start
          </a>
          <a
            href="https://github.com/TymoteuszHinca2000/devflow-agency/blob/feat/project-foundation/ROADMAP.md"
            target="_blank"
            rel="noreferrer"
            aria-label="Plan rozwoju (otwiera nową kartę)"
            onClick={closeMenu}
          >
            Plan rozwoju
          </a>
          <a
            href="https://github.com/TymoteuszHinca2000/devflow-agency"
            target="_blank"
            rel="noreferrer"
            className="repository-link"
            aria-label="Kod na GitHubie (otwiera nową kartę)"
          >
            Kod na GitHubie <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}
