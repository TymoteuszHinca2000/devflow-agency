import { expect, test } from './fixtures'
test.use({ authState: 'signed-in' })

test('explains planned content through the shared state and keeps its recovery links keyboard accessible', async ({
  page,
}) => {
  await page.goto('/app/projects')
  const state = page.getByRole('region', { name: 'Ten moduł jest w planie.' })
  await expect(state).toHaveAccessibleDescription(/Jego funkcje powstaną w kolejnych etapach/)
  await expect(state.getByRole('heading', { level: 2 })).toHaveText('Ten moduł jest w planie.')
  await expect(page.getByRole('status')).toHaveCount(0)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(state.getByRole('link', { name: 'Wszystkie moduły' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/app$/)
  await page
    .getByRole('navigation', { name: 'Moduły aplikacji' })
    .getByRole('link', { name: /Wyceny/ })
    .click()
  await expect(page.getByRole('heading', { level: 1, name: 'Wyceny', exact: true })).toBeVisible()
  await expect(state).toBeVisible()
  await state.getByRole('link', { name: 'Zobacz plan rozwoju' }).click()
  await expect(page).toHaveURL(/\/#plan-rozwoju$/)
  await expect(page.locator('#plan-rozwoju')).toBeFocused()
})
