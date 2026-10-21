import { test as base } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'
import { installAuthFixture } from './auth-fixture'
import type { AuthScenario } from './auth-fixture'

export { expect } from '@playwright/test'

export const test = base.extend<{ authState: AuthScenario; _authApi: void }>({
  authState: ['signed-out', { option: true }],
  _authApi: [
    async ({ context, authState }, provide) => {
      await installAuthFixture(context, authState)
      await provide()
    },
    { auto: true },
  ],
  // Own the server in this process so teardown doesn't depend on Windows taskkill.
  baseURL: async ({}, provideBaseURL) => {
    const server = await preview({
      configFile: false,
      root: fileURLToPath(new URL('..', import.meta.url)),
      logLevel: 'error',
      build: { outDir: 'dist-e2e' },
      preview: { host: '127.0.0.1', port: 0, strictPort: true },
    })

    try {
      const address = server.httpServer.address()
      if (!address || typeof address === 'string')
        throw new Error('Preview server has no TCP port.')
      await provideBaseURL(`http://127.0.0.1:${address.port}`)
    } finally {
      await server.close()
    }
  },
})
