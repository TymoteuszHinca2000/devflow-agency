import { ArrowUpRight, Plus } from 'lucide-react'
import { developmentPhases } from '../data/development-phases'
import '../styles/development-roadmap.css'

export function DevelopmentRoadmap() {
  return (
    <section
      id="plan-rozwoju"
      className="roadmap-section section-anchor"
      aria-labelledby="roadmap-title"
    >
      <div className="roadmap-inner page-width">
        <div className="roadmap-copy">
          <p className="eyebrow">02 / PLAN ROZWOJU</p>
          <h2 id="roadmap-title">
            Dobry flow
            <br />
            zaczyna się od
            <br />
            <span>dobrego planu.</span>
          </h2>
          <p>
            Budujemy DevFlow etapami. Każdy krok to konkretna funkcjonalność, sprawdzony kod i jasny
            kierunek dalszego rozwoju.
          </p>
          <a
            href="https://github.com/TymoteuszHinca2000/devflow-agency/blob/feat/project-foundation/ROADMAP.md"
            className="roadmap-document-link"
            target="_blank"
            rel="noreferrer"
          >
            Pełna roadmapa na GitHubie <ArrowUpRight size={16} aria-hidden="true" />
            <span className="sr-only"> (otwiera nową kartę)</span>
          </a>
        </div>
        <div className="roadmap-phases">
          {developmentPhases.map((phase) => (
            <details
              key={phase.id}
              className={`roadmap-phase ${phase.current ? 'is-current' : ''}`}
              open={phase.current}
            >
              <summary>
                <span className="phase-number" aria-hidden="true">
                  {phase.number}
                </span>
                <span className="phase-title">
                  <span className="phase-range">
                    {phase.range}
                    {phase.current && (
                      <span className="phase-status">
                        <span className="status-dot" /> W realizacji
                      </span>
                    )}
                  </span>
                  <strong>{phase.title}</strong>
                </span>
                <Plus className="phase-toggle" size={19} aria-hidden="true" />
              </summary>
              <div className="phase-description">
                <p>{phase.description}</p>
                {phase.current && (
                  <span className="phase-current-label">
                    Aktualnie: ETAP 1 — fundament projektu.
                  </span>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
