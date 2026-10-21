import { expect, test } from './fixtures'

test('opens the roadmap through the hero and header without leaving the page', async ({
  page,
  isMobile,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Zobacz plan', exact: true }).click()
  await expect(page).toHaveURL(/#plan-rozwoju$/)
  const roadmap = page.getByRole('region', { name: /Dobry flow/ })
  await expect(roadmap.getByRole('heading', { level: 2 })).toBeInViewport()
  const documentLink = roadmap.getByRole('link', { name: /Pełna roadmapa na GitHubie/ })
  await expect(documentLink).toHaveAttribute('href', /\/ROADMAP\.md$/)
  await expect(documentLink).toHaveAttribute('target', '_blank')

  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Nawigacja główna' })
  if (isMobile) await page.getByRole('button', { name: 'Otwórz nawigację' }).click()
  await nav.getByRole('link', { name: 'Plan rozwoju', exact: true }).click()
  await expect(page).toHaveURL(/#plan-rozwoju$/)
  if (isMobile) await expect(nav).toBeHidden()
})

test('marks the verified foundation as ready for review and lets planned areas expand independently', async ({
  page,
}) => {
  await page.goto('/#plan-rozwoju')
  const roadmap = page.getByRole('region', { name: /Dobry flow/ })
  const phases = roadmap.locator('details')
  await expect(phases).toHaveCount(4)
  await expect(roadmap.locator('details[open]')).toHaveCount(1)
  await expect(roadmap.getByText('Gotowe do odbioru', { exact: true })).toBeVisible()
  await expect(
    roadmap.getByText('ETAP 2 zweryfikowany. Kolejny etap po zatwierdzeniu.'),
  ).toBeVisible()
  for (const range of ['Etapy 1–2', 'Etapy 3–5', 'Etapy 6–13', 'Etapy 14–15']) {
    await expect(roadmap.getByText(range)).toBeVisible()
  }

  const workspace = phases.filter({ hasText: 'Twoja przestrzeń pracy' })
  const production = phases.filter({ hasText: 'Gotowe na kolejny krok' })
  await expect(workspace.locator('p')).toBeHidden()
  await workspace.locator('summary').click()
  await expect(workspace.locator('p')).toBeVisible()
  await production.locator('summary').click()
  await expect(production.locator('p')).toBeVisible()
  await expect(workspace.locator('p')).toBeVisible()
  await workspace.locator('summary').click()
  await expect(workspace.locator('p')).toBeHidden()
  await expect(production.locator('p')).toBeVisible()
})

test('expands and collapses roadmap areas with Enter and Space while retaining focus', async ({
  page,
}) => {
  await page.goto('/#plan-rozwoju')
  const roadmap = page.getByRole('region', { name: /Dobry flow/ })
  const current = roadmap.locator('details').filter({ hasText: 'Solidne fundamenty' })
  const currentToggle = current.locator('summary')
  await currentToggle.focus()
  await page.keyboard.press('Enter')
  await expect(current.locator('p')).toBeHidden()
  await expect(currentToggle).toBeFocused()
  await page.keyboard.press('Space')
  await expect(current.locator('p')).toBeVisible()

  await page.keyboard.press('Tab')
  const next = roadmap.locator('details').filter({ hasText: 'Twoja przestrzeń pracy' })
  const nextToggle = next.locator('summary')
  await expect(nextToggle).toBeFocused()
  await page.keyboard.press('Space')
  await expect(next.locator('p')).toBeVisible()
  await expect(nextToggle).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(next.locator('p')).toBeHidden()
  await expect(nextToggle).toBeFocused()
})
