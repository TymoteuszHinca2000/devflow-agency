import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { TestAuthProvider } from '@/test/test-auth-provider'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import type { AuthState } from '../session/auth-state'
import { RequireAuth } from './require-auth'

function Destination() {
  const location = useLocation()
  return <p>{location.pathname + location.search}</p>
}
function renderGuard(state: AuthState, retry = vi.fn()) {
  render(
    <ThemeProvider>
      <TestAuthProvider state={state} retry={retry}>
        <MemoryRouter initialEntries={['/app/projects?view=list#work']}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route path="app" element={<Outlet />}>
                <Route path="projects" element={<h1>Private content</h1>} />
              </Route>
            </Route>
            <Route path="login" element={<Destination />} />
          </Routes>
        </MemoryRouter>
      </TestAuthProvider>
    </ThemeProvider>,
  )
}

describe('private application routes', () => {
  it('does not expose a module while identity verification is pending', () => {
    renderGuard({ status: 'loading' })
    expect(screen.getByRole('status')).toHaveTextContent('sprawdzanie dostępu')
    expect(screen.queryByText('Private content')).not.toBeInTheDocument()
  })
  it('redirects signed-out visitors with their original local destination', () => {
    renderGuard({ status: 'signed-out', expired: false })
    expect(screen.getByText('/login?returnTo=%2Fapp%2Fprojects%3Fview%3Dlist%23work')).toBeVisible()
    expect(screen.queryByText('Private content')).not.toBeInTheDocument()
  })
  it('keeps a failed verification closed and offers retry', async () => {
    const retry = vi.fn()
    const user = userEvent.setup()
    renderGuard({ status: 'error', message: 'Test connection failure' }, retry)
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }))
    expect(retry).toHaveBeenCalledOnce()
    expect(screen.queryByText('Private content')).not.toBeInTheDocument()
  })
})
