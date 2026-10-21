import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthApiError } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { PasswordForm } from './password-form'

async function fill() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nowe hasło'), ' test-only-new password ')
  await user.type(screen.getByLabelText('Powtórz nowe hasło'), ' test-only-new password ')
  return user
}
describe('password forms', () => {
  it('requires the existing password for an authenticated change', async () => {
    const save = vi.fn()
    render(<PasswordForm onSave={save} />)
    const user = await fill()
    await user.click(screen.getByRole('button', { name: 'Zapisz nowe hasło' }))
    expect(await screen.findByText('Wpisz obecne hasło.')).toBeVisible()
    expect(screen.getByLabelText('Obecne hasło')).toHaveFocus()
    expect(save).not.toHaveBeenCalled()
  })
  it('preserves password whitespace, clears secrets and focuses successful feedback', async () => {
    const save = vi.fn().mockResolvedValue({ otherSessionsRevoked: true })
    render(<PasswordForm recovery onSave={save} />)
    const user = await fill()
    await user.click(screen.getByRole('button', { name: 'Zapisz nowe hasło' }))
    expect(save).toHaveBeenCalledWith({
      currentPassword: '',
      password: ' test-only-new password ',
      confirmPassword: ' test-only-new password ',
    })
    expect(screen.queryByLabelText('Nowe hasło')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('status')).toHaveFocus())
  })
  it('keeps retry available and hides arbitrary server error descriptions', async () => {
    const save = vi.fn().mockRejectedValue(new AuthApiError('PRIVATE', 422, 'same_password'))
    render(<PasswordForm recovery onSave={save} />)
    const user = await fill()
    await user.click(screen.getByRole('button', { name: 'Zapisz nowe hasło' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nowe hasło musi różnić się od obecnego.',
    )
    expect(screen.queryByText('PRIVATE')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zapisz nowe hasło' })).toBeEnabled()
  })
})
