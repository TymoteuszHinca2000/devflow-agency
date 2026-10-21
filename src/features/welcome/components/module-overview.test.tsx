import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ModuleOverview } from './module-overview'

describe('Planned module catalog', () => {
  it('shows the full catalog as planned functionality', () => {
    render(<ModuleOverview />)
    const catalog = within(screen.getByRole('list', { name: 'Planowane moduły' }))
    expect(catalog.getAllByRole('listitem')).toHaveLength(6)
    expect(catalog.getByRole('heading', { name: 'Projekty' })).toBeVisible()
    expect(catalog.getByRole('heading', { name: 'Portal klienta' })).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('6 planowanych modułów')
    expect(screen.getByText(/Moduły są w planie/)).toBeVisible()
  })

  it('filters by audience, announces the count and restores all modules', async () => {
    const user = userEvent.setup()
    render(<ModuleOverview />)
    const catalog = within(screen.getByRole('list', { name: 'Planowane moduły' }))

    await user.click(screen.getByRole('button', { name: 'Praca zespołu' }))
    expect(catalog.getAllByRole('listitem')).toHaveLength(3)
    expect(catalog.getByRole('heading', { name: 'Projekty' })).toBeVisible()
    expect(catalog.getByRole('heading', { name: 'Zadania i Kanban' })).toBeVisible()
    expect(catalog.getByRole('heading', { name: 'Czas pracy' })).toBeVisible()
    expect(catalog.queryByRole('heading', { name: 'Klienci' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Praca zespołu' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('status')).toHaveTextContent('3 planowane moduły')

    await user.click(screen.getByRole('button', { name: 'Relacje z klientami' }))
    expect(catalog.getAllByRole('listitem')).toHaveLength(3)
    expect(catalog.getByRole('heading', { name: 'Klienci' })).toBeVisible()
    expect(catalog.getByRole('heading', { name: 'Wyceny' })).toBeVisible()
    expect(catalog.getByRole('heading', { name: 'Portal klienta' })).toBeVisible()
    expect(catalog.queryByRole('heading', { name: 'Projekty' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Wszystkie' }))
    expect(catalog.getAllByRole('listitem')).toHaveLength(6)
    expect(screen.getByRole('status')).toHaveTextContent('6 planowanych modułów')
  })
})
