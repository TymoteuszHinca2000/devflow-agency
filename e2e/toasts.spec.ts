import { test as base, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

// This fixture is served only by this test's Vite instance, never by the production build.
const fixtureHtml = `<!doctype html><html lang="pl"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Kontrola toastów</title></head><body><div id="fixture"></div>
  <script type="module">
    import { createElement as h } from 'react'
    import { createRoot } from 'react-dom/client'
    import { ThemeProvider } from '/src/lib/theme/theme-provider.tsx'
    import { Toaster } from '/src/components/ui/sonner.tsx'
    import { notify } from '/src/lib/notify.ts'
    import '/src/styles/globals.css'
    let counter = 0
    createRoot(document.getElementById('fixture')).render(h(ThemeProvider, null,
      h('main', null, h('h1', null, 'Kontrola toastów'),
        h('button', {onClick: () => notify('Powiadomienie testowe ' + ++counter, {kind: 'warning'})}, 'Pokaż kolejne powiadomienie'),
        h('button', {onClick: () => notify('Komunikat testowy z akcją', {
          description: Array(18).fill('Dłuższy opis do kontroli przewijania.').join(' '),
          action: {label: 'Wykonaj akcję', onClick: () => {document.getElementById('result').textContent = 'Akcja wykonana'}}
        })}, 'Pokaż długi komunikat'),
        h('output', {id: 'result', 'aria-live': 'polite'}, 'Oczekiwanie na akcję')
      ), h(Toaster)
    ))
  </script></body></html>`

const test = base.extend({
  baseURL: async ({ browserName }, provideBaseURL, testInfo) => {
    const root = fileURLToPath(new URL('..', import.meta.url))
    const server = await createServer({
      root,
      configFile: `${root}/vite.config.ts`,
      cacheDir: `${root}/node_modules/.cache/toast-e2e-${browserName}-${testInfo.workerIndex}`,
      logLevel: 'error',
      server: { host: '127.0.0.1', port: 0, strictPort: true, hmr: false },
      plugins: [
        {
          name: 'toast-test-fixture',
          configureServer(server) {
            server.middlewares.use((request, response, next) => {
              if (request.url !== '/__toast-fixture') return next()
              void server.transformIndexHtml(request.url, fixtureHtml).then((html) => {
                response.setHeader('Content-Type', 'text/html')
                response.end(html)
              }, next)
            })
          },
        },
      ],
    })
    try {
      await server.listen()
      const address = server.httpServer?.address()
      if (!address || typeof address === 'string') throw new Error('Toast fixture has no TCP port.')
      await provideBaseURL(`http://127.0.0.1:${address.port}`)
    } finally {
      await server.close()
    }
  },
})

test('keeps the notification queue reachable when the viewport becomes short', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/__toast-fixture')
  const trigger = page.getByRole('button', { name: 'Pokaż kolejne powiadomienie' })
  await trigger.focus()
  for (let count = 0; count < 4; count++) await page.keyboard.press('Enter')
  const region = page.getByRole('region', { name: 'Powiadomienia (Alt+T)' })
  await expect(region.getByRole('listitem')).toHaveCount(3)
  await page.keyboard.press('Alt+KeyT')
  await region.getByRole('listitem').nth(1).getByRole('button').focus()
  await page.setViewportSize({ width: 640, height: 360 })
  await expect(region.getByRole('listitem')).toHaveCount(1)
  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.activeElement
        return (
          active instanceof HTMLElement &&
          active !== document.body &&
          getComputedStyle(active).visibility !== 'hidden'
        )
      }),
    )
    .toBe(true)
  await page.setViewportSize({ width: 320, height: 256 })
  for (let remaining = 4; remaining > 0; remaining--) {
    const current = region.getByRole('listitem')
    await expect(current).toHaveCount(1)
    await expect(current).toContainText(`Powiadomienie testowe ${remaining}`)
    await page.keyboard.press('Alt+KeyT')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    const close = current.getByRole('button', { name: 'Zamknij powiadomienie' })
    await expect(close).toBeFocused()
    await expect(close).toBeInViewport()
    await page.keyboard.press('Enter')
  }
  await expect(region.getByRole('listitem')).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('allows a long notification to scroll to its action on a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 256 })
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
  await page.goto('/__toast-fixture')
  const trigger = page.getByRole('button', { name: 'Pokaż długi komunikat' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const notice = page.getByRole('listitem')
  await expect(notice).toHaveAttribute('data-mounted', 'true')
  const box = await notice.boundingBox()
  expect(box).not.toBeNull()
  expect(box?.y).toBeGreaterThanOrEqual(0)
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(256)
  await page.keyboard.press('Alt+KeyT')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  const action = notice.getByRole('button', { name: 'Wykonaj akcję' })
  await expect(action).toBeFocused()
  await expect(action).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toHaveText('Akcja wykonana')
  await expect(notice).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
