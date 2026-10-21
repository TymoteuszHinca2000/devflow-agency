import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

async function openThemeSelector(page: Page) {
  const selector = page.getByRole('combobox', { name: 'Motyw kolorystyczny' })
  if (!(await selector.isVisible()))
    await page.getByRole('button', { name: 'Otwórz nawigację' }).click()
  return selector
}

test('manual choices override the system, persist after reload and update the page colors', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  const selector = await openThemeSelector(page)
  await selector.selectOption('light')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(246, 248, 246)')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f6f8f6')
  await page.reload()
  await expect(await openThemeSelector(page)).toHaveValue('light')
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light')

  await page.emulateMedia({ colorScheme: 'light' })
  await (await openThemeSelector(page)).selectOption('dark')
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(17, 27, 21)')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#111b15')
  await page.reload()
  await expect(await openThemeSelector(page)).toHaveValue('dark')
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
})

test('system mode follows live system changes and can replace a saved manual choice', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const selector = await openThemeSelector(page)
  await selector.selectOption('dark')
  await selector.selectOption('system')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(await openThemeSelector(page)).toHaveValue('system')
})

test('the selector works with the keyboard and keeps focus', async ({ page }) => {
  await page.goto('/')
  const selector = await openThemeSelector(page)
  await selector.focus()
  await page.keyboard.press('ArrowUp')
  await expect(selector).toHaveValue('dark')
  await expect(selector).toBeFocused()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.keyboard.press('ArrowUp')
  await expect(selector).toHaveValue('light')
  await expect(selector).toBeFocused()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('theme changes still work when browser storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem']) {
      Object.defineProperty(Storage.prototype, method, {
        value: () => {
          throw new DOMException('Storage is blocked', 'SecurityError')
        },
      })
    }
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const selector = await openThemeSelector(page)
  await expect(selector).toHaveValue('system')
  await selector.selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(17, 27, 21)')
  expect(errors).toEqual([])
})

test('ignores invalid saved preferences and follows the system', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('devflow-theme', 'invalid-value'))
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await expect(await openThemeSelector(page)).toHaveValue('system')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('synchronizes preference changes and removal between open tabs', async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  const otherTab = await context.newPage()
  await otherTab.emulateMedia({ colorScheme: 'dark' })
  await otherTab.goto(page.url())
  await (await openThemeSelector(page)).selectOption('light')
  await expect(otherTab.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(await openThemeSelector(otherTab)).toHaveValue('light')
  await page.evaluate(() => localStorage.removeItem('devflow-theme'))
  await expect(otherTab.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(await openThemeSelector(otherTab)).toHaveValue('system')
})

for (const preference of ['light', 'dark'] as const) {
  test(`applies saved ${preference} mode before the React application loads`, async ({ page }) => {
    await page.addInitScript((saved) => localStorage.setItem('devflow-theme', saved), preference)
    await page.emulateMedia({ colorScheme: preference === 'dark' ? 'light' : 'dark' })
    await page.route('**/assets/*.js', (route) => route.abort())
    await page.goto('/')
    await expect(page.locator('#root')).toBeEmpty()
    await expect(page.locator('html')).toHaveAttribute('data-theme', preference)
    await expect(page.locator('html')).toHaveCSS('color-scheme', preference)
  })
}
