import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

// Adapted from shadcn/ui radix-nova; shares the Dialog focus and dismissal behavior.
export function Sheet(props: ComponentProps<typeof Dialog>) {
  return <Dialog {...props} />
}

export function SheetTrigger(props: ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger data-slot="sheet-trigger" {...props} />
}

export function SheetClose(props: ComponentProps<typeof DialogClose>) {
  return <DialogClose data-slot="sheet-close" {...props} />
}

export function SheetContent({
  className,
  side = 'right',
  closeLabel = 'Zamknij panel',
  ...props
}: ComponentProps<typeof DialogContent> & { side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <DialogContent
      data-slot="sheet-content"
      data-side={side}
      closeLabel={closeLabel}
      className={cn('sheet-surface', className)}
      {...props}
    />
  )
}

export function SheetHeader(props: ComponentProps<typeof DialogHeader>) {
  return <DialogHeader data-slot="sheet-header" {...props} />
}

export function SheetFooter({ className, ...props }: ComponentProps<typeof DialogFooter>) {
  return <DialogFooter data-slot="sheet-footer" className={cn('mt-auto', className)} {...props} />
}

export function SheetTitle(props: ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot="sheet-title" {...props} />
}

export function SheetDescription(props: ComponentProps<typeof DialogDescription>) {
  return <DialogDescription data-slot="sheet-description" {...props} />
}
