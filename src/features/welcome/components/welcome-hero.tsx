import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { ActionLink } from '@/components/ui/action-link'
import { WorkspaceIllustration } from './workspace-illustration'

export function WelcomeHero() {
  return (
    <section className="welcome-hero page-width" aria-labelledby="welcome-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="eyebrow-line" /> PRZESTRZEŃ DLA DOBREJ PRACY
        </p>
        <h1 id="welcome-title">
          Twoja agencja.
          <br />
          <span>Jeden flow.</span>
        </h1>
        <p className="hero-description">
          Mniej rozproszonych narzędzi.
          <br />
          Więcej miejsca na to, co ważne.
        </p>
        <p className="hero-intro">
          Tworzymy wspólną przestrzeń dla projektów, klientów i zespołu. Od pierwszego briefu do
          ostatniej poprawki.
        </p>
        <div className="hero-actions">
          <ActionLink href="#mozliwosci">
            Poznaj możliwości <ArrowRight size={18} aria-hidden="true" />
          </ActionLink>
          <ActionLink
            href="https://github.com/TymoteuszHinca2000/devflow-agency/blob/feat/project-foundation/ROADMAP.md"
            variant="secondary"
            target="_blank"
            rel="noreferrer"
          >
            Zobacz plan <ArrowUpRight size={17} aria-hidden="true" />
            <span className="sr-only"> (otwiera nową kartę)</span>
          </ActionLink>
        </div>
        <p className="hero-note">
          <Check size={14} aria-hidden="true" /> Rozwijane otwarcie. Krok po kroku.
        </p>
      </div>
      <WorkspaceIllustration />
    </section>
  )
}
