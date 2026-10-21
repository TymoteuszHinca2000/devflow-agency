import type { ReactNode } from 'react'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <aside className="auth-intro" aria-label="Twoja przestrzeń DevFlow">
        <p className="eyebrow">TWÓJ ZESPÓŁ. TWÓJ FLOW.</p>
        <h2>
          Dobre rzeczy
          <br />
          zaczynają się
          <br />
          <span>od połączenia.</span>
        </h2>
        <p className="auth-intro-description">
          Znajdź swoją przestrzeń i zrób miejsce na to, co ważne.
        </p>
        <div className="auth-assurance">
          <ShieldCheck size={22} aria-hidden="true" />
          <p>
            <strong>Twój dostęp, Twoje uprawnienia.</strong>
            <span>Dane pozostają w przestrzeni właściwego zespołu.</span>
          </p>
        </div>
        <Link to="/#plan-rozwoju" className="auth-plan-link">
          Zobacz, dokąd zmierzamy <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </aside>
      {children}
    </div>
  )
}
