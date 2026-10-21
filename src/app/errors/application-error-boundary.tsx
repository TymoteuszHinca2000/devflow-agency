import type { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ApplicationErrorPage } from './application-error-page'

export function ApplicationErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary FallbackComponent={ApplicationErrorPage}>{children}</ErrorBoundary>
}
