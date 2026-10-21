import { expect, test } from './fixtures'

test('opens the planned catalog through the hero and header links', async ({ page, isMobile }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Poznaj możliwości' }).click()
  await expect(page).toHaveURL(/#mozliwosci$/)
  await expect(page.getByRole('heading', { name: /Wszystko, co porusza/ })).toBeInViewport()
  await expect(
    page.getByRole('list', { name: 'Planowane moduły' }).getByRole('listitem'),
  ).toHaveCount(6)
  await expect(page.getByText(/Moduły są w planie/)).toBeVisible()

  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Nawigacja główna' })
  if (isMobile) await page.getByRole('button', { name: 'Otwórz nawigację' }).click()
  await nav.getByRole('link', { name: 'Możliwości', exact: true }).click()
  await expect(page).toHaveURL(/#mozliwosci$/)
  if (isMobile) await expect(nav).toBeHidden()
})

test('filters work and client modules and restores the complete catalog', async ({ page }) => {
  await page.goto('/')
  const catalog = page.getByRole('list', { name: 'Planowane moduły' })
  await page.getByRole('button', { name: 'Praca zespołu' }).click()
  await expect(catalog.getByRole('listitem')).toHaveCount(3)
  await expect(catalog.getByRole('heading', { name: 'Projekty' })).toBeVisible()
  await expect(catalog.getByRole('heading', { name: 'Klienci' })).toHaveCount(0)
  await expect(page.getByRole('status')).toHaveText('3 planowane moduły')

  await page.getByRole('button', { name: 'Relacje z klientami' }).click()
  await expect(catalog.getByRole('listitem')).toHaveCount(3)
  await expect(catalog.getByRole('heading', { name: 'Klienci' })).toBeVisible()
  await expect(catalog.getByRole('heading', { name: 'Projekty' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Wszystkie' }).click()
  await expect(catalog.getByRole('listitem')).toHaveCount(6)
  await expect(page.getByRole('status')).toHaveText('6 planowanych modułów')
})

test('changes filters with the keyboard and keeps focus on the chosen button', async ({ page }) => {
  await page.goto('/')
  const workFilter = page.getByRole('button', { name: 'Praca zespołu' })
  await workFilter.focus()
  await page.keyboard.press('Space')
  await expect(workFilter).toBeFocused()
  await expect(workFilter).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status')).toHaveText('3 planowane moduły')

  await page.keyboard.press('Tab')
  const clientFilter = page.getByRole('button', { name: 'Relacje z klientami' })
  await expect(clientFilter).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(clientFilter).toBeFocused()
  await expect(
    page.getByRole('list', { name: 'Planowane moduły' }).getByRole('heading', { name: 'Klienci' }),
  ).toBeVisible()

  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('button', { name: 'Wszystkie' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toHaveText('6 planowanych modułów')
})
