import type { ComponentProps } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function LoadingState({
  label = 'Ładowanie danych…',
  layout = 'cards',
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  label?: string
  layout?: 'cards' | 'list'
}) {
  return (
    <div className={cn('loading-state', className)} {...props}>
      <p className="loading-state-label" role="status" aria-atomic="true">
        {label}
      </p>
      <div
        className="loading-state-content"
        data-layout={layout}
        role="group"
        aria-label="Wczytywana zawartość"
        aria-busy="true"
      >
        {[0, 1, 2].map((index) => (
          <div key={index} className="loading-state-item" aria-hidden="true">
            <Skeleton className="size-11 shrink-0 rounded-xl" />
            <div className="loading-state-lines">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="w-full" />
              <Skeleton className="w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
