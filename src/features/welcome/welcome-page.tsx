import { WelcomeFooter } from './components/welcome-footer'
import { DevelopmentRoadmap } from './components/development-roadmap'
import { ModuleOverview } from './components/module-overview'
import { WelcomeHeader } from './components/welcome-header'
import { WelcomeHero } from './components/welcome-hero'

export function WelcomePage() {
  return (
    <div id="top" className="welcome-page">
      <a className="skip-link" href="#main-content">
        Przejdź do treści
      </a>
      <WelcomeHeader />
      <main id="main-content" tabIndex={-1}>
        <WelcomeHero />
        <ModuleOverview />
        <DevelopmentRoadmap />
      </main>
      <WelcomeFooter />
    </div>
  )
}
