import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { ErrorState } from '@/components/shared/error-state'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { RouteEffects } from '@/app/route-effects'
import { ApplicationErrorBoundary } from './application-error-boundary'

describe('Error recovery', () => {
  it('provides a safe fallback without providers and recovers through the keyboard', async () => {
    const user = userEvent.setup()
    const failure = new Error('INTERNAL_ONLY_DETAILS')
    const onCaughtError = vi.fn()
    let broken = true
    function Page() {
      if (broken) throw failure
      return (
        <main tabIndex={-1}>
          <h1>Odzyskany widok</h1>
        </main>
      )
    }
    render(
      <ApplicationErrorBoundary>
        <Page />
      </ApplicationErrorBoundary>,
      { onCaughtError },
    )
    expect(onCaughtError.mock.calls[0]?.[0]).toBe(failure)
    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Nie udało się wyświetlić aplikacji.',
    )
    expect(screen.queryByText(/INTERNAL_ONLY_DETAILS/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Strona główna' })).toHaveAttribute('href', '/')
    expect(document.title).toBe('Wystąpił problem — DevFlow Agency')
    broken = false
    await user.tab()
    expect(screen.getByRole('button', { name: 'Spróbuj ponownie' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'Odzyskany widok' })).toBeVisible()
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus())
  })

  it('keeps a persistent render failure contained after a retry', async () => {
    const user = userEvent.setup()
    const failure = new Error('PERSISTENT_INTERNAL_ERROR')
    const onCaughtError = vi.fn()
    function Page(): never {
      throw failure
    }
    render(
      <ApplicationErrorBoundary>
        <Page />
      </ApplicationErrorBoundary>,
      { onCaughtError },
    )
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }))
    expect(onCaughtError).toHaveBeenCalledTimes(2)
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus())
    expect(document.title).toBe('Wystąpił problem — DevFlow Agency')
    expect(screen.queryByText(/PERSISTENT_INTERNAL_ERROR/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Strona główna' })).toBeVisible()
  })

  it('keeps application navigation and notifications mounted and clears the error on another route', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const failure = new Error('PRIVATE_RENDER_DETAILS')
    const onCaughtError = vi.fn()
    function BrokenPage(): never {
      throw failure
    }
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/app/projects']}>
          <Routes>
            <Route path="app" element={<AppLayout />}>
              <Route path="projects" element={<BrokenPage />} />
              <Route path="clients" element={<h1 id="route-title">Klienci</h1>} />
            </Route>
          </Routes>
          <RouteEffects />
        </MemoryRouter>
        <Toaster />
      </ThemeProvider>,
      { onCaughtError },
    )
    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Nie udało się wyświetlić tej strony.',
    )
    expect(document.title).toBe('Wystąpił problem — DevFlow Agency')
    expect(screen.getByRole('region', { name: 'Powiadomienia (Alt+T)' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Nawigacja aplikacji' })
    await user.click(within(nav).getByRole('link', { name: /Klienci/ }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Klienci')
    expect(document.title).toBe('Klienci — DevFlow Agency')
    expect(screen.getByRole('main')).toHaveFocus()
    expect(onCaughtError).toHaveBeenCalledTimes(1)
  })

  it('retries a page in place and restores its title and focus', async () => {
    const user = userEvent.setup()
    const onCaughtError = vi.fn()
    let broken = true
    function Page() {
      if (broken) throw new Error('RETRY_ONLY_ERROR')
      return <h1 id="route-title">Projekty</h1>
    }
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/app/projects']}>
          <Routes>
            <Route path="app" element={<AppLayout />}>
              <Route path="projects" element={<Page />} />
            </Route>
          </Routes>
          <RouteEffects />
        </MemoryRouter>
      </ThemeProvider>,
      { onCaughtError },
    )
    broken = false
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Projekty')
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus())
    await waitFor(() => expect(document.title).toBe('Projekty — DevFlow Agency'))
  })

  it('allows an inline error to offer only an appropriate recovery action', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(
      <ErrorState
        title="Nie udało się pobrać wyników."
        description="Sprawdź połączenie i spróbuj ponownie."
        headingLevel={3}
        onRetry={onRetry}
      />,
    )
    const state = screen.getByRole('region', { name: 'Nie udało się pobrać wyników.' })
    expect(state).toHaveAccessibleDescription('Sprawdź połączenie i spróbuj ponownie.')
    expect(within(state).getByRole('heading', { level: 3 })).toBeVisible()
    await user.tab()
    await user.keyboard('{Enter}')
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
