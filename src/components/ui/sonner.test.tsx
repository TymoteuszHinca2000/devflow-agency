import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { notify, dismissNotification } from '@/lib/notify'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { ThemeSelector } from '@/components/shared/theme-selector'
import { Button } from './button'
import { Toaster } from './sonner'

describe('Notifications', () => {
  it('updates a single notification and runs its action once without taking focus on arrival', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <ThemeProvider>
        <Button onClick={() => notify('Pierwszy komunikat', { id: 'operation' })}>Pokaż</Button>
        <Button
          onClick={() =>
            notify('Aktualny komunikat', {
              id: 'operation',
              description: 'Opis kolejnego kroku.',
              action: { label: 'Wykonaj akcję', onClick: onAction },
            })
          }
        >
          Aktualizuj
        </Button>
        <Button onClick={() => notify('Komunikat bez akcji', { id: 'operation' })}>
          Usuń akcję
        </Button>
        <Toaster />
      </ThemeProvider>,
    )
    const trigger = screen.getByRole('button', { name: 'Pokaż' })
    await user.click(trigger)
    const region = screen.getByRole('region', { name: 'Powiadomienia (Alt+T)' })
    expect(region).toHaveAttribute('aria-live', 'polite')
    await within(region).findByText('Pierwszy komunikat')
    expect(trigger).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Aktualizuj' }))
    await within(region).findByText('Aktualny komunikat')
    expect(within(region).getAllByRole('listitem')).toHaveLength(1)
    expect(within(region).queryByText('Pierwszy komunikat')).not.toBeInTheDocument()
    expect(within(region).getByText('Opis kolejnego kroku.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Usuń akcję' }))
    await within(region).findByText('Komunikat bez akcji')
    expect(within(region).queryByRole('button', { name: 'Wykonaj akcję' })).not.toBeInTheDocument()
    expect(within(region).queryByText('Opis kolejnego kroku.')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Aktualizuj' }))
    await within(region).findByText('Aktualny komunikat')
    await user.keyboard('{Alt>}t{/Alt}')
    await user.tab()
    await user.tab()
    await user.tab()
    expect(within(region).getByRole('button', { name: 'Wykonaj akcję' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onAction).toHaveBeenCalledExactlyOnceWith()
    await waitFor(() => expect(within(region).queryByRole('listitem')).not.toBeInTheDocument())
  })

  it('supports the notification shortcut, Escape return and keyboard dismissal', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <Button onClick={() => notify('Sprawdź dane.', { kind: 'warning' })}>
          Pokaż ostrzeżenie
        </Button>
        <Toaster />
      </ThemeProvider>,
    )
    const trigger = screen.getByRole('button', { name: 'Pokaż ostrzeżenie' })
    await user.click(trigger)
    const region = screen.getByRole('region', { name: 'Powiadomienia (Alt+T)' })
    await within(region).findByText('Sprawdź dane.')
    await user.keyboard('{Alt>}t{/Alt}')
    expect(within(region).getByRole('list')).toHaveFocus()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(within(region).getByText('Sprawdź dane.')).toBeVisible()
    await user.keyboard('{Alt>}t{/Alt}')
    await user.tab()
    await user.tab()
    expect(within(region).getByRole('button', { name: 'Zamknij powiadomienie' })).toHaveFocus()
    await user.keyboard('{Enter}')
    await waitFor(() => expect(within(region).queryByRole('listitem')).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('keeps a notification while changing the app theme and allows explicit dismissal', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeSelector />
        <Button onClick={() => notify('Operacja wymaga uwagi.', { id: 'notice', kind: 'error' })}>
          Pokaż błąd
        </Button>
        <Button onClick={() => dismissNotification('notice')}>Usuń komunikat</Button>
        <Toaster />
      </ThemeProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Pokaż błąd' }))
    await screen.findByText('Operacja wymaga uwagi.')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Motyw kolorystyczny' }), 'dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(screen.getByText('Operacja wymaga uwagi.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Usuń komunikat' }))
    await waitFor(() =>
      expect(screen.queryByText('Operacja wymaga uwagi.')).not.toBeInTheDocument(),
    )
  })
})
