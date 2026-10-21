import { test as base } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'

export { expect } from '@playwright/test'

export const test = base.extend({
  // Own the server in this process so teardown doesn't depend on Windows taskkill.
  baseURL: async ({}, provideBaseURL) => {
    const server = await preview({
      configFile: false,
      root: fileURLToPath(new URL('..', import.meta.url)),
      logLevel: 'error',
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
