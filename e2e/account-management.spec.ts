import AxeBuilder from '@axe-core/playwright'
import { test, expect } from './fixtures'
import { installAccountFixture } from './account-fixture'
import { authTestConfirmationCode, authTestEmail, authTestPassword } from './auth-config'
import type { Page } from '@playwright/test'

async function requestRecovery(page: Page) {
  await page.goto('/forgot-password')
  await page.getByLabel('Adres e-mail').fill(authTestEmail)
  const request = page.waitForRequest(
    (value) => new URL(value.url()).pathname === '/auth/v1/recover',
  )
  await page.getByRole('button', { name: 'Wyślij link do zmiany hasła', exact: true }).click()
  const sent = await request
  await expect(page.getByText(/Jeśli konto o tym adresie istnieje/)).toBeVisible()
  expect(sent.postDataJSON()).toMatchObject({ email: authTestEmail, code_challenge_method: 's256' })
  const url = new URL(new URL(sent.url()).searchParams.get('redirect_to')!)
  expect(url.pathname).toBe('/auth/recovery')
  url.searchParams.set('code', authTestConfirmationCode)
  return url
}

test('recovers with a single PKCE exchange, resets the password and logs in with it', async ({
  page,
  context,
}) => {
  await installAccountFixture(context)
  const url = await requestRecovery(page)
  await page.goto(url.href)
  await page.reload()
  await page.getByRole('button', { name: 'Kontynuuj zmianę hasła' }).click()
  await expect(page.getByRole('heading', { name: 'Ustaw nowe hasło.' })).toBeVisible()
  await expect(page).not.toHaveURL(/code=/)
  const newPassword = 'new-test-only-password'
  await page.getByLabel('Nowe hasło', { exact: true }).fill(newPassword)
  await page.getByLabel('Powtórz nowe hasło').fill(newPassword)
  await page.getByRole('button', { name: 'Zapisz nowe hasło' }).click()
  await expect(page.getByText(/Hasło zostało zmienione/)).toBeFocused()
  await page.getByRole('link', { name: 'Przejdź do swojego konta' }).click()
  await page.getByRole('button', { name: 'Wyloguj się' }).click()
  await page.getByLabel('Adres e-mail').fill(authTestEmail)
  await page.getByLabel('Hasło', { exact: true }).fill(newPassword)
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Twoja przestrzeń. Twój profil.' })).toBeVisible()
})

test('resumes verified recovery after a clean-URL reload and never exchanges the code twice', async ({
  page,
}) => {
  const url = await requestRecovery(page)
  await page.goto(url.href)
  await page.getByRole('button', { name: 'Kontynuuj zmianę hasła' }).click()
  await expect(page.getByLabel('Nowe hasło', { exact: true })).toBeVisible()
  const exchanges: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('grant_type=pkce')) exchanges.push(request.url())
  })
  await page.reload()
  await expect(page.getByLabel('Nowe hasło', { exact: true })).toBeVisible()
  expect(exchanges).toHaveLength(0)
})

test('rejects missing verifiers, expired codes and implicit recovery tokens safely', async ({
  page,
}) => {
  await page.goto(`/auth/recovery?code=${authTestConfirmationCode}`)
  await page.getByRole('button', { name: 'Kontynuuj zmianę hasła' }).click()
  await expect(page.getByRole('heading', { name: 'Sprawdź swój link.' })).toBeVisible()
  await expect(page.getByLabel('Nowe hasło', { exact: true })).toHaveCount(0)
  await page.goto('/auth/recovery#access_token=PRIVATE&refresh_token=PRIVATE&type=recovery')
  await expect(page).not.toHaveURL(/PRIVATE/)
  await expect(page.locator('body')).not.toContainText('PRIVATE')
  const url = await requestRecovery(page)
  url.searchParams.set('code', 'expired-test-only-code')
  await page.goto(url.href)
  await page.getByRole('button', { name: 'Kontynuuj zmianę hasła' }).click()
  await expect(page.getByRole('alert')).toContainText('Ten link wygasł')
})

test('preserves the reset-email cooldown on refresh and keeps the response neutral', async ({
  page,
}) => {
  await page.clock.install()
  await requestRecovery(page)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Wyślij link do zmiany hasła' })).toBeDisabled()
  await page.clock.fastForward(61_000)
  await expect(page.getByRole('button', { name: 'Wyślij link do zmiany hasła' })).toBeEnabled()
})

