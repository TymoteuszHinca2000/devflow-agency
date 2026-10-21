import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './fixtures'
import { authTestEmail, authTestPassword, authTestStorageKey, authTestUrl } from './auth-config'

test('redirects a private deep link to login and restores it after verified sign-in', async ({
  page,
}) => {
  await page.goto('/app/projects?view=list#work')
  await expect(page).toHaveURL(/\/login\?returnTo=/)
  await expect(page.getByRole('heading', { level: 1, name: 'Zaloguj się.' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Moduły aplikacji' })).toHaveCount(0)
  await page.getByLabel('Adres e-mail').fill(authTestEmail)
  await page.getByLabel('Hasło', { exact: true }).fill(authTestPassword)
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/projects\?view=list#work$/)
  await expect(page.getByRole('heading', { name: 'Projekty', exact: true })).toBeVisible()
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page).toHaveTitle('Projekty — DevFlow Agency')
})

test('validates accessibly, hides password by default and shows safe invalid-credential feedback', async ({
  page,
}) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click()
  await expect(page.getByLabel('Adres e-mail')).toBeFocused()
  await expect(page.getByText('Wpisz poprawny adres e-mail.')).toBeVisible()
  await expect(page.getByText('Wpisz hasło.')).toBeVisible()
  await page.getByLabel('Adres e-mail').fill(authTestEmail)
  const password = page.getByLabel('Hasło', { exact: true })
  await password.fill('wrong-test-only-password')
  await expect(password).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Pokaż hasło' }).click()
  await expect(password).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Ukryj hasło' }).click()
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('Nieprawidłowy adres e-mail lub hasło.')
  await expect(page.getByRole('alert')).toBeFocused()
  await expect(page.locator('body')).not.toContainText('Test-only invalid credentials')
})

test('keeps a successful login across refresh, logs out and blocks browser back navigation', async ({
  page,
}) => {
  await page.goto('/login')
  await page.getByLabel('Adres e-mail').fill(authTestEmail)
  await page.getByLabel('Hasło', { exact: true }).fill(authTestPassword)
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click()
  await expect(page).toHaveURL(/\/app$/)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Miejsce na Twój flow.' })).toBeVisible()
  // Keep a private page in history so Back genuinely revisits it after logout.
  await page.goto('/app/projects')
  await expect(page.getByRole('heading', { name: 'Projekty', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Wyloguj się' }).click()
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
  expect(await page.evaluate((key) => localStorage.getItem(key), authTestStorageKey)).toBeNull()
  await page.goBack()
  await expect(page).toHaveURL(/\/login\?returnTo=/)
  await expect(page.getByRole('navigation', { name: 'Moduły aplikacji' })).toHaveCount(0)
  await page.goto('/app/tasks')
  await expect(page).toHaveURL(/\/login\?returnTo=/)
  await expect(page.getByRole('heading', { name: 'Zadania i Kanban', exact: true })).toHaveCount(0)
})

test('rejects an external post-login destination', async ({ page }) => {
  await page.goto('/login?returnTo=https%3A%2F%2Fattacker.example%2Fapp')
  await page.getByLabel('Adres e-mail').fill(authTestEmail)
  await page.getByLabel('Hasło', { exact: true }).fill(authTestPassword)
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click()
  await expect(page).toHaveURL(/\/app$/)
})

test.describe('rejected stored identity', () => {
  test.use({ authState: 'rejected' })
  test('does not trust the user stored alongside a rejected token', async ({ page }) => {
    await page.goto('/app/projects')
    await expect(page).toHaveURL(/\/login\?returnTo=/)
    await expect(page.getByText('Sesja wygasła. Zaloguj się ponownie.')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Moduły aplikacji' })).toHaveCount(0)
  })
})

test.describe('expired session', () => {
  test.use({ authState: 'expired' })
  test('uses SDK refresh before verifying the renewed session', async ({ page }) => {
    const refreshes: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('grant_type=refresh_token')) refreshes.push(request.url())
    })
    await page.goto('/app/projects')
    await expect(page.getByRole('heading', { name: 'Projekty', exact: true })).toBeVisible()
    expect(refreshes).toHaveLength(1)
  })
})

test.describe('network failure', () => {
  test.use({ authState: 'offline' })
  test('shows a recoverable error instead of private content and retries verification', async ({
    page,
    context,
  }) => {
    await page.goto('/app/projects')
    await expect(page.getByRole('heading', { name: 'Nie udało się sprawdzić sesji.' })).toBeVisible(
      { timeout: 20_000 },
    )
    await expect(page.getByRole('navigation', { name: 'Moduły aplikacji' })).toHaveCount(0)
    await context.unroute(`${authTestUrl}/**`)
    const { installAuthFixture } = await import('./auth-fixture')
    await installAuthFixture(context, 'signed-in')
    await page.getByRole('button', { name: 'Spróbuj ponownie' }).click()
    await expect(page.getByRole('heading', { name: 'Projekty', exact: true })).toBeVisible()
  })
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`keeps the login form accessible, keyboard usable and within the viewport in ${colorScheme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Zaloguj się.' })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(result.violations).toEqual([])
    await page.setViewportSize({ width: 320, height: 640 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Przejdź do treści' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
  })
}
