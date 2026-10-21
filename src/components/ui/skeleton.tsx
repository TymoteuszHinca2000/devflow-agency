import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// Adapted from shadcn/ui radix-nova; see docs/third-party-notices.md.
export function Skeleton({
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children' | 'aria-hidden' | 'role' | 'tabIndex'>) {
  return (
    <div
      {...props}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('h-4 rounded-lg bg-muted motion-safe:animate-pulse', className)}
    />
  )
}
