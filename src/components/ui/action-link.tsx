import type { ComponentProps } from 'react'
import { Button } from './button'

type ActionLinkProps = ComponentProps<'a'> & { variant?: 'primary' | 'secondary' }

export function ActionLink({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ActionLinkProps) {
  return (
    <Button
      asChild
      variant={variant === 'primary' ? 'default' : 'outline'}
      size="lg"
      className={`action-link ${className}`}
    >
      <a {...props}>{children}</a>
    </Button>
  )
}
