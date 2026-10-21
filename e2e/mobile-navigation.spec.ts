import { expect, test } from './fixtures'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
})

test('contains keyboard focus, locks background scrolling and restores focus after Escape', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Otwórz nawigację' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Nawigacja', exact: true })
  await expect(dialog).toHaveAccessibleDescription('Przejdź do sekcji lub wybierz motyw.')
  const firstLink = dialog.getByRole('link', { name: 'Start', exact: true })
  await expect(firstLink).toBeFocused()
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  await expect(page.getByRole('main')).toHaveCount(0)
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Zamknij nawigację' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(firstLink).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('closes through its button and backdrop without leaving scroll locked', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Otwórz nawigację' })
  await trigger.click()
  await page.getByRole('button', { name: 'Zamknij nawigację' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('dialog').evaluate(async (dialog) => {
    await Promise.all(dialog.getAnimations().map((animation) => animation.finished))
  })
  await page.locator('[data-slot="dialog-overlay"]').click({ position: { x: 4, y: 200 } })
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('moves focus and scroll to the section selected in the menu', async ({ page }) => {
  await page.getByRole('button', { name: 'Otwórz nawigację' }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'Możliwości', exact: true }).click()
  await expect(page).toHaveURL(/#mozliwosci$/)
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('#mozliwosci')).toBeFocused()
  await expect(page.getByRole('heading', { name: /Wszystko, co porusza/ })).toBeInViewport()
})

test('closes when desktop navigation becomes available and releases the modal state', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Otwórz nawigację' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.setViewportSize({ width: 1001, height: 844 })
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Start', exact: true }),
  ).toBeFocused()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await expect(page.getByRole('main')).toBeVisible()
})

test('keeps the theme selector usable in a compact landscape viewport with reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 320, height: 320 })
  await page.getByRole('button', { name: 'Otwórz nawigację' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toHaveCSS('animation-name', 'none')
  const selector = dialog.getByRole('combobox', { name: 'Motyw kolorystyczny' })
  await selector.scrollIntoViewIfNeeded()
  await expect(selector).toBeInViewport()
  await selector.selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
