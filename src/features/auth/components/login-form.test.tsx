import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthApiError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signInWithEmail } from '../services/auth-service'
import { LoginForm } from './login-form'

vi.mock('../services/auth-service', () => ({ signInWithEmail: vi.fn() }))
beforeEach(() => {
  vi.mocked(signInWithEmail).mockReset()
})

describe('email login form', () => {
  it('validates and focuses the first invalid field without sending credentials', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }))
    expect(await screen.findByText('Wpisz poprawny adres e-mail.')).toBeVisible()
    expect(screen.getByText('Wpisz hasło.')).toBeVisible()
    expect(screen.getByLabelText('Adres e-mail')).toHaveFocus()
    expect(signInWithEmail).not.toHaveBeenCalled()
  })
  it('normalizes email but preserves every password character', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Adres e-mail'), ' PERSON@Example.test ')
    await user.type(screen.getByLabelText('Hasło', { exact: true }), ' password with spaces ')
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }))
    await waitFor(() =>
      expect(signInWithEmail).toHaveBeenCalledWith({
        email: 'person@example.test',
        password: ' password with spaces ',
      }),
    )
  })
  it('toggles password visibility without changing its value', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const password = screen.getByLabelText('Hasło', { exact: true })
    await user.type(password, 'test-only-password')
    await user.click(screen.getByRole('button', { name: 'Pokaż hasło' }))
    expect(password).toHaveAttribute('type', 'text')
    expect(password).toHaveValue('test-only-password')
    await user.click(screen.getByRole('button', { name: 'Ukryj hasło' }))
    expect(password).toHaveAttribute('type', 'password')
  })
  it('shows a safe error and focuses the alert after a rejected login', async () => {
    vi.mocked(signInWithEmail).mockRejectedValue(
      new AuthApiError('private backend detail', 400, 'invalid_credentials'),
    )
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Adres e-mail'), 'person@example.test')
    await user.type(screen.getByLabelText('Hasło', { exact: true }), 'test-only-password')
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }))
    const error = await screen.findByRole('alert')
    expect(error).toHaveTextContent('Nieprawidłowy adres e-mail lub hasło.')
    expect(error).not.toHaveTextContent('private backend detail')
    await waitFor(() => expect(error).toHaveFocus())
  })
  it('blocks duplicate submission while the request is pending', async () => {
    let complete: () => void = () => {
      throw new Error('Request not started')
    }
    vi.mocked(signInWithEmail).mockReturnValue(
      new Promise<void>((resolve) => {
        complete = resolve
      }),
    )
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Adres e-mail'), 'person@example.test')
    await user.type(screen.getByLabelText('Hasło', { exact: true }), 'test-only-password')
    await user.dblClick(screen.getByRole('button', { name: 'Zaloguj się' }))
    expect(signInWithEmail).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Logowanie…' })).toBeDisabled()
    complete()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Zaloguj się' })).toBeEnabled())
  })
})
