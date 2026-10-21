import type { ComponentProps } from 'react'

type ActionLinkProps = ComponentProps<'a'> & { variant?: 'primary' | 'secondary' }

export function ActionLink({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ActionLinkProps) {
  return (
    <a className={`action-link action-link--${variant} ${className}`} {...props}>
      {children}
    </a>
  )
}
