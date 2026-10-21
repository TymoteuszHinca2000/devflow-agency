import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { AppRoutes } from './app-routes'

function renderRoute(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => vi.restoreAllMocks())

describe('Application routing', () => {
  it('keeps the selected theme and focuses the next page when opening a module', async () => {
    const user = userEvent.setup()
    renderRoute('/app')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Motyw kolorystyczny' }), 'dark')
    await user.click(
      within(screen.getByRole('navigation', { name: 'Moduły aplikacji' })).getByRole('link', {
        name: /Klienci/,
      }),
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Klienci' })).toBeVisible()
    expect(screen.getByText('Ten moduł jest w planie.')).toBeVisible()
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus())
    expect(document.title).toBe('Klienci — DevFlow Agency')
    expect(screen.getByRole('combobox', { name: 'Motyw kolorystyczny' })).toHaveValue('dark')
    await user.click(
      within(screen.getByRole('main')).getByRole('link', { name: 'Wszystkie moduły' }),
    )
    expect(screen.getByRole('navigation', { name: 'Moduły aplikacji' })).toBeVisible()
  })

  it('shows a recovery page for an unknown nested address instead of a module preview', async () => {
    const user = userEvent.setup()
    renderRoute('/app/projects/unknown')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nie znaleźliśmy tej strony.' }),
    ).toBeVisible()
    expect(document.title).toBe('Nie znaleźliśmy tej strony. — DevFlow Agency')
    await user.click(screen.getByRole('link', { name: 'Przejdź do modułów' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Miejsce na Twój flow.' })).toBeVisible()
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('still opens a direct module address with a malformed URL fragment', () => {
    renderRoute('/app/projects#%ZZ')
    expect(screen.getByRole('heading', { level: 1, name: 'Projekty' })).toBeVisible()
    expect(screen.getByRole('main')).toHaveFocus()
  })
})
