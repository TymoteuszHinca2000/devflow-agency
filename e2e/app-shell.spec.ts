import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './fixtures'

test('marks only the current sidebar link, updates breadcrumbs and keeps navigation visible while scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/app/projects')
  const sidebar = page.getByRole('complementary', { name: 'Panel boczny' })
  const nav = sidebar.getByRole('navigation', { name: 'Nawigacja aplikacji' })
  await expect(page.getByRole('button', { name: 'Otwórz menu aplikacji' })).toBeHidden()
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(nav.getByRole('link', { name: 'Projekty', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await nav.getByRole('link', { name: 'Zadania i Kanban', exact: true }).click()
  await expect(
    page.getByRole('navigation', { name: 'Ścieżka strony' }).getByText('Zadania i Kanban'),
  ).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Zadania i Kanban', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(nav.getByRole('link', { name: 'Projekty', exact: true })).not.toHaveAttribute(
    'aria-current',
  )
  await page.goBack()
  await expect(nav.getByRole('link', { name: 'Projekty', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await nav.getByRole('link', { name: 'Wszystkie moduły' }).click()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(async () => (await sidebar.boundingBox())?.y).toBe(0)
  await expect.poll(async () => (await page.locator('.app-topbar').boundingBox())?.y).toBe(0)
  await expect(nav.getByRole('link', { name: 'Projekty', exact: true })).toBeInViewport()
})

test('contains mobile menu focus, blocks background interaction and returns focus after Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/app')
  const trigger = page.getByRole('button', { name: 'Otwórz menu aplikacji' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Menu aplikacji', exact: true })
  await expect(dialog).toHaveAccessibleDescription(
    'Wybierz obszar DevFlow. Moduły są w trakcie rozwoju.',
  )
  await expect(dialog.getByRole('link', { name: 'Wszystkie moduły' })).toBeFocused()
  await expect(page.getByRole('main')).toHaveCount(0)
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Zamknij menu aplikacji' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('link', { name: 'Wszystkie moduły' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('closes on selection of the current or another module and on browser history navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/app/projects')
  await page.getByRole('button', { name: 'Otwórz menu aplikacji' }).click()
  await expect(
    page.getByRole('dialog').getByRole('link', { name: 'Projekty', exact: true }),
  ).toBeFocused()
  await page.getByRole('dialog').getByRole('link', { name: 'Projekty', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.getByRole('main')).toBeFocused()
  await page.getByRole('button', { name: 'Otwórz menu aplikacji' }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'Klienci', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/clients$/)
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await page.getByRole('button', { name: 'Otwórz menu aplikacji' }).click()
  await page.goBack()
  await expect(page).toHaveURL(/\/app\/projects$/)
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.getByRole('main')).toBeFocused()
})

test('closes through its button and backdrop and transfers focus when resized to desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/app/projects')
  const trigger = page.getByRole('button', { name: 'Otwórz menu aplikacji' })
  await trigger.click()
  await page.getByRole('button', { name: 'Zamknij menu aplikacji' }).click()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCSS('opacity', '1')
  await page.mouse.click(388, 200)
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.setViewportSize({ width: 1001, height: 844 })
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(
    page
      .getByRole('navigation', { name: 'Nawigacja aplikacji' })
      .getByRole('link', { name: 'Projekty', exact: true }),
  ).toBeFocused()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(trigger).toBeVisible()
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('makes every navigation link reachable in short mobile and desktop viewports', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 320, height: 320 })
  await page.goto('/app/projects')
  await page.getByRole('button', { name: 'Otwórz menu aplikacji' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toHaveCSS('animation-name', 'none')
  const settings = dialog.getByRole('link', { name: 'Ustawienia', exact: true })
  await settings.scrollIntoViewIfNeeded()
  await expect(settings).toBeInViewport()
  await settings.click()
  await expect(page).toHaveURL(/\/app\/settings$/)
  await expect(page.getByRole('main')).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.setViewportSize({ width: 1280, height: 320 })
  const sidebar = page.getByRole('complementary', { name: 'Panel boczny' })
  await sidebar.getByRole('link', { name: 'Ustawienia', exact: true }).scrollIntoViewIfNeeded()
  await expect(sidebar.getByRole('link', { name: 'Ustawienia', exact: true })).toBeInViewport()
  await expect(sidebar.getByRole('link', { name: 'Powrót na stronę główną' })).toBeInViewport()
})

test('fits responsive breakpoints and passes audits with desktop navigation and mobile menus in both themes', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1000, 1001, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/app/tasks')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.getByRole('navigation', { name: 'Nawigacja aplikacji' })).toHaveCount(
      width > 1000 ? 1 : 0,
    )
  }
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme })
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/app/projects')
      await page.evaluate(() => document.fonts.ready)
      let result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(result.violations).toEqual([])
      if (width < 1001) {
        await page.getByRole('button', { name: 'Otwórz menu aplikacji' }).click()
        await expect(page.getByRole('dialog')).toHaveCSS('opacity', '1')
        result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        expect(result.violations).toEqual([])
      }
    }
  }
})
