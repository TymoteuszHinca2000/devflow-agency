import { useId, useState } from 'react'
import { Card } from '@/components/ui/card'
import { moduleFilters, plannedModules } from '../data/planned-modules'
import type { ModuleCategory } from '../data/planned-modules'
import '../styles/module-overview.css'

const modulePlural = new Intl.PluralRules('pl')

function describeModuleCount(count: number) {
  const form = modulePlural.select(count)
  const label =
    form === 'one' ? 'planowany moduł' : form === 'few' ? 'planowane moduły' : 'planowanych modułów'
  return `${count} ${label}`
}

export function ModuleOverview() {
  const [category, setCategory] = useState<ModuleCategory>('all')
  const listId = useId()
  const modules = plannedModules.filter(
    (module) => category === 'all' || module.category === category,
  )

  return (
    <section
      id="mozliwosci"
      tabIndex={-1}
      className="module-section page-width section-anchor"
      aria-labelledby="modules-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">01 / MOŻLIWOŚCI</p>
          <h2 id="modules-title">
            Wszystko, co porusza
            <br />
            Twoją agencję.
          </h2>
        </div>
        <p className="section-description">
          Jeden spójny proces zamiast wielu osobnych narzędzi. Oto moduły, które planujemy zbudować.
        </p>
      </div>
      <div className="module-toolbar">
        <div className="module-filters" role="group" aria-label="Filtr planowanych modułów">
          {moduleFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={category === filter.id}
              aria-controls={listId}
              onClick={() => setCategory(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="module-count" role="status" aria-atomic="true">
          {describeModuleCount(modules.length)}
        </p>
      </div>
      <ul id={listId} className="module-grid" aria-label="Planowane moduły">
        {modules.map(({ id, title, stage, icon: Icon, description, capabilities }) => (
          <li key={id}>
            <Card className="module-card h-full gap-0 py-0">
              <div className="module-card-top">
                <span className="module-icon">
                  <Icon size={23} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="module-stage">ETAP {stage.toString().padStart(2, '0')}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="module-capabilities">{capabilities.join(' · ')}</span>
            </Card>
          </li>
        ))}
      </ul>
      <p className="scope-note">
        <span className="status-dot" /> Moduły są w planie. Obecnie przygotowujemy fundament i
        interfejs aplikacji.
      </p>
    </section>
  )
}
