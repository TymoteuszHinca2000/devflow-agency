import { build } from 'vite'
import { authTestUrl, authTestKey } from './auth-config.ts'

// Dedicated artifact: E2E can run offline and never sends credentials to a real project.
await build({
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(authTestUrl),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(authTestKey),
  },
  build: { outDir: 'dist-e2e' },
})
