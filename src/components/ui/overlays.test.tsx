import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Button } from './button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { Input } from './input'
import { Label } from './label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from './sheet'

const overlays = [
  {
    name: 'Dialog',
    Root: Dialog,
    Trigger: DialogTrigger,
    Content: DialogContent,
    Title: DialogTitle,
    Description: DialogDescription,
    Close: DialogClose,
    closeLabel: 'Zamknij okno',
  },
  {
    name: 'Sheet',
    Root: Sheet,
    Trigger: SheetTrigger,
    Content: SheetContent,
    Title: SheetTitle,
    Description: SheetDescription,
    Close: SheetClose,
    closeLabel: 'Zamknij panel',
  },
] as const

describe.each(overlays)(
  '$name',
  ({ Root, Trigger, Content, Title, Description, Close, closeLabel }) => {
    it('announces its purpose, traps focus and restores it after Escape', async () => {
      const user = userEvent.setup()
      render(
        <Root>
          <Trigger asChild>
            <Button>Otwórz szczegóły</Button>
          </Trigger>
          <Content>
            <Title>Szczegóły projektu</Title>
            <Description>Przejrzyj informacje i wróć do poprzedniego widoku.</Description>
            <Label htmlFor="overlay-name">Nazwa</Label>
            <Input id="overlay-name" />
          </Content>
        </Root>,
      )
      const trigger = screen.getByRole('button', { name: 'Otwórz szczegóły' })
      await user.click(trigger)
      const dialog = screen.getByRole('dialog', { name: 'Szczegóły projektu' })
      expect(dialog).toHaveAccessibleDescription(
        'Przejrzyj informacje i wróć do poprzedniego widoku.',
      )
      const field = within(dialog).getByRole('textbox', { name: 'Nazwa' })
      await waitFor(() => expect(field).toHaveFocus())
      expect(screen.queryByRole('button', { name: 'Otwórz szczegóły' })).not.toBeInTheDocument()
      await user.tab({ shift: true })
      expect(within(dialog).getByRole('button', { name: closeLabel })).toHaveFocus()
      await user.tab()
      expect(field).toHaveFocus()
      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      await waitFor(() => expect(trigger).toHaveFocus())
    })

    it('supports a custom close action without the default close button', async () => {
      const user = userEvent.setup()
      render(
        <Root>
          <Trigger asChild>
            <Button>Otwórz panel</Button>
          </Trigger>
          <Content showCloseButton={false}>
            <Title>Informacje</Title>
            <Description>Możesz wrócić do poprzedniego widoku.</Description>
            <Close asChild>
              <Button variant="outline">Wróć</Button>
            </Close>
          </Content>
        </Root>,
      )
      const trigger = screen.getByRole('button', { name: 'Otwórz panel' })
      await user.click(trigger)
      expect(screen.queryByRole('button', { name: closeLabel })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Wróć' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      await waitFor(() => expect(trigger).toHaveFocus())
    })
  },
)
