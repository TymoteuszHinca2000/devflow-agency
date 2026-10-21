import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'
import { EmptyState } from './empty-state'
import { LoadingState } from './loading-state'

describe('Shared content states', () => {
  it('replaces a busy view with an actionable empty state without moving keyboard focus', async () => {
    const user = userEvent.setup()
    const clearFilters = vi.fn()
    function Content() {
      const [loading, setLoading] = useState(true)
      return (
        <>
          <Button onClick={() => setLoading(false)}>Zakończ ładowanie</Button>
          {loading ? (
            <LoadingState label="Ładowanie wyników…" />
          ) : (
            <EmptyState title="Brak wyników" description="Zmień kryteria wyszukiwania.">
              <Button onClick={clearFilters}>Wyczyść filtry</Button>
            </EmptyState>
          )}
        </>
      )
    }
    render(<Content />)
    expect(screen.getByRole('status')).toHaveTextContent('Ładowanie wyników…')
    const content = screen.getByRole('group', { name: 'Wczytywana zawartość' })
    expect(content).toHaveAttribute('aria-busy', 'true')
    expect(within(content).queryByRole('status')).not.toBeInTheDocument()
    const finish = screen.getByRole('button', { name: 'Zakończ ładowanie' })
    await user.click(finish)
    expect(finish).toHaveFocus()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Wczytywana zawartość' })).not.toBeInTheDocument()
    const empty = screen.getByRole('region', { name: 'Brak wyników' })
    expect(empty).toHaveAccessibleDescription('Zmień kryteria wyszukiwania.')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Wyczyść filtry' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(clearFilters).toHaveBeenCalledOnce()
  })

  it('associates each empty region with its own description and supports nested headings', () => {
    render(
      <>
        <EmptyState headingLevel={3} title="Brak wyników" description="Wybierz inny zakres dat." />
        <EmptyState headingLevel={3} title="Brak wyników" description="Wyczyść wybrane filtry." />
      </>,
    )
    const regions = screen.getAllByRole('region', { name: 'Brak wyników' })
    expect(regions[0]).toHaveAccessibleDescription('Wybierz inny zakres dat.')
    expect(regions[1]).toHaveAccessibleDescription('Wyczyść wybrane filtry.')
    expect(screen.getAllByRole('heading', { level: 3, name: 'Brak wyników' })).toHaveLength(2)
  })
})
