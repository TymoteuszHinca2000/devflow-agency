import type { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useLocation } from 'react-router'
import { PageErrorState } from './page-error-state'

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  return (
    <ErrorBoundary key={pathname} FallbackComponent={PageErrorState}>
      {children}
    </ErrorBoundary>
  )
}
