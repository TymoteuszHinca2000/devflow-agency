import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { appModules } from '../app-modules'

export function ModulePreviewPage({ module }: { module: (typeof appModules)[number] }) {
  const Icon = module.icon
  return (
    <>
      <div className="route-intro">
        <p className="eyebrow">ETAP {module.stage} · MODUŁ PLANOWANY</p>
        <h1 id="route-title">{module.title}</h1>
        <p className="route-description">{module.description}</p>
      </div>
      <section className="route-status-panel" aria-labelledby="module-status-title">
        <span className="route-status-icon">
          <Icon size={30} aria-hidden="true" />
        </span>
        <h2 id="module-status-title">Ten moduł jest w planie.</h2>
        <p>
          Jego funkcje powstaną w kolejnych etapach rozwoju DevFlow. Wróć do listy modułów lub
          zobacz, co przygotowujemy dalej.
        </p>
        <div className="route-actions">
          <Button asChild>
            <Link to="/app">
              <ArrowLeft size={17} aria-hidden="true" />
              Wszystkie moduły
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/#plan-rozwoju">
              Zobacz plan rozwoju
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
