import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './app'

describe('Application entry point', () => {
  it('renders one named main landmark and the product heading', () => {
    render(<App />)
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'DevFlow Agency' })).toBeVisible()
  })
})
