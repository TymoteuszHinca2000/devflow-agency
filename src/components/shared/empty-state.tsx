import { useId } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  title,
  description,
  icon,
  headingLevel = 2,
  children,
  className,
  ...props
}: Omit<ComponentProps<'section'>, 'title'> & {
  title: string
  description: string
  icon?: ReactNode
  headingLevel?: 2 | 3
}) {
  const id = useId()
  const Heading = headingLevel === 3 ? 'h3' : 'h2'

  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      className={cn('empty-state', className)}
      {...props}
    >
      {icon != null && (
        <span className="empty-state-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <Heading id={`${id}-title`} className="empty-state-title">
        {title}
      </Heading>
      <p id={`${id}-description`} className="empty-state-description">
        {description}
      </p>
      {children != null && <div className="empty-state-actions">{children}</div>}
    </section>
  )
}
