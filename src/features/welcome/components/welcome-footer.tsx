import { ArrowUpRight } from 'lucide-react'
import { Brand } from '@/components/shared/brand'

export function WelcomeFooter() {
  return (
    <footer className="site-footer page-width">
      <Brand />
      <p>Tworzone przez Tymoteusza Hincę.</p>
      <a
        href="https://github.com/TymoteuszHinca2000/devflow-agency/blob/main/LICENSE"
        target="_blank"
        rel="noreferrer"
      >
        Open source · MIT <ArrowUpRight size={14} aria-hidden="true" />
        <span className="sr-only"> (otwiera nową kartę)</span>
      </a>
    </footer>
  )
}
