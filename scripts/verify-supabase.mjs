import { existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { readSupabaseConfiguration } from '../src/lib/supabase/config.ts'

// Read-only live probe. Intentionally excluded from offline `npm run check`.
if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const configuration = readSupabaseConfiguration(process.env)
const client = createClient(configuration.url, configuration.publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: {
    fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15_000) }),
  },
})
const tables = [
  'profiles',
  'organizations',
  'organization_members',
  'organization_invitations',
  'clients',
  'projects',
  'project_members',
  'tasks',
  'task_comments',
  'time_entries',
  'quotes',
  'quote_items',
  'attachments',
  'notifications',
  'activity_logs',
]

try {
  const auth = await fetch(`${configuration.url}/auth/v1/settings`, {
    headers: { apikey: configuration.publishableKey },
    signal: AbortSignal.timeout(15_000),
  })
  if (!auth.ok) throw new Error(`Auth settings: HTTP ${auth.status}`)
  const settings = await auth.json()
  if (!settings || typeof settings.external?.email !== 'boolean') {
    throw new Error('Unexpected Auth settings response')
  }
  console.log('PASS Auth HTTP: public project configuration is accepted.')

  let failures = 0
  for (const table of tables) {
    const { data, error, status } = await client.from(table).select('id').limit(1)
    if (data === null && error?.code === '42501' && [401, 403].includes(status)) {
      console.log(`PASS Data API: anonymous access to ${table} is denied.`)
    } else {
      failures++
      const code = /^[A-Z0-9_]+$/.test(error?.code ?? '') ? error.code : 'unexpected-response'
      console.error(`FAIL Data API: ${table}, HTTP ${status}, ${code}.`)
    }
  }
  if (failures) {
    console.error(
      `${failures} checks failed. Verify that the reviewed migrations are applied to the development project.`,
    )
    process.exitCode = 1
  } else {
    console.log(
      'PASS All 15 application tables reject anonymous reads. No data or accounts were created.',
    )
    console.log(
      'Authenticated RLS and physical Storage uploads require separate development integration tests.',
    )
  }
} catch {
  console.error(
    'Supabase live verification failed. Check network access, public configuration and migration status. Credentials and response bodies are not logged.',
  )
  process.exitCode = 1
} finally {
  await client.auth.stopAutoRefresh()
}
