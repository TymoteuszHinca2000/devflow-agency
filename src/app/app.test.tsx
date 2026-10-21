import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './app'

describe('DevFlow welcome screen', () => {
  it('presents a single main landmark and labels the product as under development', () => {
    render(<App />)
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: /Twoja agencja/ })).toBeVisible()
    expect(screen.getByText('W budowie')).toBeVisible()
    expect(screen.getByRole('figure', { name: /Wizja produktu/ })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Poznaj możliwości' })).toHaveAttribute(
      'href',
      '#mozliwosci',
    )
    expect(screen.getByRole('link', { name: 'Zobacz plan' })).toHaveAttribute(
      'href',
      '#plan-rozwoju',
    )
    expect(screen.getByRole('region', { name: /Dobry flow/ })).toBeVisible()
  })

  it('closes the navigation with Escape and returns focus to its toggle', async () => {
    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getByRole('button', { name: 'Otwórz nawigację' })

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })
})