test.describe('authenticated account', () => {
  test.use({ authState: 'signed-in' })
  test('does not offer a reset form for a regular password session', async ({ page }) => {
    await page.goto('/auth/recovery')
    await expect(page.getByRole('heading', { name: 'Sprawdź swój link.' })).toBeVisible()
    await expect(page.getByLabel('Nowe hasło', { exact: true })).toHaveCount(0)
  })
  test('saves and reloads the profile, changes the password only after verification', async ({
    page,
    context,
  }) => {
    const api = await installAccountFixture(context)
    await page.goto('/app')
    await page.getByRole('link', { name: 'Moje konto', exact: true }).click()
    await page.getByLabel('Imię lub nazwa').fill('Updated Person')
    await page.getByRole('button', { name: 'Zapisz profil', exact: true }).click()
    await expect(page.getByText('Profil został zapisany.')).toBeFocused()
    expect(api.readProfile().display_name).toBe('Updated Person')
    await page.reload()
    await expect(page.getByLabel('Imię lub nazwa')).toHaveValue('Updated Person')
    await page.getByLabel('Obecne hasło').fill('wrong-password')
    await page.getByLabel('Nowe hasło', { exact: true }).fill('new-test-only-password')
    await page.getByLabel('Powtórz nowe hasło').fill('new-test-only-password')
    await page.getByRole('button', { name: 'Zapisz nowe hasło' }).click()
    await expect(page.getByRole('alert')).toContainText('Nieprawidłowy adres e-mail lub hasło.')
    await page.getByLabel('Obecne hasło').fill(authTestPassword)
    await page.getByRole('button', { name: 'Zapisz nowe hasło' }).click()
    await expect(page.getByText(/Hasło zostało zmienione/)).toBeFocused()
  })
  test('validates, uploads, displays and removes a private raster avatar', async ({
    page,
    context,
  }) => {
    const api = await installAccountFixture(context)
    await page.goto('/app/account')
    const input = page.getByLabel('Zdjęcie profilowe')
    await input.setInputFiles({
      name: 'disguised.png',
      mimeType: 'image/png',
      buffer: Buffer.from('<svg/>'),
    })
    await page.getByRole('button', { name: 'Zapisz profil', exact: true }).click()
    await expect(page.getByRole('alert')).toHaveText('Zawartość pliku nie pasuje do typu obrazu.')
    expect(api.objectCount()).toBe(0)
    const png = await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      canvas.width = 16
      canvas.height = 16
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#276b4b'
      ctx.fillRect(0, 0, 16, 16)
      return canvas.toDataURL('image/png').split(',')[1]
    })
    await input.setInputFiles({
      name: '../../test-avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from(png, 'base64'),
    })
    await page.getByRole('button', { name: 'Zapisz profil', exact: true }).click()
    await expect(page.getByText('Profil został zapisany.')).toBeVisible()
    await expect(page.getByRole('img', { name: 'Twój awatar' })).toBeVisible()
    expect(api.objectCount()).toBe(1)
    expect(api.readProfile().avatar_path).toMatch(/^[0-9a-f-]+\/[0-9a-f-]+\.png$/)
    await page.getByRole('button', { name: 'Usuń awatar' }).click()
    await page.getByRole('button', { name: 'Zapisz profil', exact: true }).click()
    await expect(page.getByRole('img', { name: 'Twój awatar' })).toHaveCount(0)
    expect(api.objectCount()).toBe(0)
    expect(api.readProfile().avatar_path).toBeNull()
  })
  test('explains concurrent profile writes without overwriting unsaved input', async ({
    page,
    context,
  }) => {
    await installAccountFixture(context, { conflict: true })
    await page.goto('/app/account')
    await page.getByLabel('Imię lub nazwa').fill('My edit')
    await page.getByRole('button', { name: 'Zapisz profil', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('Profil zmienił się w innej karcie.')
    await expect(page.getByLabel('Imię lub nazwa')).toHaveValue('My edit')
    await page.getByRole('button', { name: 'Odśwież dane' }).click()
    await expect(page.getByLabel('Imię lub nazwa')).toHaveValue('Test Person')
  })
  test('recovers profile loading after a network error', async ({ page, context }) => {
    await page.clock.install()
    await installAccountFixture(context, { offline: true })
    await page.goto('/app/account')
    await expect(page.getByText('Ładowanie profilu…')).toBeVisible()
    await page.clock.fastForward(16_000)
    await expect(page.getByRole('alert')).toContainText('Nie udało się pobrać profilu.')
    await installAccountFixture(context)
    await page.getByRole('button', { name: 'Odśwież dane' }).click()
    await expect(page.getByLabel('Imię lub nazwa')).toHaveValue('Test Person')
  })
  for (const colorScheme of ['light', 'dark'] as const)
    test(`keeps the account accessible and usable at 320px in ${colorScheme} mode`, async ({
      page,
      context,
    }) => {
      await installAccountFixture(context)
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 320, height: 640 })
      await page.goto('/app/account')
      await expect(page.getByLabel('Imię lub nazwa')).toBeVisible()
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(result.violations).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    })
})

test('protects the account route and links recovery from login', async ({ page }) => {
  await page.goto('/app/account')
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fapp%2Faccount$/)
  await page.getByRole('link', { name: 'Nie pamiętasz hasła?' }).click()
  await expect(page.getByRole('heading', { name: 'Nowy początek.' })).toBeVisible()
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
})
