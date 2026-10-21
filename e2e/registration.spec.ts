import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { test, expect } from './fixtures'
import {
  authTestConfirmationCode,
  authTestEmail,
  authTestPassword,
  authTestStorageKey,
} from './auth-config'

async function register(page: Page, returnTo = '/app/tasks') {
  await page.goto(`/register?${new URLSearchParams({ returnTo })}`)
  await page.getByLabel('Imię lub nazwa').fill('Test Person')
  await page.getByLabel('Adres e-mail').fill(authTestEmail)
  await page.getByLabel('Hasło', { exact: true }).fill(authTestPassword)
  await page.getByLabel('Powtórz hasło', { exact: true }).fill(authTestPassword)
  const request = page.waitForRequest(
    (value) => new URL(value.url()).pathname === '/auth/v1/signup',
  )
  await page.getByRole('button', { name: 'Utwórz konto', exact: true }).click()
  const submitted = await request
  await expect(page.getByRole('heading', { name: 'Sprawdź swoją skrzynkę.' })).toBeVisible()
  const redirect = new URL(submitted.url()).searchParams.get('redirect_to')
  expect(redirect).toBeTruthy()
  const callback = new URL(redirect!)
  callback.searchParams.set('code', authTestConfirmationCode)
  return { submitted, callback }
}

test('registers without a session, confirms through PKCE and does not reuse the consumed link', async ({
  page,
}) => {
  const { submitted, callback } = await register(page)
  const body: unknown = submitted.postDataJSON()
  expect(body).toMatchObject({
    email: authTestEmail,
    password: authTestPassword,
    data: { display_name: 'Test Person' },
    code_challenge_method: 's256',
  })
  expect(body).not.toHaveProperty('confirmPassword')
  expect(body).not.toHaveProperty('role')
  expect(await page.evaluate((key) => localStorage.getItem(key), authTestStorageKey)).toBeNull()
  await expect(page.getByLabel('Adres e-mail')).toHaveValue(authTestEmail)
  const exchanges: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('grant_type=pkce')) exchanges.push(request.url())
  })
  await page.goto(callback.href)
  await expect(page.getByRole('button', { name: 'Dokończ logowanie', exact: true })).toBeVisible()
  await expect(page).toHaveURL(/code=/)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Dokończ logowanie', exact: true })).toBeVisible()
  expect(exchanges).toHaveLength(0)
  await page.getByRole('button', { name: 'Dokończ logowanie', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Zadania i Kanban', exact: true })).toBeVisible()
  expect(exchanges).toHaveLength(1)
  await page.getByRole('button', { name: 'Wyloguj się' }).click()
  await expect(page).toHaveURL(/\/login/)
  await page.goto(callback.href)
  await page.getByRole('button', { name: 'Dokończ logowanie', exact: true }).click()
  await expect(page.getByText(/Nie możemy dokończyć logowania w tej przeglądarce/)).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Moduły aplikacji' })).toHaveCount(0)
})

test('keeps return destinations between auth forms and validates passwords accessibly', async ({
  page,
}) => {
  await page.goto('/app/projects?view=list')
  await page.getByRole('link', { name: 'Utwórz konto', exact: true }).click()
  await expect(page).toHaveURL(/\/register\?returnTo=%2Fapp%2Fprojects%3Fview%3Dlist$/)
  await page.getByRole('button', { name: 'Utwórz konto', exact: true }).click()
  await expect(page.getByLabel('Imię lub nazwa')).toBeFocused()
  await page.getByLabel('Imię lub nazwa').fill('Test')
  await page.getByLabel('Adres e-mail').fill(authTestEmail)
  await page.getByLabel('Hasło', { exact: true }).fill('short')
  await page.getByLabel('Powtórz hasło', { exact: true }).fill('different')
  await page.getByRole('button', { name: 'Utwórz konto', exact: true }).click()
  await expect(page.getByText('Użyj co najmniej 12 znaków.')).toBeVisible()
  await expect(page.getByText('Hasła muszą być takie same.')).toBeVisible()
  await page.getByRole('link', { name: 'Zaloguj się', exact: true }).click()
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fapp%2Fprojects%3Fview%3Dlist$/)
})

