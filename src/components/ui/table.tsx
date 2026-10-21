import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// Adapted from shadcn/ui radix-nova; see docs/third-party-notices.md.
export function Table({
  className,
  containerProps,
  ...props
}: ComponentProps<'table'> & { containerProps?: ComponentProps<'div'> }) {
  const { className: containerClassName, ...scrollProps } = containerProps ?? {}

  return (
    <div
      data-slot="table-container"
      role="region"
      aria-label="Tabela z przewijaniem poziomym"
      tabIndex={0}
      className={cn(
        'relative w-full min-w-0 overflow-x-auto rounded-xl border border-border bg-card text-card-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        containerClassName,
      )}
      {...scrollProps}
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm leading-relaxed', className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('bg-muted/50 [&_tr]:border-b', className)}
      {...props}
    />
  )
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

export function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t border-border bg-muted/50 font-medium [&_tr:last-child]:border-0',
        className,
      )}
      {...props}
    />
  )
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border transition-colors hover:bg-muted/50 focus-within:bg-muted/50 data-[state=selected]:bg-muted motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  )
}

export function TableHead({ className, scope = 'col', ...props }: ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      scope={scope}
      className={cn('h-12 px-4 py-3 text-left align-middle font-semibold', className)}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td data-slot="table-cell" className={cn('px-4 py-3 align-middle', className)} {...props} />
  )
}

export function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('px-4 py-3 text-left text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
