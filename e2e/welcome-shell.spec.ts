import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './fixtures'

test('supports keyboard access through the skip link and main action', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Przejdź do treści' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /Zobacz projekt/ })).toBeFocused()
})

test('adapts navigation to the device and restores focus after Escape', async ({
  page,
  isMobile,
}) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Nawigacja główna' })
  const toggle = page.getByRole('button', { name: 'Otwórz nawigację' })
  if (!isMobile) {
    await expect(toggle).toBeHidden()
    await expect(nav.getByRole('link', { name: 'Start', exact: true })).toBeVisible()
    return
  }

  await expect(nav).toBeHidden()
  await toggle.click()
  await expect(nav).toBeVisible()
  await nav.getByRole('link', { name: 'Start', exact: true }).click()
  await expect(page).toHaveURL(/#main-content$/)
  await expect(nav).toBeHidden()
  await toggle.click()
  await page.keyboard.press('Escape')
  await expect(nav).toBeHidden()
  await expect(toggle).toBeFocused()
})

test('fits compact and tablet screens with working anchors and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
    ).toBe('auto')
    const missingTargets = await page
      .locator('a[href^="#"]')
      .evaluateAll((anchors) =>
        anchors
          .map((anchor) => anchor.getAttribute('href') ?? '')
          .filter((href) => !document.getElementById(href.slice(1))),
      )
    expect(missingTargets).toEqual([])
  }
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`has no automatically detected WCAG A/AA violations in ${colorScheme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(result.violations).toEqual([])
  })
}