test('resends with a fresh PKCE challenge and preserves the cooldown after refresh', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/check-email')
  await page.getByLabel('Adres e-mail').fill(authTestEmail)
  const request = page.waitForRequest(
    (value) => new URL(value.url()).pathname === '/auth/v1/resend',
  )
  await page.getByRole('button', { name: 'Wyślij ponownie' }).click()
  const sent = await request
  expect(sent.postDataJSON()).toMatchObject({
    email: authTestEmail,
    type: 'signup',
    code_challenge_method: 's256',
  })
  await expect(
    page.getByText(/Jeśli adres wymaga potwierdzenia, otrzymasz nową wiadomość/),
  ).toBeFocused()
  await expect(page.getByRole('button', { name: 'Wyślij ponownie' })).toBeDisabled()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Wyślij ponownie' })).toBeDisabled()
  await page.clock.fastForward(61_000)
  await expect(page.getByRole('button', { name: 'Wyślij ponownie' })).toBeEnabled()
  const callback = new URL(new URL(sent.url()).searchParams.get('redirect_to')!)
  callback.searchParams.set('code', authTestConfirmationCode)
  await page.goto(callback.href)
  await page.getByRole('button', { name: 'Dokończ logowanie', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Miejsce na Twój flow.' })).toBeVisible()
})

test('explains an expired code without exposing the server response', async ({ page }) => {
  const { callback } = await register(page)
  callback.searchParams.set('code', 'test-only-expired-code-12345')
  await page.goto(callback.href)
  await page.getByRole('button', { name: 'Dokończ logowanie', exact: true }).click()
  await expect(page.getByText(/Ten link wygasł lub został już wykorzystany/)).toBeVisible()
  await expect(page.getByRole('alert')).toBeFocused()
  await expect(page).toHaveTitle('Sprawdź swój link. — DevFlow Agency')
  await expect(page.locator('body')).not.toContainText('Test-only expired code detail')
  await page.getByRole('link', { name: 'Poproś o nowy link' }).click()
  await expect(page.getByRole('heading', { name: 'Sprawdź swoją skrzynkę.' })).toBeVisible()
})

test('removes raw callback errors and rejects implicit or external destinations', async ({
  page,
}) => {
  await page.goto(
    '/auth/confirm?returnTo=https%3A%2F%2Fevil.example%2Fapp#error=access_denied&error_description=PRIVATE-DETAIL',
  )
  await expect(page.getByRole('heading', { name: 'Sprawdź swój link.' })).toBeVisible()
  await expect(page).toHaveURL(/\/auth\/confirm\?returnTo=%2Fapp$/)
  await expect(page.locator('body')).not.toContainText('PRIVATE-DETAIL')
  await page.goto('/auth/confirm#access_token=test-only-unsupported-token')
  await expect(page.getByRole('heading', { name: 'Sprawdź swój link.' })).toBeVisible()
  await expect(page).not.toHaveURL(/access_token/)
})

test('offers password login or a new email when the browser has no PKCE verifier', async ({
  page,
}) => {
  await page.goto(`/auth/confirm?code=${authTestConfirmationCode}`)
  await page.getByRole('button', { name: 'Dokończ logowanie', exact: true }).click()
  await expect(page.getByText(/Nie możemy dokończyć logowania w tej przeglądarce/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Wróć do logowania' })).toBeVisible()
})

test('confirms in a new tab and synchronizes the verified session with the registration tab', async ({
  page,
  context,
}) => {
  const { callback } = await register(page)
  const confirmationTab = await context.newPage()
  await confirmationTab.goto(callback.href)
  await confirmationTab.getByRole('button', { name: 'Dokończ logowanie', exact: true }).click()
  await expect(
    confirmationTab.getByRole('heading', { name: 'Zadania i Kanban', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Zadania i Kanban', exact: true })).toBeVisible()
})

test.describe('unconfirmed account', () => {
  test.use({ authState: 'unconfirmed' })
  test('keeps unconfirmed accounts out and provides a path to resend', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Adres e-mail').fill(authTestEmail)
    await page.getByLabel('Hasło', { exact: true }).fill(authTestPassword)
    await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click()
    await expect(page.getByRole('alert')).toHaveText(
      'Potwierdź adres e-mail, zanim się zalogujesz.',
    )
    await page.getByRole('link', { name: 'Potwierdź adres e-mail', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Sprawdź swoją skrzynkę.' })).toBeVisible()
  })
})

test.describe('email rate limit', () => {
  test.use({ authState: 'signup-limited' })
  test('shows safe feedback and allows correction after a refused registration', async ({
    page,
  }) => {
    await page.goto('/register')
    await page.getByLabel('Imię lub nazwa').fill('Test')
    await page.getByLabel('Adres e-mail').fill(authTestEmail)
    await page.getByLabel('Hasło', { exact: true }).fill(authTestPassword)
    await page.getByLabel('Powtórz hasło', { exact: true }).fill(authTestPassword)
    await page.getByRole('button', { name: 'Utwórz konto', exact: true }).click()
    await expect(page.getByRole('alert')).toHaveText(
      'Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.',
    )
    await expect(page.getByRole('alert')).toBeFocused()
    await expect(page.getByRole('button', { name: 'Utwórz konto', exact: true })).toBeEnabled()
    await expect(page.locator('body')).not.toContainText('Test-only private rate limit detail')
  })
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`keeps registration and confirmation pages accessible and within compact screens in ${colorScheme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
    for (const path of [
      '/register',
      '/check-email',
      '/auth/confirm',
      `/auth/confirm?code=${authTestConfirmationCode}`,
    ]) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      if (path === '/register')
        await expect(page.getByRole('button', { name: 'Utwórz konto', exact: true })).toBeVisible()
      if (path === '/check-email')
        await expect(page.getByRole('button', { name: 'Wyślij ponownie' })).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(result.violations).toEqual([])
      await page.setViewportSize({ width: 320, height: 640 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    }
  })
}
