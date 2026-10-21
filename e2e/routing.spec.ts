import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './fixtures'
test.use({ authState: 'signed-in' })

test('opens module routes without reloading and supports browser history with focus and theme', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() => Reflect.set(window, '__devflowRoutingCheck', 'mounted'))
  await page.getByRole('link', { name: 'Zobacz moduły aplikacji', exact: true }).click()
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole('main')).toBeFocused()
  await page.getByRole('combobox', { name: 'Motyw kolorystyczny' }).selectOption('dark')
  await page
    .getByRole('navigation', { name: 'Moduły aplikacji' })
    .getByRole('link', { name: /Projekty/ })
    .click()
  await expect(page).toHaveURL(/\/app\/projects$/)
  await expect(page).toHaveTitle('Projekty — DevFlow Agency')
  await expect(page.getByRole('main')).toBeFocused()
  expect(
    await page.evaluate(() => Reflect.get(window, '__devflowRoutingCheck') === 'mounted'),
  ).toBe(true)
  await page.goBack()
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole('main')).toBeFocused()
  await page.goForward()
  await expect(page).toHaveTitle('Projekty — DevFlow Agency')
  await expect(page.getByRole('combobox', { name: 'Motyw kolorystyczny' })).toHaveValue('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('opens every planned module directly and survives a deep-link refresh', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const modules = [
    ['dashboard', 'Dashboard'],
    ['organizations', 'Organizacje'],
    ['clients', 'Klienci'],
    ['projects', 'Projekty'],
    ['tasks', 'Zadania i Kanban'],
    ['time-tracking', 'Czas pracy'],
    ['quotes', 'Wyceny'],
    ['client-portal', 'Portal klienta'],
    ['notifications', 'Powiadomienia'],
    ['settings', 'Ustawienia'],
  ] as const
  for (const [path, title] of modules) {
    await page.goto(`/app/${path}`)
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
    await expect(page).toHaveTitle(`${title} — DevFlow Agency`)
    await expect(page.getByText('Ten moduł jest w planie.', { exact: true })).toBeVisible()
  }
  await page.goto('/app/projects/?view=list#%ZZ')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Projekty', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('handles unknown root and nested URLs and offers working recovery links', async ({ page }) => {
  await page.goto('/nieznana-strona')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nie znaleźliśmy tej strony.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Przejdź do modułów' }).click()
  await expect(page).toHaveURL(/\/app$/)
  await page.goto('/app/projects/unknown')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nie znaleźliśmy tej strony.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Strona główna', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1, name: /Twoja agencja/ })).toBeVisible()
})

test('returns from a module to the roadmap anchor and keeps native section navigation usable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/app/clients')
  await page.getByRole('link', { name: 'Zobacz plan rozwoju', exact: true }).click()
  await expect(page).toHaveURL(/\/#plan-rozwoju$/)
  await expect(page.locator('#plan-rozwoju')).toBeFocused()
  await expect(page.getByRole('heading', { name: /Dobry flow/ })).toBeInViewport()
  await page.getByRole('link', { name: 'Poznaj możliwości' }).click()
  await expect(page).toHaveURL(/#mozliwosci$/)
  await expect(page.getByRole('heading', { name: /Wszystko, co porusza/ })).toBeInViewport()
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`keeps route pages accessible and within the viewport in ${colorScheme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
    for (const path of ['/app', '/app/projects', '/nieznana-strona']) {
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready)
      await expect(page.getByRole('main')).toHaveCount(1)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(result.violations).toEqual([])
    }
    await page.setViewportSize({ width: 320, height: 700 })
    await page.goto('/app/projects')
    await expect(page.getByRole('heading', { name: 'Projekty', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Przejdź do treści' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Wszystkie moduły' })).toBeFocused()
  })
}
