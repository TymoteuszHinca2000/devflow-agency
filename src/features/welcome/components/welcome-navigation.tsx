import { ArrowUpRight } from 'lucide-react'
import { ThemeSelector } from '@/components/shared/theme-selector'

const sectionLinks = [
  { id: 'main-content', label: 'Start' },
  { id: 'mozliwosci', label: 'Możliwości' },
  { id: 'plan-rozwoju', label: 'Plan rozwoju' },
] as const

export function WelcomeNavigation({
  onSectionNavigate,
  onExternalNavigate,
}: {
  onSectionNavigate?: (id: string) => void
  onExternalNavigate?: () => void
}) {
  return (
    <>
      {sectionLinks.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(event) => {
            if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey)
              onSectionNavigate?.(id)
          }}
        >
          {label}
        </a>
      ))}
      <a
        href="https://github.com/TymoteuszHinca2000/devflow-agency"
        target="_blank"
        rel="noreferrer"
        className="repository-link"
        aria-label="Kod na GitHubie (otwiera nową kartę)"
        onClick={onExternalNavigate}
      >
        Kod na GitHubie <ArrowUpRight size={16} aria-hidden="true" />
      </a>
      <ThemeSelector />
    </>
  )
}
