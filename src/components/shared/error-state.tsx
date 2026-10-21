import { CircleAlert } from 'lucide-react'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

export function ErrorState({
  title = 'Nie udało się wyświetlić treści.',
  description = 'Spróbuj ponownie lub wybierz inny widok.',
  headingLevel = 2,
  headingId,
  onRetry,
  children,
}: {
  title?: string
  description?: string
  headingLevel?: 1 | 2 | 3
  headingId?: string
  onRetry?: () => void
  children?: ReactNode
}) {
  const id = useId()
  const titleId = headingId ?? `${id}-title`
  const Heading = headingLevel === 1 ? 'h1' : headingLevel === 3 ? 'h3' : 'h2'

  return (
    <section
      className="empty-state error-state"
      aria-labelledby={titleId}
      aria-describedby={`${id}-description`}
      data-heading-level={headingLevel}
    >
      <span className="empty-state-icon error-state-icon" aria-hidden="true">
        <CircleAlert size={30} />
      </span>
      <Heading id={titleId} className="empty-state-title">
        {title}
      </Heading>
      <p id={`${id}-description`} className="empty-state-description">
        {description}
      </p>
      {(onRetry || children != null) && (
        <div className="empty-state-actions">
          {onRetry && <Button onClick={onRetry}>Spróbuj ponownie</Button>}
          {children}
        </div>
      )}
    </section>
  )
}
