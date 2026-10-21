import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthApiError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerWithEmail } from '../services/registration-service'
import { RegistrationForm } from './registration-form'

vi.mock('../services/registration-service', () => ({ registerWithEmail: vi.fn() }))
beforeEach(() => {
  vi.mocked(registerWithEmail).mockReset()
})

async function fillForm(password = 'unique-test-only-password') {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Imię lub nazwa'), ' Test Person ')
  await user.type(screen.getByLabelText('Adres e-mail'), ' PERSON@Example.test ')
  await user.type(screen.getByLabelText('Hasło', { exact: true }), password)
  await user.type(screen.getByLabelText('Powtórz hasło', { exact: true }), password)
  return user
}

describe('email registration form', () => {
  it('validates before requesting an account and focuses the first invalid field', async () => {
    render(<RegistrationForm returnTo="/app" onSubmitted={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Utwórz konto' }))
    expect(await screen.findByText('Wpisz imię lub nazwę.')).toBeVisible()
    expect(screen.getByLabelText('Imię lub nazwa')).toHaveFocus()
    expect(registerWithEmail).not.toHaveBeenCalled()
  })
  it('rejects a short password and a non-matching confirmation', async () => {
    render(<RegistrationForm returnTo="/app" onSubmitted={vi.fn()} />)
    const user = await fillForm('short')
    await user.type(screen.getByLabelText('Powtórz hasło', { exact: true }), '-different')
    await user.click(screen.getByRole('button', { name: 'Utwórz konto' }))
    expect(await screen.findByText('Użyj co najmniej 12 znaków.')).toBeVisible()
    expect(screen.getByText('Hasła muszą być takie same.')).toBeVisible()
    expect(registerWithEmail).not.toHaveBeenCalled()
  })
  it('normalizes the name/email, preserves passwords and passes only email to the next page', async () => {
    const submitted = vi.fn()
    render(<RegistrationForm returnTo="/app/tasks" onSubmitted={submitted} />)
    const user = await fillForm(' test password with spaces ')
    await user.click(screen.getByRole('button', { name: 'Utwórz konto' }))
    await waitFor(() =>
      expect(registerWithEmail).toHaveBeenCalledWith(
        {
          displayName: 'Test Person',
          email: 'person@example.test',
          password: ' test password with spaces ',
          confirmPassword: ' test password with spaces ',
        },
        '/app/tasks',
      ),
    )
    expect(submitted).toHaveBeenCalledWith('person@example.test')
    expect(JSON.stringify(sessionStorage)).not.toContain('test password')
  })
  it('hides passwords and toggles the two fields independently', async () => {
    render(<RegistrationForm returnTo="/app" onSubmitted={vi.fn()} />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Pokaż powtórzone hasło' }))
    expect(screen.getByLabelText('Powtórz hasło', { exact: true })).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Hasło', { exact: true })).toHaveAttribute('type', 'password')
  })
  it('keeps the form available after an error, focuses feedback and does not echo server text', async () => {
    vi.mocked(registerWithEmail).mockRejectedValue(
      new AuthApiError('private backend detail', 422, 'weak_password'),
    )
    render(<RegistrationForm returnTo="/app" onSubmitted={vi.fn()} />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Utwórz konto' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('To hasło nie spełnia wymagań bezpieczeństwa.')
    expect(alert).not.toHaveTextContent('private backend detail')
    await waitFor(() => expect(alert).toHaveFocus())
  })
})
