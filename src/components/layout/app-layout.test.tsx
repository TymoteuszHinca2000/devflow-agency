import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '@/app/app-routes'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { TestAuthProvider } from '@/test/test-auth-provider'

function renderWorkspace(path: string) {
  render(
    <ThemeProvider>
      <TestAuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </TestAuthProvider>
    </ThemeProvider>,
  )
}

beforeEach(() => vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined))
afterEach(() => vi.restoreAllMocks())

describe('Application layout', () => {
  it('updates the current navigation item and breadcrumb when the user changes modules', async () => {
    const user = userEvent.setup()
    renderWorkspace('/app')
    const nav = screen.getByRole('navigation', { name: 'Nawigacja aplikacji' })
    expect(within(nav).getByRole('link', { name: 'Wszystkie moduły' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await user.click(within(nav).getByRole('link', { name: 'Klienci' }))
    expect(within(nav).getByRole('link', { name: 'Wszystkie moduły' })).not.toHaveAttribute(
      'aria-current',
    )
    expect(within(nav).getByRole('link', { name: 'Klienci' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      within(screen.getByRole('navigation', { name: 'Ścieżka strony' })).getByText('Klienci'),
    ).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('closes the mobile menu on navigation and restores its trigger after Escape', async () => {
    const user = userEvent.setup()
    renderWorkspace('/app/projects')
    await user.click(screen.getByRole('button', { name: 'Otwórz menu aplikacji' }))
    const menu = screen.getByRole('dialog', { name: 'Menu aplikacji' })
    expect(within(menu).getByRole('link', { name: 'Projekty' })).toHaveFocus()
    await user.click(within(menu).getByRole('link', { name: 'Klienci' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus())
    expect(screen.getByRole('heading', { level: 1, name: 'Klienci' })).toBeVisible()
    const trigger = screen.getByRole('button', { name: 'Otwórz menu aplikacji' })
    await user.click(trigger)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveFocus())
  })
})
