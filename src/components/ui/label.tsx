import { Root as LabelPrimitive } from '@radix-ui/react-label'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// Adapted from shadcn/ui radix-nova; see docs/third-party-notices.md.
export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive>) {
  return (
    <LabelPrimitive
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-normal font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
