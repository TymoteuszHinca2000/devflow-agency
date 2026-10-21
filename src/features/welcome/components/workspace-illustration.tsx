import { ArrowUpRight, Clock3, FolderKanban, UsersRound, Workflow } from 'lucide-react'
import { BrandMark } from '@/components/shared/brand'

export function WorkspaceIllustration() {
  return (
    <figure
      className="workspace-figure"
      aria-label="Wizja produktu: DevFlow łączy klientów, projekty, zespół i czas pracy. Te moduły są planowane."
    >
      <div className="workspace-canvas" aria-hidden="true">
        <div className="canvas-caption">
          <span className="status-dot" /> POŁĄCZ KROPKI.
        </div>
        <span className="canvas-label">
          Wizja produktu <ArrowUpRight size={12} />
        </span>
        <svg className="flow-connections" viewBox="0 0 600 480" fill="none">
          <circle cx="300" cy="240" r="174" className="orbit" />
          <circle cx="300" cy="240" r="116" className="orbit orbit--inner" />
          <path
            d="M145 143h45q30 0 30 30v37q0 30 30 30h50M455 160h-55q-30 0-30 30v20q0 30-30 30h-40M145 340h40q35 0 35-35v-35q0-30 30-30h50M455 330h-55q-30 0-30-30v-30q0-30-30-30h-40"
            className="connection-line"
          />
          <circle cx="220" cy="190" r="4" className="connection-dot" />
          <circle cx="370" cy="286" r="4" className="connection-dot" />
          <path d="M490 75v12m-6-6h12M92 255v12m-6-6h12" className="canvas-cross" />
        </svg>
        <div className="flow-node flow-node--clients">
          <span className="node-icon">
            <UsersRound size={19} />
          </span>
          <span>
            <strong>Klienci</strong>
            <small>Dobre relacje</small>
          </span>
        </div>
        <div className="flow-node flow-node--projects">
          <span className="node-icon node-icon--violet">
            <FolderKanban size={19} />
          </span>
          <span>
            <strong>Projekty</strong>
            <small>Jasny kierunek</small>
          </span>
        </div>
        <div className="flow-hub">
          <BrandMark />
          <span>devflow</span>
          <small>JEDEN FLOW.</small>
        </div>
        <div className="flow-node flow-node--team">
          <span className="node-icon node-icon--blue">
            <Workflow size={19} />
          </span>
          <span>
            <strong>Zespół</strong>
            <small>Wspólny rytm</small>
          </span>
        </div>
        <div className="flow-node flow-node--time">
          <span className="node-icon node-icon--amber">
            <Clock3 size={19} />
          </span>
          <span>
            <strong>Czas pracy</strong>
            <small>Każda godzina</small>
          </span>
        </div>
        <div className="canvas-bottom">
          <span>MNIEJ ROZPROSZENIA</span>
          <span>
            WIĘCEJ PRZESTRZENI <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
      <figcaption>Jedna przestrzeń. Wszystkie elementy Twojej agencji.</figcaption>
    </figure>
  )
}
