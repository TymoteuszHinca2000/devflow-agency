import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Label } from './label'

describe('Shared UI primitives', () => {
  it('does not submit a form by default and respects disabled actions', async () => {
    const user = userEvent.setup()
    const submit = vi.fn()
    const action = vi.fn()
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <Button onClick={action}>Sprawdź</Button>
        <Button disabled onClick={action}>
          Niedostępne
        </Button>
        <Button type="submit">Zapisz</Button>
      </form>,
    )
    await user.click(screen.getByRole('button', { name: 'Sprawdź' }))
    expect(action).toHaveBeenCalledTimes(1)
    expect(submit).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Niedostępne' }))
    expect(action).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Zapisz' }))
    expect(submit).toHaveBeenCalledTimes(1)
  })

  it('keeps navigation semantics when a button is composed with a link', () => {
    render(
      <Button asChild>
        <a href="#details">Przejdź do szczegółów</a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'Przejdź do szczegółów' })).toHaveAttribute(
      'href',
      '#details',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('connects a field to its label and error description and forwards its ref', async () => {
    const user = userEvent.setup()
    const fieldRef = createRef<HTMLInputElement>()
    render(
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Dane kontaktowe</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="contact-email">Adres e-mail</Label>
          <Input
            id="contact-email"
            ref={fieldRef}
            type="email"
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <p id="email-error">Podaj prawidłowy adres e-mail.</p>
          <Label htmlFor="locked-field">Pole zablokowane</Label>
          <Input id="locked-field" disabled defaultValue="Wartość" />
        </CardContent>
      </Card>,
    )
    const field = screen.getByRole('textbox', { name: 'Adres e-mail' })
    await user.click(screen.getByText('Adres e-mail', { exact: true }))
    expect(field).toHaveFocus()
    expect(fieldRef.current).toBe(field)
    expect(field).toHaveAccessibleDescription('Podaj prawidłowy adres e-mail.')
    expect(field).toBeInvalid()
    await user.type(field, 'hello@example.com')
    expect(field).toHaveValue('hello@example.com')
    const locked = screen.getByRole('textbox', { name: 'Pole zablokowane' })
    await user.type(locked, 'Zmiana')
    expect(locked).toHaveValue('Wartość')
  })
})
