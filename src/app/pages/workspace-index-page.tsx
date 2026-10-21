import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { appModules } from '../app-modules'

export function WorkspaceIndexPage() {
  return (
    <>
      <div className="route-intro">
        <p className="eyebrow">PRZESTRZEŃ APLIKACJI · W BUDOWIE</p>
        <h1 id="route-title">Miejsce na Twój flow.</h1>
        <p className="route-description">
          Poznaj obszary powstającej aplikacji. Każdy moduł ma już swój adres; funkcje będą
          udostępniane zgodnie z planem rozwoju.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Wróć na stronę główną</Link>
        </Button>
      </div>
      <nav aria-label="Moduły aplikacji">
        <ul className="route-module-grid">
          {appModules.map(({ path, title, description, stage, icon: Icon }) => (
            <li key={path}>
              <Link to={`/app/${path}`} className="route-module-card">
                <span className="route-module-top">
                  <Icon size={22} aria-hidden="true" />
                  <span>ETAP {stage} · PLANOWANY</span>
                </span>
                <span className="route-module-title">
                  {title}
                  <ArrowRight size={18} aria-hidden="true" />
                </span>
                <span className="route-module-description">{description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
