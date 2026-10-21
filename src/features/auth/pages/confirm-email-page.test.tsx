import { StrictMode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { RouteLayout } from '@/components/layout/route-layout'
import { TestAuthProvider } from '@/test/test-auth-provider'
import { exchangeConfirmationCode } from '../services/registration-service'
import { ConfirmEmailPage } from './confirm-email-page'

vi.mock('../services/registration-service', () => ({ exchangeConfirmationCode: vi.fn() }))
beforeEach(() => vi.mocked(exchangeConfirmationCode).mockReset())
function CurrentAddress() {
  const location = useLocation()
  return (
    <output aria-label="Bieżący adres">
      {location.pathname + location.search + location.hash}
    </output>
  )
}
function renderCallback(path: string, signedIn = false) {
  return render(
    <StrictMode>
      <ThemeProvider>
        <TestAuthProvider
          {...(signedIn ? {} : { state: { status: 'signed-out', expired: false } })}
        >
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route element={<RouteLayout />}>
                <Route path="auth/confirm" element={<ConfirmEmailPage />} />
                <Route path="login" element={<h1 id="route-title">Logowanie</h1>} />
              </Route>
            </Routes>
            <CurrentAddress />
          </MemoryRouter>
        </TestAuthProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
describe('confirmation callback page', () => {
  it('keeps an unconsumed code reloadable, exchanges only on interaction and cleans it afterwards', async () => {
    renderCallback(
      '/auth/confirm?code=test-only-confirmation-code-123&sb_flow_id=flow-123456&returnTo=%2Fapp%2Ftasks',
    )
    expect(screen.getByLabelText('Bieżący adres')).toHaveTextContent(
      'code=test-only-confirmation-code-123',
    )
    expect(exchangeConfirmationCode).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Dokończ logowanie' }))
    await waitFor(() =>
      expect(exchangeConfirmationCode).toHaveBeenCalledExactlyOnceWith(
        'test-only-confirmation-code-123',
        'flow-123456',
      ),
    )
    await waitFor(() =>
      expect(screen.getByLabelText('Bieżący adres')).not.toHaveTextContent('code='),
    )
    expect(screen.getByLabelText('Bieżący adres')).toHaveTextContent(
      '/login?returnTo=%2Fapp%2Ftasks&notice=confirmation-complete',
    )
  })
  it('does not display or exchange untrusted errors and removes fragments', async () => {
    renderCallback('/auth/confirm#error=access_denied&error_description=PRIVATE-DETAIL')
    expect(screen.getByRole('heading', { name: 'Sprawdź swój link.' })).toBeVisible()
    await waitFor(() => expect(screen.queryByText(/PRIVATE-DETAIL/)).not.toBeInTheDocument())
    expect(screen.getByLabelText('Bieżący adres')).not.toHaveTextContent('#')
    expect(exchangeConfirmationCode).not.toHaveBeenCalled()
  })
  it('does not silently replace an existing signed-in account', () => {
    renderCallback('/auth/confirm?code=test-only-confirmation-code-123', true)
    expect(screen.getByRole('heading', { name: 'Masz aktywną sesję.' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Dokończ logowanie' })).not.toBeInTheDocument()
    expect(exchangeConfirmationCode).not.toHaveBeenCalled()
  })
})
